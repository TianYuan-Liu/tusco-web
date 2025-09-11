/*
  TUSCO runtime linker
  - Never edits SVG files on disk; works at runtime only
  - Loads an existing SVG (inline) and wraps <text> labels in <a href=... download>
  - Builds links to /data/{species}/tusco_{species}_{slug}.tsv
  - Fallback rules:
      • "Heart - Left Ventricle" → heart_left_ventricle, else heart
      • "Kidney - Cortex" / "Kidney - Medulla" → kidney
  - If no matching TSV exists, leaves the label untouched
  - Hover highlight uses page CSS so non-hover is pixel-identical to the source
*/

(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  function normalizeLabel(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/[\u2012-\u2015]/g, '-')   // normalize unicode dashes
      .replace(/[\u00A0\u2000-\u200B]/g, ' ') // normalize spaces
      .toLowerCase()
      .trim();
  }

  function toSlug(raw) {
    return normalizeLabel(raw)
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_{2,}/g, '_');
  }

  function candidateSlugsForLabel(label) {
    const norm = normalizeLabel(label);
    const out = [];

    // Explicit fallbacks
    if (norm === 'heart - left ventricle') {
      out.push('heart_left_ventricle', 'heart');
    } else if (norm.startsWith('heart')) {
      out.push('heart');
    }
    if (norm === 'kidney - cortex' || norm === 'kidney - medulla') {
      out.push('kidney');
    }

    // Full label slug
    const full = toSlug(norm);
    if (full) out.push(full);

    // Base-organ fallback for 'Organ - Part' or 'Organ/Part'
    const sepIdx = norm.indexOf(' - ');
    const slashIdx = norm.indexOf('/');
    let cut = -1;
    if (sepIdx >= 0) cut = sepIdx; else if (slashIdx >= 0) cut = slashIdx;
    if (cut > 0) {
      const base = toSlug(norm.slice(0, cut));
      if (base) out.push(base);
    }

    // unique
    return Array.from(new Set(out));
  }

  async function fileExists(url) {
    try {
      const head = await fetch(url, { method: 'HEAD', credentials: 'same-origin' });
      if (head.ok) return true;
      // Some static servers reject HEAD; try a tiny GET
      const get = await fetch(url, {
        method: 'GET',
        headers: { 'Range': 'bytes=0-0' },
        cache: 'no-store',
        credentials: 'same-origin'
      });
      return get.ok;
    } catch {
      return false;
    }
  }

  async function loadAvailableSlugs(species) {
    try {
      const res = await fetch(`/api/tissues/${species}`, { credentials: 'same-origin' });
      if (!res.ok) return null;
      const list = await res.json();
      const prefix = `tusco_${species}_`;
      const set = new Set();
      for (const item of list) {
        const fn = item.filename || '';
        if (fn.startsWith(prefix) && fn.endsWith('.tsv')) {
          const slug = fn.slice(prefix.length, -4);
          if (slug) set.add(slug);
        }
      }
      return set;
    } catch {
      return null;
    }
  }

  function wrapTextWithLink(textEl, href, downloadName) {
    const parent = textEl && textEl.parentNode;
    if (!parent) return;
    // Avoid double wrap
    const existing = textEl.closest('a');
    if (existing && existing.namespaceURI === SVG_NS) return;

    const a = document.createElementNS(SVG_NS, 'a');
    a.setAttribute('href', href);
    try { a.setAttributeNS(XLINK_NS, 'xlink:href', href); } catch {}
    a.setAttribute('download', downloadName);

    parent.insertBefore(a, textEl);
    a.appendChild(textEl);
  }

  async function linkSvgTextLabels(svg, species) {
    if (!svg) return;
    const texts = Array.from(svg.querySelectorAll('text'));
    if (!texts.length) return;

    // Use API when available to avoid many HEADs
    const available = await loadAvailableSlugs(species);
    const prefix = `tusco_${species}_`;

    for (const textEl of texts) {
      const label = (textEl.textContent || '').trim();
      if (!label) continue;
      const candidates = candidateSlugsForLabel(label);

      let chosen = null;
      if (available && available.size) {
        for (const c of candidates) {
          if (available.has(c)) { chosen = c; break; }
        }
      } else {
        // Fallback to probing filesystem via HTTP
        for (const c of candidates) {
          const tryUrl = `/data/${species}/${prefix}${c}.tsv`;
          // eslint-disable-next-line no-await-in-loop
          if (await fileExists(tryUrl)) { chosen = c; break; }
        }
      }

      if (!chosen) continue; // leave untouched when no TSV exists

      const file = `${prefix}${chosen}.tsv`;
      const href = `/data/${species}/${file}`;
      wrapTextWithLink(textEl, href, file);
    }
  }

  async function loadInlineSvg(container, svgUrl) {
    const target = typeof container === 'string' ? document.querySelector(container) : container;
    if (!target) throw new Error('Missing SVG container');
    const res = await fetch(svgUrl, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load SVG: ${svgUrl}`);
    const svgText = await res.text();
    // Insert without re-serializing. We trust same-origin SVG.
    target.innerHTML = svgText;
    const svg = target.querySelector('svg');
    if (!svg) throw new Error('No <svg> root found after load');
    return svg;
  }

  // Public API
  window.TuscoLinker = {
    loadInlineSvg,
    linkSvgTextLabels,
    candidateSlugsForLabel,
    async initFromManifest(manifestUrl, containerSelector) {
      const res = await fetch(manifestUrl, { cache: 'no-cache', credentials: 'same-origin' });
      if (!res.ok) throw new Error(`Failed to load manifest: ${manifestUrl}`);
      const manifest = await res.json();
      const species = manifest.species;
      const svgPath = manifest.svg;
      if (!species || !svgPath) throw new Error('Manifest requires { species, svg }');
      const svg = await loadInlineSvg(containerSelector, svgPath);
      await linkSvgTextLabels(svg, species);
      return { svg, species };
    }
  };
})();
