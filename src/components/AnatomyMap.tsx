import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { linkSvgTextLabels, normalizeLabel } from '../utils/svgTextLinker';

type Species = 'human' | 'mouse';

interface TissueData {
  tissueName: string;
  uberonId: string;
  filename: string;
  originalFile: string;
  size: string;
}

interface AnatomyMapProps {
  species: Species;
  tissues: TissueData[];
}

// Helper to derive available slugs from server-provided tissue list
const buildAvailableSlugSet = (species: Species, tissues: TissueData[]): Set<string> => {
  const set = new Set<string>();
  const prefix = `tusco_${species}_`;
  const addFromName = (name?: string) => {
    if (!name) return;
    if (!name.endsWith('.tsv')) return;
    if (!name.startsWith(prefix)) return;
    const slug = name.replace(prefix, '').replace(/\.tsv$/i, '');
    if (slug) set.add(slug);
  };
  for (const t of tissues) {
    addFromName(t.originalFile);
    addFromName(t.filename);
  }
  return set;
};

const AnatomyMap: React.FC<AnatomyMapProps> = ({ species, tissues }) => {
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const svgUrl = useMemo(() => {
    return species === 'human'
      ? '/data/human_body_map.svg'
      : '/data/mouse_body_map.svg';
  }, [species]);

  useEffect(() => {
    let cancelled = false;
    fetch(svgUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch((err) => {
        console.error('Failed to load SVG:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [svgUrl]);

  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return;
    const container = containerRef.current;
    const svg = container.querySelector('svg') as SVGSVGElement | null;
    if (!svg) return;

    const available = buildAvailableSlugSet(species, tissues);
    // Build alias map: map normalized label variants -> known slugs from available files
    const alias = new Map<string, string>();
    const prefix = `tusco_${species}_`;
    const getSlugFromName = (name?: string) =>
      name && name.startsWith(prefix) && name.endsWith('.tsv')
        ? name.slice(prefix.length, -4)
        : undefined;

    const addAlias = (labelVariant: string, slug: string | undefined) => {
      if (!slug) return;
      const norm = normalizeLabel(labelVariant);
      if (!norm) return;
      alias.set(norm, slug);
    };

    for (const t of tissues) {
      const slug = getSlugFromName(t.originalFile) || getSlugFromName(t.filename);
      if (!slug) continue;
      const normName = normalizeLabel(t.tissueName);
      addAlias(normName, slug);

      // Variant: swap "X of Y" -> "Y - X"
      if (normName.includes(' of ')) {
        const [left, right] = normName.split(' of ');
        if (left && right) addAlias(`${right} - ${left}`, slug);
      }
      // Variant: "<organ> mucosa" -> "<organ> - mucosa"
      if (normName.endsWith(' mucosa')) {
        const organ = normName.replace(/\s*mucosa$/, '').trim();
        if (organ) addAlias(`${organ} - mucosa`, slug);
      }
      // Variant: "<nerve> <region>" -> "nerve - <region>"
      if (normName.endsWith(' nerve')) {
        const region = normName.replace(/\s*nerve$/, '').trim();
        if (region) addAlias(`nerve - ${region}`, slug);
      }
      if (normName.startsWith('tibial ') && normName.includes(' nerve')) {
        addAlias('nerve - tibial', slug);
      }
      // Common GTEx-to-dataset mappings
      addAlias('muscle - skeletal', getSlugFromName('tusco_human_skeletal_muscle_tissue.tsv'));
      addAlias('bladder', getSlugFromName('tusco_human_urinary_bladder.tsv'));
      addAlias('prostate', getSlugFromName('tusco_human_prostate_gland.tsv'));
      addAlias('thyroid', getSlugFromName('tusco_human_thyroid_gland.tsv'));
      addAlias('adipose - subcutaneous', getSlugFromName('tusco_human_subcutaneous_adipose_tissue.tsv'));
      addAlias('adipose - visceral/omentum', getSlugFromName('tusco_human_omental_fat_pad.tsv'));
      addAlias('small intestine - terminal ileum', getSlugFromName('tusco_human_small_intestine.tsv'));
      addAlias('heart-atrial appendage', getSlugFromName('tusco_human_right_atrium_auricular_region.tsv'));
      addAlias('esophagus - muscularis', getSlugFromName('tusco_human_esophagus.tsv'));
      // Map brain subregions to general brain dataset if present
      const brainSlug = getSlugFromName('tusco_human_brain.tsv');
      if (brainSlug) {
        [
          'amygdala',
          'hypothalamus',
          'hippocampus',
          'anterior cingulate cortex ba24',
          'putamen basal ganglia',
          'caudate basal ganglia',
          'nucleus accumbens basal ganglia',
          'substantia nigra'
        ].forEach((labelVar) => addAlias(labelVar, brainSlug));
        // BA9 maps better to dorsolateral prefrontal cortex if present
        const dlpfc = getSlugFromName('tusco_human_dorsolateral_prefrontal_cortex.tsv');
        if (dlpfc) addAlias('cortexfrontal cortex ba9', dlpfc);
      }
    }

    // The linker only wraps <text> with <a>; no other DOM/style changes.
    linkSvgTextLabels(svg, species, available, alias);

    // Intercept anchor clicks within the SVG to force download in dev (port 3000)
    const handleAnchorClick = async (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      if (!target) return;
      const anchor = target.closest('a') as Element | null;
      if (!anchor) return;
      // Only handle anchors inside our container's SVG
      if (!container.contains(anchor)) return;
      const href = anchor.getAttribute('href') || (anchor as any).href || anchor.getAttribute('xlink:href');
      if (!href) return;
      const downloadName = anchor.getAttribute('download') || '';

      // Prevent navigation; fetch and trigger a download programmatically
      ev.preventDefault();
      try {
        const res = await fetch(href);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        // Use a transient anchor outside the SVG; does not affect SVG layout/styles
        const a = document.createElement('a');
        a.href = blobUrl;
        if (downloadName) a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        // As a fallback, allow normal navigation
        window.location.href = href;
      }
    };

    container.addEventListener('click', handleAnchorClick);
    return () => {
      container.removeEventListener('click', handleAnchorClick);
    };
  }, [svgMarkup, tissues, species]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569' }}>
        Click a labeled tissue on the map to download its TSV.
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: 1,
          background: '#fff',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </Box>
  );
};

export default AnatomyMap;
