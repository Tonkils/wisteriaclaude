// Isolated world bridge.
// 1. Injects inject.js into the MAIN world so it can intercept Instagram's fetch calls.
// 2. Listens for postMessage from inject.js and forwards to background.js via chrome.runtime.

(function () {
  // Inject into MAIN world at document_start.
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(script);

  // Relay intercepted payloads to the service worker.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== 'wisteria_inject') return;

    chrome.runtime.sendMessage({
      type: 'IG_INTERCEPT',
      url: event.data.url,
      data: event.data.data
    }).catch(() => {
      // Background may not be listening if service worker is idle — safe to ignore.
    });
  });
})();
