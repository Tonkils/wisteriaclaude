// MAIN world script — runs in the same JS context as Instagram's React app.
// Monkey-patches window.fetch to intercept GraphQL and profile API responses.
// Sends intercepted data to content.js via window.postMessage.

(function () {
  const TARGET_URLS = [
    'graphql/query',
    'web_profile_info',
    '/api/v1/tags/web_info/',
    '/api/v1/tags/search/'
  ];

  const origFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await origFetch.apply(this, args);
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';

    const isTarget = TARGET_URLS.some(t => url.includes(t));
    if (!isTarget) return response;

    // Clone before consuming — Instagram's code still needs the original stream.
    const clone = response.clone();

    clone.json().then(data => {
      const msg = { source: 'wisteria_inject', url, data };
      window.postMessage(msg, '*');
    }).catch(() => {
      // Non-JSON response — ignore silently.
    });

    return response;
  };

  // Also patch XMLHttpRequest for older Instagram codepaths.
  const OrigXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OrigXHR {
    open(method, url, ...rest) {
      this._wisteriaUrl = url;
      super.open(method, url, ...rest);
    }
    send(...args) {
      this.addEventListener('load', () => {
        const url = this._wisteriaUrl || '';
        const isTarget = TARGET_URLS.some(t => url.includes(t));
        if (!isTarget) return;
        try {
          const data = JSON.parse(this.responseText);
          window.postMessage({ source: 'wisteria_inject', url, data }, '*');
        } catch (_) { }
      });
      super.send(...args);
    }
  };
})();
