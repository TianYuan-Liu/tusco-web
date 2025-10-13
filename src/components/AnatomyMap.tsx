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
    }

    // SVG label → TSV file mappings based on comprehensive analysis
    // Human tissue mappings
    addAlias('artery - aorta', getSlugFromName('tusco_human_ascending_aorta.tsv'));
    addAlias('artery - coronary', getSlugFromName('tusco_human_coronary_artery.tsv'));
    addAlias('artery - tibial', getSlugFromName('tusco_human_tibial_artery.tsv'));
    addAlias('breast - mammary tissue', getSlugFromName('tusco_human_breast_epithelium.tsv'));
    addAlias('caudate basal ganglia', getSlugFromName('tusco_human_caudate_nucleus.tsv'));
    addAlias('colon - sigmoid', getSlugFromName('tusco_human_sigmoid_colon.tsv'));
    addAlias('colon - transverse', getSlugFromName('tusco_human_transverse_colon.tsv'));
    addAlias('esophagus - gastroesophageal junction', getSlugFromName('tusco_human_gastroesophageal_sphincter.tsv'));
    addAlias('esophagus - mucosa', getSlugFromName('tusco_human_esophagus_squamous_epithelium.tsv'));
    addAlias('esophagus - muscularis', getSlugFromName('tusco_human_esophagus_muscularis_mucosa.tsv'));
    addAlias('heart - left ventricle', getSlugFromName('tusco_human_left_ventricle_myocardium.tsv'));
    addAlias('heart-atrial appendage', getSlugFromName('tusco_human_right_atrium_auricular_region.tsv'));
    addAlias('hippocampus', getSlugFromName('tusco_human_Ammon\'s_horn.tsv'));
    addAlias('kidney - cortex', getSlugFromName('tusco_human_cortex_of_kidney.tsv'));
    addAlias('kidney - medulla', getSlugFromName('tusco_human_outer_medulla_of_kidney.tsv'));
    addAlias('liver', getSlugFromName('tusco_human_right_lobe_of_liver.tsv'));
    addAlias('lung', getSlugFromName('tusco_human_upper_lobe_of_left_lung.tsv'));
    addAlias('minor salivary gland', getSlugFromName('tusco_human_anterior_lingual_gland.tsv'));
    addAlias('muscle - skeletal', getSlugFromName('tusco_human_gastrocnemius_medialis.tsv'));
    addAlias('nucleus accumbens basal ganglia', getSlugFromName('tusco_human_nucleus_accumbens.tsv'));
    addAlias('pancreas', getSlugFromName('tusco_human_body_of_pancreas.tsv'));
    addAlias('pituitary', getSlugFromName('tusco_human_pituitary_gland.tsv'));
    addAlias('putamen basal ganglia', getSlugFromName('tusco_human_putamen.tsv'));
    addAlias('skin - not sun exposed/suprapubic', getSlugFromName('tusco_human_suprapubic_skin.tsv'));
    addAlias('skin - sun exposed/lower leg', getSlugFromName('tusco_human_lower_leg_skin.tsv'));
    addAlias('spinal cord cervical c-1', getSlugFromName('tusco_human_C1_segment_of_cervical_spinal_cord.tsv'));
    addAlias('whole blood', getSlugFromName('tusco_human_venous_blood.tsv'));
    addAlias('anterior cingulate cortex ba24', getSlugFromName('tusco_human_anterior_cingulate_cortex.tsv'));
    addAlias('cervix - ectocervix', getSlugFromName('tusco_human_ectocervix.tsv'));
    addAlias('cervix - endocervix', getSlugFromName('tusco_human_endocervix.tsv'));
    addAlias('nerve - tibial', getSlugFromName('tusco_human_tibial_nerve.tsv'));
    addAlias('bladder', getSlugFromName('tusco_human_urinary_bladder.tsv'));
    addAlias('prostate', getSlugFromName('tusco_human_prostate_gland.tsv'));
    addAlias('thyroid', getSlugFromName('tusco_human_thyroid_gland.tsv'));
    addAlias('adipose - subcutaneous', getSlugFromName('tusco_human_subcutaneous_adipose_tissue.tsv'));
    addAlias('adipose - visceral/omentum', getSlugFromName('tusco_human_omental_fat_pad.tsv'));
    addAlias('cells - cultured fibroblasts', getSlugFromName('tusco_human_fibroblast_derived_cell_line.tsv'));
    addAlias('fallopian tube', getSlugFromName('tusco_human_fallopian_tube.tsv'));
    addAlias('frontal cortex ba9', getSlugFromName('tusco_human_dorsolateral_prefrontal_cortex.tsv'));

    // Mouse tissue mappings
    addAlias('adipose tissues', getSlugFromName('tusco_mouse_adipose_tissue.tsv'));
    addAlias('mammary gland', getSlugFromName('tusco_mouse_thoracic_mammary_gland.tsv'));
    addAlias('skeletal muscle', getSlugFromName('tusco_mouse_skeletal_muscle_tissue.tsv'));

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
