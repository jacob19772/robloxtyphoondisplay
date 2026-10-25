'use strict';
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const next = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(next));
      menu.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', next);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  const dialog = document.getElementById('lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-lightbox]').forEach(tile => {
      tile.addEventListener('click', () => {
        const image = tile.querySelector('img');
        if (!image) return;
        const enlarged = dialog.querySelector('img');
        enlarged.src = image.src;
        enlarged.alt = image.alt;
        dialog.querySelector('h3').textContent = tile.dataset.lightbox || 'Gallery';
        dialog.querySelector('p').textContent = tile.dataset.description || '';
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', evt => { if (evt.target === dialog) dialog.close(); });
  }

  function fromForm(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
  function draftKey(formId) { return `raf-typhoon-display-team:${formId}:draft:v1`; }
  function restoreDraft(form) {
    try {
      const raw = localStorage.getItem(draftKey(form.id));
      if (!raw) return;
      const values = JSON.parse(raw);
      for (const [key, value] of Object.entries(values)) {
        const field = form.elements.namedItem(key);
        if (field && typeof value === 'string') field.value = value;
      }
    } catch (error) { /* Storage can be disabled. Forms still work for copying/downloading. */ }
  }
  function saveDraft(form) {
    const values = fromForm(form);
    try { localStorage.setItem(draftKey(form.id), JSON.stringify(values)); return true; }
    catch (error) { return false; }
  }
  function downloadText(filename, text) {
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  function prepareDraftText(form, title) {
    const values = fromForm(form);
    return [title, 'RAF Typhoon Display Team — Roblox (unofficial)', 'Not submitted through the website', '',
      ...Object.entries(values).map(([name, value]) => `${name.toUpperCase()}: ${value}`), ''].join('\n');
  }
  const contact = document.querySelector('#contact-form');
  if (contact) {
    restoreDraft(contact);
    contact.addEventListener('submit', evt => {
      evt.preventDefault();
      if (!contact.reportValidity()) return;
      const saved = saveDraft(contact);
      document.querySelector('#contact-feedback').textContent = saved
        ? 'Message saved on this device. It has NOT been sent to the team.'
        : 'Browser storage is unavailable. Copy your message somewhere safe; it has NOT been sent.';
    });
  }
  const application = document.querySelector('#apply-form');
  if (application) {
    restoreDraft(application);
    application.addEventListener('submit', evt => {
      evt.preventDefault();
      if (!application.reportValidity()) return;
      const saved = saveDraft(application);
      document.querySelector('#apply-feedback').textContent = saved
        ? 'Application draft saved on this device. It has NOT been submitted to the team.'
        : 'Browser storage is unavailable. Use “Download draft” to keep a copy.';
    });
    document.querySelector('#download-application')?.addEventListener('click', () => {
      if (!application.reportValidity()) return;
      saveDraft(application);
      downloadText('raf-typhoon-application-draft.txt', prepareDraftText(application, 'Application draft'));
      document.querySelector('#apply-feedback').textContent = 'Draft downloaded. It has NOT been submitted.';
    });
  }
})();
