// Wisteria side panel — full dashboard controller.

let allAccounts = [];
let allErrors = [];
let currentTab = 'table';
let feedPaused = false;
let d3Simulation = null;

// ── Messaging ──

async function msg(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, ...payload });
}

// ── Number formatting ──

function fmt(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

function engClass(r) {
  if (r >= 3) return 'eng-high';
  if (r >= 1) return 'eng-med';
  return 'eng-low';
}

// ── Control bar ──

document.getElementById('btnStart').addEventListener('click', async () => {
  await msg('START_EVALUATION');
  await refreshAll();
});

document.getElementById('btnStop').addEventListener('click', async () => {
  await msg('STOP_EVALUATION');
  await refreshAll();
});

// ── Monitor strip ──

const RING_CIRCUMFERENCE = 2 * Math.PI * 20; // r=20 → 125.66

function updateMonitor(state) {
  const { evaluated = [], pending = 0, errors = [], running, currentAccount, sessionCount, dailyCount, evalTimestamps = [], sheetsHealth } = state;
  const total = evaluated.length + pending;
  const pct = total > 0 ? Math.round(evaluated.length / total * 100) : 0;

  // Status dot + current account.
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot' + (running ? ' running' : '');
  const caEl = document.getElementById('currentAccount');
  if (running && currentAccount) {
    caEl.innerHTML = `Evaluating <strong>@${currentAccount}</strong>`;
  } else if (running) {
    caEl.innerHTML = '<strong>Running…</strong>';
  } else {
    caEl.innerHTML = `Stopped — ${evaluated.length} evaluated`;
  }

  // Start/stop buttons.
  document.getElementById('btnStart').style.display = running ? 'none' : '';
  document.getElementById('btnStop').style.display  = running ? '' : 'none';

  // Progress ring.
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
  document.getElementById('progressRingFill').style.strokeDashoffset = offset;
  document.getElementById('progressRingLabel').textContent = pct + '%';

  // Stat pills.
  document.getElementById('statEval').textContent = fmt(evaluated.length);
  document.getElementById('statPending').textContent = fmt(pending);
  document.getElementById('statErrors').textContent = fmt(errors.length);

  // Errors tab label.
  document.getElementById('errorsTabBtn').textContent = `Errors${errors.length ? ` (${errors.length})` : ''}`;

  // Speed / ETA.
  const speedEl = document.getElementById('speedEta');
  if (evalTimestamps.length >= 2) {
    const window = evalTimestamps.slice(-10);
    const elapsed = (window[window.length - 1] - window[0]) / 1000;
    const rate = elapsed > 0 ? ((window.length - 1) / elapsed) * 3600 : 0;
    const etaSec = rate > 0 ? Math.round(pending / (rate / 3600)) : 0;
    const etaStr = etaSec > 3600 ? `~${Math.round(etaSec/3600)}h` : etaSec > 60 ? `~${Math.round(etaSec/60)}m` : `~${etaSec}s`;
    speedEl.textContent = `${rate.toFixed(1)}/hr · ETA ${etaStr} · Session ${sessionCount} · Daily ${dailyCount}`;
  } else {
    speedEl.textContent = running ? `Session ${sessionCount || 0} · Daily ${dailyCount || 0}` : '—';
  }

  // Sheets health.
  const pill = document.getElementById('sheetsHealthPill');
  const h = sheetsHealth || { status: 'unknown' };
  if (h.status === 'ok') {
    pill.className = 'sheets-pill ok';
    pill.textContent = `☁ Synced${h.lastSync ? ' ' + timeAgo(h.lastSync) : ''}`;
    pill.title = `Last sync: ${h.lastSync ? new Date(h.lastSync).toLocaleTimeString() : '—'}`;
  } else if (h.status === 'error') {
    pill.className = 'sheets-pill error';
    pill.textContent = '⚠ Sync error';
    pill.title = h.lastError || '';
  } else {
    pill.className = 'sheets-pill unknown';
    pill.textContent = '☁ Sheets';
    pill.title = '';
  }
}

// ── Activity feed ──

const feedRows = document.getElementById('feedRows');
const feedScroll = document.getElementById('feedScroll');
const MAX_FEED_ROWS = 50;

function appendFeedRow(event) {
  if (feedPaused) return;
  const { kind, username, followers, engagement, errorType, message, timestamp } = event;

  const row = document.createElement('div');
  row.className = 'feed-row';

  const icon = kind === 'success' ? '✓' : '✗';
  const iconColor = kind === 'success' ? '#22c55e' : '#ef4444';
  const metaHtml = kind === 'success'
    ? `<span class="feed-meta">${fmt(followers)} · ${(engagement||0).toFixed(1)}%</span>`
    : `<span class="feed-meta err">${errorType || 'error'}</span>`;

  row.innerHTML = `
    <span class="feed-icon" style="color:${iconColor}">${icon}</span>
    <span class="feed-time">${fmtTime(timestamp)}</span>
    <span class="feed-user">@${username}</span>
    ${metaHtml}`;

  feedRows.insertBefore(row, feedRows.firstChild);

  // Trim old rows.
  while (feedRows.children.length > MAX_FEED_ROWS) {
    feedRows.removeChild(feedRows.lastChild);
  }
}

// Feed toggle collapse.
document.getElementById('feedToggle').addEventListener('click', () => {
  document.getElementById('feedSection').classList.toggle('collapsed');
});

// ── Errors tab ──

function renderErrors(errors) {
  const container = document.getElementById('errorRows');
  const empty = document.getElementById('errorsEmpty');
  if (!errors.length) {
    empty.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = errors.slice().reverse().map(e => `
    <div class="error-row">
      <span class="error-badge badge-${e.errorType || 'unknown'}">${(e.errorType || 'unknown').replace('_', ' ')}</span>
      <span class="error-user">@${e.username}</span>
      <span class="error-time">${fmtTime(e.timestamp)}</span>
      <button class="retry-btn" data-username="${e.username}">Retry</button>
    </div>`).join('');

  container.querySelectorAll('.retry-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const username = btn.dataset.username;
      await msg('RETRY_ACCOUNT', { username });
      await refreshAll();
    });
  });
}

// ── Table ──

function getFilters() {
  return {
    minFollowers: parseInt(document.getElementById('fFollowers').value) || 0,
    minEng: parseFloat(document.getElementById('fEng').value) || 0,
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

  if (!filtered.length) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  table.style.display = 'table';

  tbody.innerHTML = filtered.map(a => {
    const loc = [a.city, a.state].filter(Boolean).join(', ') || (a.country || '—');
    return `<tr>
      <td><a class="user-link" href="https://www.instagram.com/${a.username}/" target="_blank">@${a.username}</a></td>
      <td>${fmt(a.followers)}</td>
      <td class="${engClass(a.engagement_rate)}">${(a.engagement_rate||0).toFixed(2)}%</td>
      <td>${fmt(a.avg_video_views)}</td>
      <td>${fmt(a.avg_likes)}</td>
      <td class="loc-cell">${loc}</td>
      <td>${a.email || '—'}</td>
      <td>${a.verified === 'Yes' ? '✓' : ''}</td>
    </tr>`;
  }).join('');

  // Summary bar.
  const withEmail = accounts.filter(a => a.email).length;
  const avgEng = accounts.length ? (accounts.reduce((s, a) => s + (a.engagement_rate || 0), 0) / accounts.length).toFixed(2) : '0.00';
  const states = [...new Set(accounts.map(a => a.state).filter(Boolean))].length;
  document.getElementById('statBar').innerHTML =
    `Total: <strong>${accounts.length}</strong> &nbsp;
     Showing: <strong>${filtered.length}</strong> &nbsp;
     Avg engagement: <strong>${avgEng}%</strong> &nbsp;
     With email: <strong>${withEmail}</strong> &nbsp;
     States: <strong>${states}</strong>`;
}

document.getElementById('btnFilter').addEventListener('click', () => renderTable(allAccounts));

// ── CSV export ──

document.getElementById('btnExport').addEventListener('click', () => {
  const filtered = applyFilters(allAccounts);
  const headers = ['username','followers','following','post_count','avg_likes','avg_comments','avg_video_views','engagement_rate','bio','email','verified','last_post_date','city','state','country','profile_url','evaluated_at'];
  const rows = [headers, ...filtered.map(a => headers.map(h => {
    const v = a[h] ?? '';
    return typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
  }))];
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = `cannabis_accounts_${new Date().toISOString().split('T')[0]}.csv`;
  el.click();
  URL.revokeObjectURL(url);
});

// ── D3 Graph ──

function renderGraph(accounts) {
  const svg = d3.select('#graphSvg');
  svg.selectAll('*').remove();
  if (!accounts.length) return;

  const el = document.getElementById('pane-graph');
  const width = el.clientWidth || 400;
  const height = el.clientHeight || 500;

  const filtered = applyFilters(accounts);
  const maxF = d3.max(filtered, d => d.followers) || 1;
  const rScale = d3.scaleSqrt().domain([0, maxF]).range([4, 20]);

  // Build location nodes.
  const locCount = {};
  filtered.forEach(a => {
    const k = a.state || a.country;
    if (k) locCount[k] = (locCount[k] || 0) + 1;
  });
  const locNodes = Object.entries(locCount).filter(([,c]) => c >= 2).map(([id, count]) => ({ id, type: 'location', count }));
  const locSet = new Set(locNodes.map(l => l.id));

  const accNodes = filtered.map(a => ({ id: a.username, type: 'account', data: a }));
  const nodes = [...accNodes, ...locNodes];

  const links = [];
  filtered.forEach(a => {
    const k = a.state || a.country;
    if (k && locSet.has(k)) links.push({ source: a.username, target: k, type: 'geo' });
  });

  const engColor = r => r >= 3 ? '#22c55e' : r >= 1 ? '#f59e0b' : '#ef4444';
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.15, 6]).on('zoom', e => g.attr('transform', e.transform)));

  const link = g.append('g').selectAll('line').data(links).join('line')
    .attr('class', d => `link${d.type === 'geo' ? ' geo-link' : ''}`);

  const node = g.append('g').selectAll('g').data(nodes).join('g').attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.filter(d => d.type === 'account').append('circle')
    .attr('r', d => rScale(d.data.followers))
    .attr('fill', d => engColor(d.data.engagement_rate || 0))
    .attr('fill-opacity', 0.85);

  node.filter(d => d.type === 'location').append('rect')
    .attr('x', -7).attr('y', -7).attr('width', 14).attr('height', 14).attr('rx', 2)
    .attr('fill', '#7c3aed').attr('fill-opacity', 0.9).attr('transform', 'rotate(45)');

  node.append('text')
    .attr('dy', d => d.type === 'account' ? rScale(d.data?.followers || 0) + 9 : 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.type === 'location' ? '9px' : '8px')
    .attr('fill', d => d.type === 'location' ? '#c084fc' : '#999')
    .text(d => d.type === 'account'
      ? (d.data.followers > 5000 ? `@${d.id}` : '')
      : d.id);

  const tooltip = document.getElementById('tooltip');
  node.on('mouseover', (event, d) => {
    let html = '';
    if (d.type === 'account') {
      const a = d.data;
      html = `<strong>@${a.username}</strong>
        ${fmt(a.followers)} followers<br>
        ${(a.engagement_rate||0).toFixed(2)}% engagement<br>
        ${fmt(a.avg_video_views)} avg views<br>
        ${[a.city, a.state].filter(Boolean).join(', ') || 'Location unknown'}
        ${a.email ? `<br>${a.email}` : ''}`;
    } else {
      html = `<strong>${d.id}</strong>${d.count} account(s)`;
    }
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
  }).on('mousemove', e => {
    tooltip.style.left = (e.offsetX + 12) + 'px';
    tooltip.style.top  = (e.offsetY - 8) + 'px';
  }).on('mouseout', () => { tooltip.style.display = 'none'; });

  const sim = d3Simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(d => d.type === 'account' ? rScale(d.data?.followers || 0) + 4 : 14))
    .on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

// ── Tab switching ──

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tab}`));
    if (tab === 'graph') renderGraph(allAccounts);
    if (tab === 'errors') renderErrors(allErrors);
  });
});

// ── Settings drawer ──

function openDrawer() {
  document.getElementById('settingsDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('settingsDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}
document.getElementById('btnSettings').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

// Range value display.
['settMinDelay', 'settMaxDelay'].forEach(id => {
  const el = document.getElementById(id);
  const valEl = document.getElementById(id + 'Val');
  el.addEventListener('input', () => { valEl.textContent = el.value + 's'; });
});

document.getElementById('btnSaveSettings').addEventListener('click', async () => {
  const settings = {
    minDelay: parseInt(document.getElementById('settMinDelay').value) * 1000,
    maxDelay: parseInt(document.getElementById('settMaxDelay').value) * 1000,
    sessionCap: parseInt(document.getElementById('settSessionCap').value),
    dailyCap: parseInt(document.getElementById('settDailyCap').value),
    jitterEvery: parseInt(document.getElementById('settJitterEvery').value),
    jitterMin: 30000,
    jitterMax: 60000
  };
  await msg('UPDATE_SETTINGS', { settings });
  closeDrawer();
});

document.getElementById('btnResetQueue').addEventListener('click', async () => {
  if (!confirm('Reset ALL data and queue? This cannot be undone.')) return;
  await msg('RESET_QUEUE');
  allAccounts = [];
  allErrors = [];
  await refreshAll();
  closeDrawer();
});

// Key management in drawer.
async function refreshDrawerKey() {
  const { serviceAccountKey } = await chrome.storage.local.get('serviceAccountKey');
  const emailEl = document.getElementById('drawerKeyEmail');
  const noneEl  = document.getElementById('drawerKeyNone');
  if (serviceAccountKey) {
    emailEl.textContent = serviceAccountKey.client_email || '(unknown)';
    emailEl.style.display = 'block';
    noneEl.style.display  = 'none';
  } else {
    emailEl.style.display = 'none';
    noneEl.style.display  = 'block';
  }
}

document.getElementById('drawerKeySave').addEventListener('click', async () => {
  const raw = document.getElementById('drawerKeyInput').value.trim();
  if (!raw) return;
  const res = await msg('SAVE_SERVICE_ACCOUNT_KEY', { key: raw });
  if (res.ok) {
    document.getElementById('drawerKeyInput').value = '';
    await refreshDrawerKey();
  } else {
    alert('Error saving key: ' + res.error);
  }
});

// ── Main data loader ──

async function refreshAll() {
  const state = await msg('GET_STATE');
  allAccounts = state.evaluated || [];
  allErrors   = state.errors   || [];

  updateMonitor(state);

  if (currentTab === 'table') renderTable(allAccounts);
  if (currentTab === 'graph') renderGraph(allAccounts);
  if (currentTab === 'errors') renderErrors(allErrors);
}

// ── Real-time message listener ──

chrome.runtime.onMessage.addListener((m) => {
  if (m.type === 'ACTIVITY_EVENT') {
    appendFeedRow(m.event);
    if (m.event.kind === 'error') allErrors.push(m.event);
    if (currentTab === 'errors') renderErrors(allErrors);
  }
  if (m.type === 'ACCOUNT_EVALUATED') {
    allAccounts = allAccounts.filter(a => a.username !== m.profile.username);
    allAccounts.push(m.profile);
    if (currentTab === 'table') renderTable(allAccounts);
    if (currentTab === 'graph') renderGraph(allAccounts);
  }
  if (m.type === 'PROGRESS' || m.type === 'CURRENT_ACCOUNT') {
    refreshAll();
  }
});

// ── Init ──

refreshAll();
refreshDrawerKey();
setInterval(refreshAll, 8000);
