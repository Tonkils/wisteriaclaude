let allAccounts = [];
let currentView = 'table';
let simulation = null;

async function msg(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, ...payload });
}

function fmt(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function engClass(rate) {
  if (rate >= 3) return 'eng-high';
  if (rate >= 1) return 'eng-med';
  return 'eng-low';
}

function getFilters() {
  return {
    minFollowers: parseInt(document.getElementById('fMinFollowers').value) || 0,
    minEng: parseFloat(document.getElementById('fMinEng').value) || 0,
    state: document.getElementById('fState').value.trim().toUpperCase(),
    sort: document.getElementById('fSort').value
  };
}

function applyFilters(accounts) {
  const f = getFilters();
  return accounts
    .filter(a => (a.followers || 0) >= f.minFollowers)
    .filter(a => (a.engagement_rate || 0) >= f.minEng)
    .filter(a => !f.state || (a.state || '').toUpperCase().includes(f.state))
    .sort((a, b) => (b[f.sort] || 0) - (a[f.sort] || 0));
}

function renderTable(accounts) {
  const filtered = applyFilters(accounts);
  const empty = document.getElementById('emptyState');
  const table = document.getElementById('dataTable');
  const tbody = document.getElementById('tableBody');

  if (filtered.length === 0) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';
  tbody.innerHTML = filtered.map(a => {
    const loc = [a.city, a.state, a.country].filter(Boolean).join(', ') || '—';
    const locHint = a.location_source === 'bio_inferred' ? ' *' : '';
    return `
      <tr>
        <td class="username-cell">
          <a href="https://www.instagram.com/${a.username}/" target="_blank">@${a.username}</a>
        </td>
        <td>${fmt(a.followers)}</td>
        <td class="${engClass(a.engagement_rate)}">${(a.engagement_rate || 0).toFixed(2)}%</td>
        <td>${fmt(a.avg_video_views)}</td>
        <td>${fmt(a.avg_likes)}</td>
        <td>${fmt(a.post_count)}</td>
        <td class="location-cell">${loc}${locHint}</td>
        <td>${a.email || '—'}</td>
        <td>${a.verified === 'Yes' ? '<span class="verified-yes">✓ Yes</span>' : 'No'}</td>
        <td>${a.last_post_date || '—'}</td>
      </tr>`;
  }).join('');
}

function updateSummary(accounts) {
  const total = accounts.length;
  const withEmail = accounts.filter(a => a.email).length;
  const avgEng = total > 0
    ? (accounts.reduce((s, a) => s + (a.engagement_rate || 0), 0) / total).toFixed(2)
    : '0.00';
  const states = [...new Set(accounts.map(a => a.state).filter(Boolean))].length;
  document.getElementById('statSummary').innerHTML =
    `<span>Accounts: <strong>${total}</strong></span>` +
    `<span>Avg engagement: <strong>${avgEng}%</strong></span>` +
    `<span>With email: <strong>${withEmail}</strong></span>` +
    `<span>States detected: <strong>${states}</strong></span>` +
    `<small style="color:#444">* = location inferred from bio</small>`;
}

// --- D3 Network Graph ---

function renderGraph(accounts) {
  const filtered = applyFilters(accounts);
  const svg = d3.select('#graphSvg');
  svg.selectAll('*').remove();

  if (filtered.length === 0) return;

  const width = document.getElementById('graphSvg').clientWidth;
  const height = document.getElementById('graphSvg').clientHeight;

  // Build nodes: account nodes + location nodes.
  const accountNodes = filtered.map(a => ({
    id: a.username,
    type: 'account',
    data: a,
    followers: a.followers || 0,
    engRate: a.engagement_rate || 0
  }));

  // Unique locations from accounts.
  const locationMap = new Map();
  filtered.forEach(a => {
    if (a.city) {
      const key = `${a.city}, ${a.state || a.country}`.trim().replace(/^,\s*/, '');
      if (!locationMap.has(key)) locationMap.set(key, { id: key, type: 'city', count: 0 });
      locationMap.get(key).count++;
    }
    if (a.state && !a.city) {
      const key = a.state;
      if (!locationMap.has(key)) locationMap.set(key, { id: key, type: 'state', count: 0 });
      locationMap.get(key).count++;
    }
  });
  const locationNodes = [...locationMap.values()].filter(l => l.count >= 2); // Only show locations with 2+ accounts.
  const locationSet = new Set(locationNodes.map(l => l.id));

  const nodes = [...accountNodes, ...locationNodes];

  // Edges: account → location.
  const links = [];
  filtered.forEach(a => {
    if (a.city) {
      const key = `${a.city}, ${a.state || a.country}`.trim().replace(/^,\s*/, '');
      if (locationSet.has(key)) {
        links.push({ source: a.username, target: key, type: 'geo' });
      }
    } else if (a.state) {
      if (locationSet.has(a.state)) {
        links.push({ source: a.username, target: a.state, type: 'geo' });
      }
    }
  });

  // Node sizing.
  const maxFollowers = d3.max(accountNodes, d => d.followers) || 1;
  const rScale = d3.scaleSqrt().domain([0, maxFollowers]).range([4, 22]);

  const engColor = (rate) => {
    if (rate >= 3) return '#22c55e';
    if (rate >= 1) return '#f59e0b';
    return '#ef4444';
  };

  // Zoom/pan container.
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.2, 5]).on('zoom', e => g.attr('transform', e.transform)));

  // Links.
  const link = g.append('g').selectAll('line')
    .data(links)
    .join('line')
    .attr('class', d => `link${d.type === 'geo' ? ' geo-link' : ''}`)
    .attr('stroke', d => d.type === 'geo' ? '#4c1d95' : '#333')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-dasharray', d => d.type === 'geo' ? '3,2' : null);

  // Nodes.
  const node = g.append('g').selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

  // Account nodes = circles.
  node.filter(d => d.type === 'account')
    .append('circle')
    .attr('r', d => rScale(d.followers))
    .attr('fill', d => engColor(d.engRate))
    .attr('fill-opacity', 0.85)
    .attr('stroke', '#0d0d0d')
    .attr('stroke-width', 1.5);

  // Location nodes = diamonds/rectangles.
  node.filter(d => d.type !== 'account')
    .append('rect')
    .attr('x', -8).attr('y', -8)
    .attr('width', 16).attr('height', 16)
    .attr('rx', 2)
    .attr('fill', '#7c3aed')
    .attr('fill-opacity', 0.9)
    .attr('stroke', '#0d0d0d')
    .attr('stroke-width', 1.5)
    .attr('transform', 'rotate(45)');

  // Labels for location nodes + large account nodes.
  node.append('text')
    .attr('dy', d => d.type === 'account' ? rScale(d.followers) + 10 : 16)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.type === 'account' ? '8px' : '9px')
    .attr('fill', d => d.type === 'account' ? '#aaa' : '#c084fc')
    .text(d => d.type === 'account'
      ? (d.followers > 10000 ? `@${d.id}` : '') // Only label bigger accounts.
      : d.id);

  // Tooltip.
  const tooltip = document.getElementById('tooltip');
  node.on('mouseover', (event, d) => {
    let html = '';
    if (d.type === 'account') {
      const a = d.data;
      html = `<strong>@${a.username}</strong>
        Followers: ${fmt(a.followers)}<br>
        Engagement: ${(a.engagement_rate || 0).toFixed(2)}%<br>
        Avg views: ${fmt(a.avg_video_views)}<br>
        ${[a.city, a.state, a.country].filter(Boolean).join(', ') || 'Location unknown'}<br>
        ${a.email ? `Email: ${a.email}` : ''}`;
    } else {
      html = `<strong>${d.id}</strong>Location node<br>${d.count} account(s) here`;
    }
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.offsetX + 12) + 'px';
    tooltip.style.top = (event.offsetY - 10) + 'px';
  }).on('mousemove', (event) => {
    tooltip.style.left = (event.offsetX + 12) + 'px';
    tooltip.style.top = (event.offsetY - 10) + 'px';
  }).on('mouseout', () => {
    tooltip.style.display = 'none';
  });

  // Force simulation.
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(d => d.type === 'account' ? rScale(d.followers) + 4 : 16))
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

// --- Tab switching ---

document.getElementById('tabTable').addEventListener('click', () => {
  currentView = 'table';
  document.getElementById('tabTable').classList.add('active');
  document.getElementById('tabGraph').classList.remove('active');
  document.getElementById('tableView').style.display = 'block';
  document.getElementById('graphView').style.display = 'none';
  renderTable(allAccounts);
});

document.getElementById('tabGraph').addEventListener('click', () => {
  currentView = 'graph';
  document.getElementById('tabGraph').classList.add('active');
  document.getElementById('tabTable').classList.remove('active');
  document.getElementById('tableView').style.display = 'none';
  document.getElementById('graphView').style.display = 'block';
  renderGraph(allAccounts);
});

document.getElementById('btnApplyFilters').addEventListener('click', () => {
  if (currentView === 'table') renderTable(allAccounts);
  else renderGraph(allAccounts);
});

// --- CSV Export ---

document.getElementById('btnExport').addEventListener('click', () => {
  const filtered = applyFilters(allAccounts);
  const headers = [
    'username','followers','following','post_count','avg_likes','avg_comments',
    'avg_video_views','engagement_rate','bio','email','verified','last_post_date',
    'city','state','country','location_source','profile_url','evaluated_at'
  ];
  const rows = [headers, ...filtered.map(a => headers.map(h => {
    const v = a[h] ?? '';
    return typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v;
  }))];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cannabis_accounts_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// --- Load & refresh ---

async function loadData() {
  const state = await msg('GET_STATE');
  allAccounts = state.evaluated || [];
  updateSummary(allAccounts);
  if (currentView === 'table') renderTable(allAccounts);
  else renderGraph(allAccounts);
}

chrome.runtime.onMessage.addListener((m) => {
  if (m.type === 'ACCOUNT_EVALUATED' || m.type === 'PROGRESS') loadData();
});

loadData();
setInterval(loadData, 10000);
