async function msg(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, ...payload });
}

async function refresh() {
  const state = await msg('GET_STATE');
  const running = state.running || false;
  document.getElementById('statusDot').className = 'status-dot' + (running ? ' running' : '');
  document.getElementById('statusText').textContent = running
    ? `${state.sessionCount || 0} done`
    : `${(state.evaluated || []).length} evaluated`;
  document.getElementById('btnStart').style.display = running ? 'none' : 'block';
  document.getElementById('btnStop').style.display  = running ? 'block' : 'none';
}

async function refreshKey() {
  const { serviceAccountKey } = await chrome.storage.local.get('serviceAccountKey');
  const el = document.getElementById('keyStatus');
  if (serviceAccountKey) {
    el.textContent = '✓ ' + (serviceAccountKey.client_email || 'Key saved');
    el.className = 'key-status key-ok';
  } else {
    el.textContent = 'No key saved';
    el.className = 'key-status';
  }
}

document.getElementById('btnOpen').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});

document.getElementById('btnStart').addEventListener('click', async () => {
  await msg('START_EVALUATION');
  refresh();
});

document.getElementById('btnStop').addEventListener('click', async () => {
  await msg('STOP_EVALUATION');
  refresh();
});

document.getElementById('keyToggle').addEventListener('click', () => {
  const body = document.getElementById('keyBody');
  const chevron = document.getElementById('keyChevron');
  body.classList.toggle('open');
  chevron.textContent = body.classList.contains('open') ? '▴' : '▾';
});

document.getElementById('btnSaveKey').addEventListener('click', async () => {
  const raw = document.getElementById('keyInput').value.trim();
  if (!raw) return;
  const res = await msg('SAVE_SERVICE_ACCOUNT_KEY', { key: raw });
  if (res.ok) {
    document.getElementById('keyInput').value = '';
    await refreshKey();
  } else {
    alert('Error: ' + res.error);
  }
});

chrome.runtime.onMessage.addListener(m => {
  if (m.type === 'PROGRESS' || m.type === 'ACCOUNT_EVALUATED') refresh();
});

refresh();
refreshKey();
