// Runtime SVG text linker: wraps <text> nodes in <a> without changing styles.
// - Builds links to /data/{species}/tusco_{species}_{slug}.tsv
// - Special fallbacks per requirements:
//   * "Heart - Left Ventricle" -> heart_left_ventricle (else heart)
//   * "Kidney - Cortex" / "Kidney - Medulla" -> kidney
// - If availableSlugs is provided, only wraps when a candidate slug exists in that set.

export type Species = 'human' | 'mouse';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

export function normalizeLabel(raw: string): string {
  if (!raw) return '';
  // Normalize dashes and whitespace
  const s = raw
    .replace(/[\u2012-\u2015]/g, '-') // various unicode dashes -> '-'
    .replace(/[\u00A0\u2000-\u200B]/g, ' ') // unicode spaces -> normal space
    .toLowerCase()
    .trim();
  return s;
}

function toSlug(raw: string): string {
  // Convert to lowercase slug with underscores, keeping a-z0-9 only
  const s = normalizeLabel(raw)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
  return s;
}

function unique<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of arr) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function candidateSlugsForLabel(label: string): string[] {
  const norm = normalizeLabel(label);

  const candidates: string[] = [];

  // Special heart handling
  if (norm === 'heart - left ventricle') {
    candidates.push('heart_left_ventricle', 'heart');
  } else if (norm.startsWith('heart')) {
    candidates.push('heart');
  }

  // Special kidney handling
  if (norm === 'kidney - cortex' || norm === 'kidney - medulla') {
    candidates.push('kidney');
  }

  // Generic full-label slug
  const fullSlug = toSlug(norm);
  if (fullSlug) candidates.push(fullSlug);

  // Generic base-organ fallback for patterns with separators
  const sepIdx = norm.indexOf(' - ');
  const slashIdx = norm.indexOf('/');
  let cut = -1;
  if (sepIdx >= 0) cut = sepIdx; else if (slashIdx >= 0) cut = slashIdx;
  if (cut > 0) {
    const base = norm.slice(0, cut).trim();
    const baseSlug = toSlug(base);
    if (baseSlug) candidates.push(baseSlug);
  }

  return unique(candidates);
}

function wrapTextWithLink(textEl: SVGTextElement, href: string, downloadName: string) {
  const parent = textEl.parentNode as Element | null;
  if (!parent) return;
  // Avoid double-wrapping if already within an <a>
  const existingLink = textEl.closest('a');
  if (existingLink && existingLink.namespaceURI === SVG_NS) return;

  const anchor = document.createElementNS(SVG_NS, 'a');
  // Set both href and xlink:href for broad compatibility
  anchor.setAttribute('href', href);
  try {
    anchor.setAttributeNS(XLINK_NS, 'xlink:href', href);
  } catch {
    // no-op if namespace isn't supported; 'href' is sufficient in modern browsers
  }
  anchor.setAttribute('download', downloadName);
  // Add classes for scoped hover styling and semantics
  anchor.classList.add('svg-tissue-link');
  textEl.classList.add('svg-tissue-label');

  parent.replaceChild(anchor, textEl);
  anchor.appendChild(textEl);
}

export function linkSvgTextLabels(
  svgRoot: SVGSVGElement,
  species: Species,
  availableSlugs?: Set<string>,
  aliasMap?: Map<string, string>
) {
  if (!svgRoot) return;
  const texts = Array.from(svgRoot.querySelectorAll('text')) as SVGTextElement[];
  if (!texts.length) return;

  const prefix = `tusco_${species}_`;

  // Inject a small <style> block scoped to this SVG to highlight
  // only linked labels on hover/focus without affecting layout.
  const STYLE_ID = 'tissue-hover-style';
  if (!svgRoot.querySelector(`style#${STYLE_ID}`)) {
    const styleEl = document.createElementNS(SVG_NS, 'style');
    styleEl.setAttribute('id', STYLE_ID);
    styleEl.textContent = `
      /* Professional styling for interactive anatomy maps */
      a.svg-tissue-link { 
        cursor: pointer; 
        text-decoration: none;
        outline: none;
      }
      
      /* Label highlighting with subtle academic styling */
      a.svg-tissue-link text, a.svg-tissue-link tspan { 
        transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      a.svg-tissue-link:hover text,
      a.svg-tissue-link:hover tspan,
      a.svg-tissue-link:focus text,
      a.svg-tissue-link:focus tspan,
      a.svg-tissue-link.active text,
      a.svg-tissue-link.active tspan {
        fill: #2a9d8f !important;
        font-weight: 600;
        paint-order: stroke fill;
        stroke: rgba(255,255,255,0.8);
        stroke-width: 0.3;
        filter: url(#textGlow);
      }

      /* Connector line enhancement */
      .tissue-connector { 
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        stroke-opacity: 0.8;
      }
      .tissue-connector.active { 
        stroke: #2a9d8f; 
        stroke-width: 1.2; 
        stroke-opacity: 1;
        filter: url(#softGlow);
      }

      /* Endpoint highlighting with professional glow */
      .tissue-highlight-dot { 
        fill: rgba(42,157,143,0.25); 
        stroke: rgba(42,157,143,0.8); 
        stroke-width: 0.8; 
        opacity: 0; 
        pointer-events: none; 
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        filter: url(#endpointGlow);
      }
      .tissue-highlight-dot.active { 
        opacity: 1; 
        r: 3.2;
      }

      /* Region highlighting with subtle academic glow */
      .tissue-region-highlighted {
        stroke: #2a9d8f;
        stroke-width: 1.5;
        stroke-opacity: 0.9;
        fill-opacity: 0.95;
        filter: url(#regionGlow);
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Unavailable tissue styling - gray on hover */
      text.svg-tissue-unavailable,
      text.svg-tissue-unavailable tspan {
        cursor: not-allowed;
        transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      text.svg-tissue-unavailable:hover,
      text.svg-tissue-unavailable:hover tspan {
        fill: #9CA3AF !important;
        opacity: 0.7;
      }
    `;
    svgRoot.insertBefore(styleEl, svgRoot.firstChild);
  }

  // Create professional filter effects for academic-style highlighting
  let defs = svgRoot.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svgRoot.insertBefore(defs, svgRoot.firstChild?.nextSibling || null);
  }

  // Text glow filter for labels
  if (!svgRoot.querySelector('filter#textGlow')) {
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', 'textGlow');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    const gaussian = document.createElementNS(SVG_NS, 'feGaussianBlur');
    gaussian.setAttribute('in', 'SourceGraphic');
    gaussian.setAttribute('stdDeviation', '0.8');
    gaussian.setAttribute('result', 'textBlur');
    const merge = document.createElementNS(SVG_NS, 'feMerge');
    const m1 = document.createElementNS(SVG_NS, 'feMergeNode');
    m1.setAttribute('in', 'textBlur');
    const m2 = document.createElementNS(SVG_NS, 'feMergeNode');
    m2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(m1);
    merge.appendChild(m2);
    filter.appendChild(gaussian);
    filter.appendChild(merge);
    defs!.appendChild(filter);
  }

  // Soft glow for connectors
  if (!svgRoot.querySelector('filter#softGlow')) {
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', 'softGlow');
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '160%');
    const gaussian = document.createElementNS(SVG_NS, 'feGaussianBlur');
    gaussian.setAttribute('in', 'SourceGraphic');
    gaussian.setAttribute('stdDeviation', '1.5');
    gaussian.setAttribute('result', 'blurOut');
    const merge = document.createElementNS(SVG_NS, 'feMerge');
    const m1 = document.createElementNS(SVG_NS, 'feMergeNode');
    m1.setAttribute('in', 'blurOut');
    const m2 = document.createElementNS(SVG_NS, 'feMergeNode');
    m2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(m1);
    merge.appendChild(m2);
    filter.appendChild(gaussian);
    filter.appendChild(merge);
    defs!.appendChild(filter);
  }

  // Endpoint glow for highlighting dots
  if (!svgRoot.querySelector('filter#endpointGlow')) {
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', 'endpointGlow');
    filter.setAttribute('x', '-40%');
    filter.setAttribute('y', '-40%');
    filter.setAttribute('width', '180%');
    filter.setAttribute('height', '180%');
    const gaussian = document.createElementNS(SVG_NS, 'feGaussianBlur');
    gaussian.setAttribute('in', 'SourceGraphic');
    gaussian.setAttribute('stdDeviation', '2.0');
    gaussian.setAttribute('result', 'endpointBlur');
    const merge = document.createElementNS(SVG_NS, 'feMerge');
    const m1 = document.createElementNS(SVG_NS, 'feMergeNode');
    m1.setAttribute('in', 'endpointBlur');
    const m2 = document.createElementNS(SVG_NS, 'feMergeNode');
    m2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(m1);
    merge.appendChild(m2);
    filter.appendChild(gaussian);
    filter.appendChild(merge);
    defs!.appendChild(filter);
  }

  // Region glow for anatomical areas
  if (!svgRoot.querySelector('filter#regionGlow')) {
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', 'regionGlow');
    filter.setAttribute('x', '-25%');
    filter.setAttribute('y', '-25%');
    filter.setAttribute('width', '150%');
    filter.setAttribute('height', '150%');
    const gaussian = document.createElementNS(SVG_NS, 'feGaussianBlur');
    gaussian.setAttribute('in', 'SourceGraphic');
    gaussian.setAttribute('stdDeviation', '1.0');
    gaussian.setAttribute('result', 'regionBlur');
    const merge = document.createElementNS(SVG_NS, 'feMerge');
    const m1 = document.createElementNS(SVG_NS, 'feMergeNode');
    m1.setAttribute('in', 'regionBlur');
    const m2 = document.createElementNS(SVG_NS, 'feMergeNode');
    m2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(m1);
    merge.appendChild(m2);
    filter.appendChild(gaussian);
    filter.appendChild(merge);
    defs!.appendChild(filter);
  }

  for (const textEl of texts) {
    // Handle multi-line text with tspan elements properly
    // If there are tspans, use the last one (most specific label)
    // Otherwise use textContent
    const tspans = textEl.querySelectorAll('tspan');
    let label: string;
    if (tspans.length > 0) {
      // Use the last tspan which typically contains the most specific label
      label = (tspans[tspans.length - 1].textContent || '').trim();
    } else {
      label = (textEl.textContent || '').trim();
    }
    if (!label) continue;

    const candidates = candidateSlugsForLabel(label);

    // If an alias maps this label to a specific slug, prioritize it
    const norm = normalizeLabel(label);
    const aliasSlug = aliasMap?.get(norm);
    if (aliasSlug) {
      // Add to the front if not already included
      if (!candidates.includes(aliasSlug)) {
        candidates.unshift(aliasSlug);
      }
    }

    let chosen: string | undefined;
    if (availableSlugs && availableSlugs.size) {
      for (const c of candidates) {
        if (availableSlugs.has(c)) {
          chosen = c;
          break;
        }
      }
    } else {
      // No manifest: best-effort, take the first candidate
      chosen = candidates[0];
    }

    if (!chosen) {
      // No match found - mark as unavailable
      textEl.classList.add('svg-tissue-unavailable');
      continue;
    }

    const file = `${prefix}${chosen}.tsv`;
    const href = `/data/${species}/${file}`;
    wrapTextWithLink(textEl, href, file);
  }

  // After we wrap links, wire connectors and endpoint glow
  try {
    wireConnectors(svgRoot);
  } catch (e) {
    // Non-fatal if connector detection fails; labels still work
    // eslint-disable-next-line no-console
    console.warn('Connector wiring failed:', e);
  }
}

// --- Connector wiring & highlighting ---

type XY = { x: number; y: number };

function parseNumber(n?: string | null): number | undefined {
  if (!n) return undefined;
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : undefined;
}

function parsePolylinePoints(pointsAttr: string): XY[] {
  const pts: XY[] = [];
  const parts = pointsAttr.trim().split(/\s+/);
  for (const p of parts) {
    const [xs, ys] = p.split(',');
    const x = parseNumber(xs);
    const y = parseNumber(ys);
    if (x != null && y != null) pts.push({ x, y });
  }
  return pts;
}

function getConnectorY(el: SVGLineElement | SVGPolylineElement): number | undefined {
  if (el.tagName.toLowerCase() === 'line') {
    const line = el as SVGLineElement;
    const y1 = parseNumber(line.getAttribute('y1'));
    const y2 = parseNumber(line.getAttribute('y2'));
    if (y1 != null && y2 != null) return (y1 + y2) / 2;
    return y1 ?? y2 ?? undefined;
  }
  const poly = el as SVGPolylineElement;
  const pts = parsePolylinePoints(poly.getAttribute('points') || '');
  if (!pts.length) return undefined;
  // median y
  const ys = pts.map(p => p.y).sort((a, b) => a - b);
  const mid = Math.floor(ys.length / 2);
  return ys[mid];
}

function getFarthestPointFrom(el: SVGLineElement | SVGPolylineElement, ref: XY): XY | undefined {
  let candidates: XY[] = [];
  if (el.tagName.toLowerCase() === 'line') {
    const line = el as SVGLineElement;
    const p1 = { x: parseNumber(line.getAttribute('x1'))!, y: parseNumber(line.getAttribute('y1'))! };
    const p2 = { x: parseNumber(line.getAttribute('x2'))!, y: parseNumber(line.getAttribute('y2'))! };
    candidates = [p1, p2].filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else {
    const poly = el as SVGPolylineElement;
    candidates = parsePolylinePoints(poly.getAttribute('points') || '');
  }
  if (!candidates.length) return undefined;
  let best = candidates[0];
  let bestD = Infinity;
  for (const p of candidates) {
    const dx = p.x - ref.x;
    const dy = p.y - ref.y;
    const d = dx * dx + dy * dy;
    if (d > bestD) continue; // We want the farthest, so actually track max
  }
  // Recompute correctly for farthest
  best = candidates[0];
  let maxD = -1;
  for (const p of candidates) {
    const dx = p.x - ref.x;
    const dy = p.y - ref.y;
    const d = dx * dx + dy * dy;
    if (d > maxD) { maxD = d; best = p; }
  }
  return best;
}

function getNearestDistance(el: SVGLineElement | SVGPolylineElement, ref: XY): number {
  let pts: XY[] = [];
  if (el.tagName.toLowerCase() === 'line') {
    const line = el as SVGLineElement;
    const p1 = { x: parseNumber(line.getAttribute('x1'))!, y: parseNumber(line.getAttribute('y1'))! };
    const p2 = { x: parseNumber(line.getAttribute('x2'))!, y: parseNumber(line.getAttribute('y2'))! };
    pts = [p1, p2].filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else {
    const poly = el as SVGPolylineElement;
    pts = parsePolylinePoints(poly.getAttribute('points') || '');
  }
  if (!pts.length) return Number.POSITIVE_INFINITY;
  let best = Number.POSITIVE_INFINITY;
  for (const p of pts) {
    const dx = p.x - ref.x;
    const dy = p.y - ref.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) best = d;
  }
  return best;
}

function wireConnectors(svgRoot: SVGSVGElement) {
  // Overlay group to host endpoint glow circles
  let overlay = svgRoot.querySelector('g#tissue-hover-overlays') as SVGGElement | null;
  if (!overlay) {
    overlay = document.createElementNS(SVG_NS, 'g');
    overlay.setAttribute('id', 'tissue-hover-overlays');
    overlay.setAttribute('pointer-events', 'none');
    svgRoot.appendChild(overlay);
  }
  // Do not clear existing dots; wiring below is idempotent per link

  const links = Array.from(svgRoot.querySelectorAll('a.svg-tissue-link')) as SVGAElement[];
  if (!links.length) return;

  const connectorElems = Array.from(svgRoot.querySelectorAll('line, polyline')) as (SVGLineElement | SVGPolylineElement)[];
  // Heuristically filter to thin dark connectors
  const connectors = connectorElems.filter(el => {
    const stroke = (el.getAttribute('stroke') || '').toLowerCase();
    const sw = (el.getAttribute('stroke-width') || '').trim();
    return (stroke === '#434343' || stroke === '#231f20' || stroke === '#000' || stroke === '#000000') && (sw === '0.25' || sw === '0.25px' || sw === '0.2' || sw === '0.2px');
  });
  connectors.forEach(el => el.classList.add('tissue-connector'));

  // Build simple search index by y
  const index = connectors.map(el => ({ el, y: getConnectorY(el)! })).filter(r => Number.isFinite(r.y));

  const makeGroupId = (() => {
    let i = 0; return () => `tg-${++i}`;
  })();

  for (const link of links) {
    if (link.hasAttribute('data-tissue-group')) {
      // Already wired from a previous call
      continue;
    }
    const text = link.querySelector('text');
    if (!text) continue;
    let bbox: DOMRect | undefined;
    try { bbox = text.getBBox(); } catch { /* ignore */ }
    if (!bbox) continue;
    const ref: XY = { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.5 };

    // Find best connector by nearest distance among rows with close y
    let best: { el: SVGLineElement | SVGPolylineElement; d: number } | undefined;
    for (const r of index) {
      const dy = Math.abs(r.y - ref.y);
      if (dy > 3.2) continue; // same row
      const d = getNearestDistance(r.el, ref);
      if (!best || d < best.d) best = { el: r.el, d };
    }
    if (!best) continue;

    const groupId = makeGroupId();
    link.setAttribute('data-tissue-group', groupId);
    best.el.setAttribute('data-tissue-group', groupId);

    // Endpoint dot at farthest point from label center
    const endpoint = getFarthestPointFrom(best.el, ref);
    if (endpoint) {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'tissue-highlight-dot');
      dot.setAttribute('cx', String(endpoint.x));
      dot.setAttribute('cy', String(endpoint.y));
      dot.setAttribute('r', '2.5');
      dot.setAttribute('data-tissue-group', groupId);
      overlay.appendChild(dot);
    }

    // Hover/Focus activation
    // Attempt to detect the anatomical region under the connector endpoint
    const regionEl = endpoint ? detectRegionUnderPoint(svgRoot, endpoint) : null;
    if (regionEl) {
      regionEl.setAttribute('data-tissue-group', groupId);
      // Keep baseline styling intact; only add highlight class when active
    }

    const activate = () => {
      link.classList.add('active');
      best!.el.classList.add('active');
      const dot = overlay!.querySelector(`.tissue-highlight-dot[data-tissue-group="${groupId}"]`) as SVGCircleElement;
      if (dot) {
        dot.classList.add('active');
        // Smooth radius animation for professional effect
        dot.setAttribute('r', '3.5');
      }
      if (regionEl) {
        regionEl.classList.add('active');
        regionEl.classList.add('tissue-region-highlighted');
      }
    };
    const deactivate = () => {
      link.classList.remove('active');
      best!.el.classList.remove('active');
      const dot = overlay!.querySelector(`.tissue-highlight-dot[data-tissue-group="${groupId}"]`) as SVGCircleElement;
      if (dot) {
        dot.classList.remove('active');
        // Return to original radius
        dot.setAttribute('r', '2.5');
      }
      if (regionEl) {
        regionEl.classList.remove('active');
        regionEl.classList.remove('tissue-region-highlighted');
      }
    };

    link.addEventListener('mouseenter', activate);
    link.addEventListener('mouseleave', deactivate);
    link.addEventListener('focus', activate, true);
    link.addEventListener('blur', deactivate, true);
    link.addEventListener('click', () => {
      activate();
      // keep briefly visible for visual feedback
      setTimeout(deactivate, 350);
    });

    // Also allow hovering the connector line to reflect back on the label
    best.el.addEventListener('mouseenter', activate);
    best.el.addEventListener('mouseleave', deactivate);
  }
}

function detectRegionUnderPoint(svg: SVGSVGElement, pt: XY): SVGGraphicsElement | null {
  try {
    // Convert SVG coords -> screen coords
    const p = svg.createSVGPoint();
    p.x = pt.x; p.y = pt.y;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const sp = p.matrixTransform(ctm);
    // Probe a small set of offsets to reduce chance of hitting a connector line
    const offsets = [
      { dx: 0, dy: 0 }, { dx: 1.5, dy: 0 }, { dx: -1.5, dy: 0 }, { dx: 0, dy: 1.5 }, { dx: 0, dy: -1.5 },
      { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }
    ];
    for (const o of offsets) {
      const el = document.elementFromPoint(sp.x + o.dx, sp.y + o.dy) as Element | null;
      if (!el) continue;
      const target = (el.closest('path, polygon, rect') as SVGGraphicsElement | null) || (el as SVGGraphicsElement | null);
      if (!target) continue;
      const tag = target.tagName.toLowerCase();
      if (tag === 'path' || tag === 'polygon' || tag === 'rect') {
        return target;
      }
    }
  } catch {
    // ignore
  }
  return null;
}
