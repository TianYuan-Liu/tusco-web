import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

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

// Normalize tissue name according to the specified rules
const normalizeName = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^a-z0-9\s-]/g, '') // Remove punctuation except hyphens
    .trim();
};

// Create a normalized filename-friendly version of the tissue name
const createFilenameFriendlyName = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9_-]/g, '') // Remove other punctuation except hyphens and underscores
    .trim();
};

// Extract base tissue name from compound names (e.g., "Kidney - Cortex/Medulla" -> "kidney")
const getBaseTissueName = (normalizedLabel: string): string => {
  // Split on hyphen and take the first part (e.g., "Heart - Left Ventricle" -> "heart")
  const parts = normalizedLabel.split(' - ');
  return parts[0].trim();
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

    // Enhance interactivity: mark all SVG text nodes as clickable
    const applyInteractiveStyles = () => {
      try {
        const texts = container.querySelectorAll('svg text');
        texts.forEach((el) => {
          (el as SVGTextElement).style.cursor = 'pointer';
          (el as SVGTextElement).style.userSelect = 'none' as any;
        });
      } catch (e) {
        // best effort styling
      }
    };

    // Find the best matching tissue for a given label
    const findMatchForLabel = (rawLabel: string): TissueData | undefined => {
      const normalizedLabel = normalizeName(rawLabel);
      if (!normalizedLabel) return undefined;

      // 1. Try exact match first
      let match = tissues.find((t) => normalizeName(t.tissueName) === normalizedLabel);
      if (match) return match;

      // 2. Try base tissue match for compound labels (e.g., "Kidney - Cortex" -> "kidney")
      const baseTissue = getBaseTissueName(normalizedLabel);
      if (baseTissue !== normalizedLabel) {
        match = tissues.find((t) => normalizeName(t.tissueName) === baseTissue);
        if (match) return match;
      }

      // 3. Try substring match (either direction)
      match = tissues.find((t) => {
        const normalizedTissueName = normalizeName(t.tissueName);
        return normalizedTissueName.includes(normalizedLabel) || normalizedLabel.includes(normalizedTissueName);
      });
      
      return match;
    };

    const handleClick = (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      if (!target) return;

      // Try direct text element content
      const getLabelFromElement = (elem: Element | null): string => {
        if (!elem) return '';
        const text = (elem.textContent || '').trim();
        if (text) return text;
        // If a group is clicked, try to find a text node inside
        const groupText = elem.querySelector('text');
        return (groupText?.textContent || '').trim();
      };

      let label = '';
      if (target.tagName.toLowerCase() === 'text') {
        label = getLabelFromElement(target);
      } else {
        // If clicked on a shape near a label, try nearest text or group
        const nearestText = target.closest('text') as Element | null;
        if (nearestText) {
          label = getLabelFromElement(nearestText);
        } else {
          const group = target.closest('g');
          label = getLabelFromElement(group as Element | null);
        }
      }

      if (!label) {
        console.log('No label found for click event');
        return;
      }

      const match = findMatchForLabel(label);
      if (!match) {
        console.log(`No matching tissue found for label: ${label}`);
        return;
      }

      // Create the friendly filename according to specifications
      const friendlyFilename = `tusco_${species}_${createFilenameFriendlyName(match.tissueName)}.tsv`;

      const link = document.createElement('a');
      link.href = `/data/${species}/${match.originalFile}`;
      link.download = friendlyFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    container.addEventListener('click', handleClick);
    // styles after the SVG is in the DOM
    requestAnimationFrame(applyInteractiveStyles);

    return () => {
      container.removeEventListener('click', handleClick);
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


