'use strict';
(() => {
  const links = [...document.querySelectorAll('.language-switcher a')];
  const pages = new Map();
  const dynamicIds = new Set(['motion-toggle', 'slideshow-toggle', 'filter-status', 'scene-status', 'scene-name']);
  let request = 0;
  let restorationFrame = null;
  let oldBehavior;
  let oldAnchoring;

  function pageFor(link) {
    const path = new URL(link.href, window.location.href).pathname;
    if (!pages.has(path)) {
      const pending = fetch(path, { credentials: 'same-origin' }).then(async response => {
        if (!response.ok) throw new Error('Language page unavailable');
        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
        if (page.documentElement.lang !== link.hreflang) throw new Error('Unexpected language page');
        return page;
      }).catch(error => {
        pages.delete(path);
        throw error;
      });
      pages.set(path, pending);
    }
    return pages.get(path);
  }

  // Keep the DOM nodes, event handlers, filters and open details in place.
  // Validate the complete structure before applying any translated content.
  function contentPatches(page) {
    const current = [...document.body.querySelectorAll('*')];
    const translated = [...page.body.querySelectorAll('*')];
    if (current.length !== translated.length) throw new Error('Language structure mismatch');
    const patches = [];
    current.forEach((element, index) => {
      const source = translated[index];
      if (element.tagName !== source.tagName || element.id !== source.id) throw new Error('Language structure mismatch');
      for (const attribute of ['alt', 'aria-label', 'title']) {
        if (source.hasAttribute(attribute)) patches.push(() => element.setAttribute(attribute, source.getAttribute(attribute)));
      }
      if (dynamicIds.has(element.id)) return;
      const textNodes = node => [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
      const liveText = textNodes(element);
      const newText = textNodes(source);
      if (liveText.length !== newText.length) throw new Error('Language text mismatch');
      liveText.forEach((node, i) => patches.push(() => { node.textContent = newText[i].textContent; }));
    });
    return patches;
  }

  function readingPosition() {
    if (window.scrollY < 1) return { element: null, offset: 0, y: 0 };
    const headerHeight = document.querySelector('.site-header').offsetHeight;
    const line = headerHeight + 24;
    // Anchor to visible reading content rather than a large enclosing section.
    // At section boundaries, a section's top can be far above the text in view.
    const candidates = [...document.querySelectorAll('h1, h2, h3, main p, li, figure, summary, footer')]
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.height > 0 && rect.bottom > line && rect.top < window.innerHeight);
    const crossing = candidates.filter(({ rect }) => rect.top <= line);
    const anchor = crossing.at(-1) || candidates.sort((a, b) => a.rect.top - b.rect.top)[0];
    return { element: anchor?.element, offset: anchor ? anchor.rect.top - headerHeight : 0, y: window.scrollY };
  }

  function applyPage(page, link, push) {
    const patches = contentPatches(page);
    // Capture at completion so scrolling while the translation loads is respected.
    const position = readingPosition();
    const root = document.documentElement;
    if (restorationFrame === null) {
      oldBehavior = root.style.scrollBehavior;
      oldAnchoring = root.style.overflowAnchor;
    } else window.cancelAnimationFrame(restorationFrame);
    root.style.scrollBehavior = 'auto';
    root.style.overflowAnchor = 'none';
    patches.forEach(patch => patch());
    root.lang = page.documentElement.lang;
    window.AMB_I18N.setLanguage(root.lang);
    document.title = page.title;
    for (const selector of [
      'meta[name="description"]', 'meta[property="og:title"]',
      'meta[property="og:description"]', 'meta[property="og:url"]',
      'meta[property="og:locale"]', 'meta[property="og:image:alt"]',
      'meta[name="twitter:title"]', 'meta[name="twitter:description"]',
      'meta[name="twitter:image:alt"]'
    ]) {
      document.querySelector(selector).content = page.querySelector(selector).content;
    }
    document.querySelector('link[rel="canonical"]').href = page.querySelector('link[rel="canonical"]').href;
    links.forEach(item => {
      if (item.hreflang === root.lang) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    if (push) {
      const url = new URL(link.href, window.location.href);
      url.hash = window.location.hash;
      history.pushState(null, '', url.pathname + url.hash);
    }
    document.dispatchEvent(new CustomEvent('amb:languagechange'));
    const headerHeight = document.querySelector('.site-header').offsetHeight;
    root.style.setProperty('--header-height', `${headerHeight}px`);
    const y = position.element
      ? window.scrollY + position.element.getBoundingClientRect().top - headerHeight - position.offset
      : position.y;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'instant' });
    // Leave scroll anchoring disabled through this layout update only.
    restorationFrame = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = oldBehavior;
      root.style.overflowAnchor = oldAnchoring;
      restorationFrame = null;
    });
  }

  async function switchLanguage(link, push = true) {
    const ticket = ++request;
    if (link.hreflang === window.AMB_I18N.language) return;
    try {
      const page = await pageFor(link);
      if (ticket !== request) return;
      applyPage(page, link, push);
    } catch {
      // Native localized pages remain a usable fallback if enhancement is unavailable.
      if (ticket === request) window.location.assign(link.href);
    }
  }

  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      switchLanguage(link);
    });
    for (const event of ['pointerenter', 'focus']) link.addEventListener(event, () => { pageFor(link).catch(() => {}); });
  });
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const link = links.find(item => new URL(item.href).pathname === path);
    if (link) switchLanguage(link, false);
  });
})();
