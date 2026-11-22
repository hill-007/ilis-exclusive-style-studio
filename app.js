/* Ilis Private Style Studio: local-only preference collection; photos go straight to Tally. */
(function () {
  'use strict';

  const config = window.ILIS_CONFIG || {};
  const form = document.getElementById('preferences-form');
  const preferencesPanel = document.getElementById('preferences-panel');
  const uploadPanel = document.getElementById('upload-panel');
  const summary = document.getElementById('summary-text');
  const tallyHolder = document.getElementById('tally-holder');
  const fields = ['portrait', 'angle', 'setting', 'lighting', 'mood'];

  function selectedPreferences() {
    const result = {};
    for (const field of fields) {
      const selected = form.querySelector(`input[name="${field}"]:checked`);
      result[field] = selected ? selected.value : '';
    }
    return result;
  }

  function makeTallyUrl(preferences, embed) {
    const id = String(config.tallyFormId || '').trim();
    const url = new URL(`https://tally.so/${embed ? 'embed' : 'r'}/${encodeURIComponent(id)}`);
    if (embed) {
      url.searchParams.set('alignLeft', '1');
      url.searchParams.set('hideTitle', '1');
      url.searchParams.set('transparentBackground', '1');
      url.searchParams.set('dynamicHeight', '1');
    }
    for (const [name, value] of Object.entries(preferences)) {
      url.searchParams.set(name, value);
    }
    return url.toString();
  }

  function loadEmbeds() {
    if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
      window.Tally.loadEmbeds();
    }
  }

  function showTally(preferences) {
    tallyHolder.replaceChildren();
    const id = String(config.tallyFormId || '').trim();
    if (!/^[a-z0-9_-]{6,64}$/i.test(id)) {
      const message = document.createElement('div');
      message.className = 'setup-alert';
      const heading = document.createElement('strong');
      heading.textContent = 'Our private photo studio is nearly ready.';
      const description = document.createElement('p');
      description.textContent = 'Your selections are working. Photo submission will become available once Ilis Designs activates its secure upload form.';
      message.append(heading, description);
      tallyHolder.append(message);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'tally-embed';
    iframe.title = 'Secure photo submission for Ilis Private Style Studio';
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('data-tally-src', makeTallyUrl(preferences, true));
    iframe.src = makeTallyUrl(preferences, true);
    iframe.style.width = '100%';
    iframe.style.height = '650px';
    iframe.style.border = '0';
    tallyHolder.append(iframe);

    const fallback = document.createElement('p');
    fallback.className = 'upload-fallback';
    fallback.append('If the secure form does not appear, ');
    const link = document.createElement('a');
    link.href = makeTallyUrl(preferences, false);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'open your photo upload in a new tab';
    fallback.append(link, '. Your five selections will be carried over.');
    tallyHolder.append(fallback);

    if (!document.querySelector('script[data-ilis-tally]')) {
      const script = document.createElement('script');
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      script.dataset.ilisTally = 'true';
      script.addEventListener('load', loadEmbeds, { once: true });
      document.body.append(script);
    } else {
      loadEmbeds();
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const preferences = selectedPreferences();
    summary.textContent = fields.map(key => preferences[key]).join('  ·  ');
    showTally(preferences);
    preferencesPanel.hidden = true;
    uploadPanel.hidden = false;
    uploadPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('edit-preferences').addEventListener('click', function () {
    // Discard any unsubmitted upload-form data rather than retaining it invisibly.
    tallyHolder.replaceChildren();
    uploadPanel.hidden = true;
    preferencesPanel.hidden = false;
    preferencesPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
