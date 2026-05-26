async function msg(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, ...payload });
}

async function refreshKeyStatus() {
  const { serviceAccountKey } = await chrome.storage.local.get('serviceAccountKey');
  const el = document.getElementById('keyStatus');
  if (serviceAccountKey) {
    const email = serviceAccountKey.client_email || '(unknown)';
    el.textContent = `✓ Key saved: ${email}`;
    el.className = 'sheets-status sheets-ok';
  } else {
    el.textContent = 'No key saved';
    el.className = 'sheets-status';
  }
}

async function refreshState() {
  const state = await msg('GET_STATE');
  const total = (state.evaluated?.length || 0) + (state.pending || 0);
  const pct = total > 0 ? Math.round((state.evaluated?.length || 0) / total * 100) : 0;

  document.getElementById('evalCount').textContent = state.evaluated?.length ?? 0;
  document.getElementById('queueCount').textContent = state.pending ?? 0;
  document.getElementById('rateCount').textContent = `${state.sessionCount} / ${state.dailyCount}`;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `${pct}% complete (${state.evaluated?.length ?? 0} of ${total})`;

  const running = state.running;
  document.getElementById('statusDot').className = `status-dot ${running ? 'dot-running' : 'dot-stopped'}`;
  document.getElementById('statusText').textContent = running ? 'Running...' : 'Stopped';
  document.getElementById('btnStart').style.display = running ? 'none' : 'block';
  document.getElementById('btnStop').style.display = running ? 'block' : 'none';
}

document.getElementById('btnStart').addEventListener('click', async () => {
  await msg('START_EVALUATION');
  refreshState();
});

document.getElementById('btnStop').addEventListener('click', async () => {
  await msg('STOP_EVALUATION');
  refreshState();
});

document.getElementById('btnSaveKey').addEventListener('click', async () => {
  const raw = document.getElementById('keyInput').value.trim();
  if (!raw) return;
  const res = await msg('SAVE_SERVICE_ACCOUNT_KEY', { key: raw });
  if (res.ok) {
    document.getElementById('keyInput').value = '';
    await refreshKeyStatus();
  } else {
    alert(`Error saving key: ${res.error}`);
  }
});

document.getElementById('btnSheets').addEventListener('click', async () => {
  const status = document.getElementById('sheetsStatus');
  status.textContent = 'Connecting...';
  const res = await msg('CONNECT_SHEETS');
  if (res.ok) {
    status.textContent = '✓ Connected to Google Sheets';
    status.className = 'sheets-status sheets-ok';
  } else {
    status.textContent = `Error: ${res.error}`;
    status.className = 'sheets-status';
  }
});

document.getElementById('openSidePanel').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});

document.getElementById('btnAdd').addEventListener('click', async () => {
  const raw = document.getElementById('addInput').value.trim();
  if (!raw) return;
  const usernames = raw.split(/[\s,]+/).map(u => u.replace(/^@/, '').trim()).filter(Boolean);
  const res = await msg('ADD_ACCOUNTS', { usernames, source: 'manual' });
  document.getElementById('addInput').value = '';
  alert(`Added ${res.added} new account(s) to queue.`);
  refreshState();
});

document.getElementById('btnSaveSettings').addEventListener('click', async () => {
  const settings = {
    minDelay: parseInt(document.getElementById('minDelay').value) * 1000,
    maxDelay: parseInt(document.getElementById('maxDelay').value) * 1000,
    sessionCap: parseInt(document.getElementById('sessionCap').value),
    dailyCap: 400,
    jitterEvery: 10,
    jitterMin: 30000,
    jitterMax: 60000
  };
  await msg('UPDATE_SETTINGS', { settings });
  alert('Settings saved.');
});

// Listen for real-time progress updates.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PROGRESS' || msg.type === 'ACCOUNT_EVALUATED') {
    refreshState();
  }
});

refreshState();
refreshKeyStatus();
setInterval(refreshState, 5000);
