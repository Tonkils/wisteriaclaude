"""
Wisteria Cannabis Account Network Visualizer
Reads account data from Google Sheets, builds a geo-social network graph,
and outputs an interactive HTML visualization via PyVis.

Usage:
  pip install -r requirements.txt
  python instagram_graph.py

First run opens a browser for Google OAuth. Token is cached in token.json.
"""

import json
import os
import sys
from datetime import date
import networkx as nx
from pyvis.network import Network
import gspread
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SPREADSHEET_ID = '1_JDzmZUDyuhwDT61VzDQvjKIN-FTScRS6u5imn8MkXw'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
TOKEN_FILE = 'token.json'
CREDS_FILE = 'credentials.json'


def authenticate():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDS_FILE):
                print(f"ERROR: {CREDS_FILE} not found.")
                print("Download credentials.json from Google Cloud Console:")
                print("  APIs & Services → Credentials → OAuth 2.0 Client → Download JSON")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    return gspread.authorize(creds)


def load_accounts(gc):
    sheet = gc.open_by_key(SPREADSHEET_ID)
    ws = sheet.worksheet('Accounts')
    records = ws.get_all_records()
    print(f"Loaded {len(records)} accounts from Sheets.")
    return records


def load_edges(gc):
    try:
        sheet = gc.open_by_key(SPREADSHEET_ID)
        ws = sheet.worksheet('Edges')
        return ws.get_all_records()
    except Exception:
        return []


def eng_color(rate):
    try:
        r = float(rate)
    except (ValueError, TypeError):
        r = 0
    if r >= 3:
        return '#22c55e'
    elif r >= 1:
        return '#f59e0b'
    return '#ef4444'


def build_graph(accounts, edges):
    G = nx.DiGraph()

    # Add account nodes.
    for a in accounts:
        username = a.get('username', '').strip()
        if not username:
            continue
        followers = int(a.get('followers', 0) or 0)
        eng = float(a.get('engagement_rate', 0) or 0)
        G.add_node(
            username,
            node_type='account',
            followers=followers,
            engagement_rate=eng,
            city=a.get('city', ''),
            state=a.get('state', ''),
            country=a.get('country', ''),
            email=a.get('email', ''),
            verified=a.get('verified', ''),
            avg_video_views=int(a.get('avg_video_views', 0) or 0),
            profile_url=a.get('profile_url', ''),
            label=f"@{username}"
        )

    # Add location nodes and geo edges.
    location_counts = {}
    for a in accounts:
        username = a.get('username', '').strip()
        if not username or username not in G:
            continue
        city = a.get('city', '').strip()
        state = a.get('state', '').strip()
        country = a.get('country', '').strip()

        loc_key = None
        if city and state:
            loc_key = f"{city}, {state}"
        elif state:
            loc_key = state
        elif country:
            loc_key = country

        if loc_key:
            location_counts[loc_key] = location_counts.get(loc_key, 0) + 1

    # Only add location nodes that have 2+ accounts.
    for a in accounts:
        username = a.get('username', '').strip()
        if not username or username not in G:
            continue
        city = a.get('city', '').strip()
        state = a.get('state', '').strip()
        country = a.get('country', '').strip()

        loc_key = None
        if city and state:
            loc_key = f"{city}, {state}"
        elif state:
            loc_key = state
        elif country:
            loc_key = country

        if loc_key and location_counts.get(loc_key, 0) >= 2:
            if loc_key not in G:
                G.add_node(
                    loc_key,
                    node_type='location',
                    count=location_counts[loc_key],
                    label=loc_key
                )
            G.add_edge(username, loc_key, edge_type='geo', weight=0.3)

    # Add social edges from Edges sheet.
    for e in edges:
        src = e.get('from_account', '').strip()
        tgt = e.get('to_account', '').strip()
        etype = e.get('relationship_type', 'follows')
        if src in G and tgt in G:
            G.add_edge(src, tgt, edge_type=etype, weight=1.0)

    return G


def run_community_detection(G):
    try:
        import community as community_louvain
        # Only run on account subgraph.
        account_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'account']
        subgraph = G.subgraph(account_nodes).to_undirected()
        partition = community_louvain.best_partition(subgraph)
        return partition
    except ImportError:
        print("python-louvain not installed. Skipping community detection.")
        return {}


def visualize(G, partition, output_file):
    net = Network(
        height='900px',
        width='100%',
        bgcolor='#0d0d0d',
        font_color='#cccccc',
        directed=True
    )
    net.barnes_hut(gravity=-8000, central_gravity=0.3, spring_length=120, spring_strength=0.02)

    # Community color palette.
    community_colors = [
        '#7c3aed','#0891b2','#dc2626','#d97706','#65a30d',
        '#db2777','#0284c7','#9333ea','#ea580c','#16a34a'
    ]

    max_followers = max((d.get('followers', 0) for _, d in G.nodes(data=True) if d.get('node_type') == 'account'), default=1)

    for node_id, data in G.nodes(data=True):
        node_type = data.get('node_type', 'account')

        if node_type == 'account':
            followers = data.get('followers', 0)
            eng = data.get('engagement_rate', 0)
            size = max(8, min(50, (followers / max_followers) ** 0.5 * 45 + 8))

            community_id = partition.get(node_id, 0)
            base_color = community_colors[community_id % len(community_colors)]

            loc_parts = [data.get('city', ''), data.get('state', ''), data.get('country', '')]
            location_str = ', '.join(p for p in loc_parts if p) or 'Unknown'

            title = (
                f"<b>@{node_id}</b><br>"
                f"Followers: {data.get('followers', 0):,}<br>"
                f"Engagement: {eng:.2f}%<br>"
                f"Avg views: {data.get('avg_video_views', 0):,}<br>"
                f"Location: {location_str}<br>"
                f"Email: {data.get('email', '') or '—'}<br>"
                f"Verified: {data.get('verified', 'No')}"
            )

            net.add_node(
                node_id,
                label=f"@{node_id}",
                title=title,
                size=size,
                color={'background': base_color, 'border': '#0d0d0d', 'highlight': {'background': '#c084fc'}},
                shape='dot',
                font={'size': 9, 'color': '#cccccc'}
            )

        elif node_type == 'location':
            count = data.get('count', 1)
            size = max(14, min(35, count * 3 + 14))
            title = f"<b>{node_id}</b><br>{count} account(s) here"
            net.add_node(
                node_id,
                label=node_id,
                title=title,
                size=size,
                color={'background': '#4c1d95', 'border': '#c084fc'},
                shape='diamond',
                font={'size': 10, 'color': '#c084fc', 'bold': True}
            )

    for src, tgt, data in G.edges(data=True):
        edge_type = data.get('edge_type', 'follows')
        if edge_type == 'geo':
            net.add_edge(src, tgt, color='#4c1d95', width=0.8, dashes=True, title='based in')
        else:
            net.add_edge(src, tgt, color='#333', width=1.2, title=edge_type)

    net.set_options("""
    {
      "physics": {
        "enabled": true,
        "barnesHut": {
          "gravitationalConstant": -8000,
          "centralGravity": 0.3,
          "springLength": 120,
          "springConstant": 0.02,
          "damping": 0.09
        },
        "stabilization": {"iterations": 200}
      },
      "interaction": {
        "hover": true,
        "tooltipDelay": 100,
        "navigationButtons": true
      }
    }
    """)

    net.save_graph(output_file)
    print(f"Graph saved to: {output_file}")


def main():
    print("Wisteria Cannabis Account Network Visualizer")
    print("=" * 44)

    gc = authenticate()
    accounts = load_accounts(gc)
    edges = load_edges(gc)

    if not accounts:
        print("No accounts found in 'Accounts' sheet. Run the extension first.")
        return

    G = build_graph(accounts, edges)
    print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    partition = run_community_detection(G)
    if partition:
        communities = len(set(partition.values()))
        print(f"Communities detected: {communities}")

    output_file = f"cannabis_network_{date.today().isoformat()}.html"
    visualize(G, partition, output_file)

    # Open in browser.
    import webbrowser
    webbrowser.open(f"file://{os.path.abspath(output_file)}")


if __name__ == '__main__':
    main()
