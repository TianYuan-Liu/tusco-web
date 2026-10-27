import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, ChartOptions, LinearScale, Plugin, Tooltip } from 'chart.js';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Tissue } from '../data/catalog';
import { fontStack, tokens } from '../theme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  tissues: Tissue[];
  selected: string | null;
  onSelect: (slug: string) => void;
  releaseLabel: string;
  previousLabel: string | null;
}

const BAR = 12; // px per bar (cap 24)
const ROW = 20; // px per category band

const TissueChart: React.FC<Props> = ({ tissues, selected, onSelect, releaseLabel, previousLabel }) => {
  const theme = useTheme();
  const t = tokens[theme.palette.mode];
  const showPrevious = !!previousLabel && tissues.some((x) => x.previous !== null);
  // Long tissue names are shortened on phones; the tooltip and the table keep the full name
  const narrow = useMediaQuery(theme.breakpoints.down('sm'));
  const maxLabel = narrow ? 18 : 36;

  // Previous-release count drawn as a short tick across each bar band
  const previousTicks = useMemo<Plugin<'bar'>>(
    () => ({
      id: 'previousTicks',
      afterDatasetsDraw(chart) {
        if (!showPrevious) return;
        const { ctx, scales } = chart;
        const x = scales.x;
        const y = scales.y;
        ctx.save();
        ctx.strokeStyle = t.inkSecondary;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        tissues.forEach((tissue, i) => {
          if (!tissue.previous) return;
          const px = x.getPixelForValue(tissue.previous);
          const py = y.getPixelForValue(i);
          ctx.beginPath();
          ctx.moveTo(px, py - BAR / 2 - 2);
          ctx.lineTo(px, py + BAR / 2 + 2);
          ctx.stroke();
        });
        ctx.restore();
      },
    }),
    [tissues, showPrevious, t.inkSecondary]
  );

  const data = useMemo(
    () => ({
      labels: tissues.map((x) => x.name),
      datasets: [
        {
          label: releaseLabel,
          data: tissues.map((x) => x.n),
          backgroundColor: tissues.map((x) => (!selected || x.slug === selected ? t.series : t.seriesMuted)),
          hoverBackgroundColor: tissues.map((x) => (!selected || x.slug === selected ? t.brand : t.inkMuted)),
          // 4px rounded data end, square at the baseline
          borderRadius: 4,
          borderSkipped: 'start' as const,
          barThickness: BAR,
        },
      ],
    }),
    [tissues, selected, releaseLabel, t]
  );

  const options = useMemo<ChartOptions<'bar'>>(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      layout: { padding: { right: 12 } },
      onClick: (_e, elements) => {
        if (elements.length) onSelect(tissues[elements[0].index].slug);
      },
      onHover: (e, elements) => {
        const target = e.native?.target as HTMLElement | undefined;
        if (target) target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      interaction: { mode: 'index', axis: 'y', intersect: false },
      scales: {
        x: {
          position: 'top',
          beginAtZero: true,
          // leave room for previous-release ticks larger than every bar
          suggestedMax: Math.max(0, ...tissues.map((x) => Math.max(x.n, x.previous || 0))),
          grid: { color: t.grid, lineWidth: 1 },
          border: { display: false },
          ticks: { color: t.inkMuted, font: { family: fontStack, size: 11 }, maxTicksLimit: 6 },
          title: { display: true, text: 'Genes in the tissue set', color: t.inkMuted, font: { family: fontStack, size: 11 } },
        },
        y: {
          grid: { display: false },
          border: { color: t.grid },
          ticks: {
            color: t.inkSecondary,
            font: { family: fontStack, size: 11.5 },
            autoSkip: false,
            callback: (_value, i) => {
              const name = tissues[i]?.name || '';
              return name.length > maxLabel ? `${name.slice(0, maxLabel - 1)}…` : name;
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.palette.mode === 'dark' ? '#0b0f12' : '#0f1720',
          titleFont: { family: fontStack, size: 12, weight: 600 },
          bodyFont: { family: fontStack, size: 12 },
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (items) => `${items[0].formattedValue} genes`,
            label: (item) => {
              const tissue = tissues[item.dataIndex];
              const lines = [tissue.name];
              if (showPrevious) lines.push(`${previousLabel}: ${tissue.previous ?? 0}`);
              return lines;
            },
            footer: () => 'Click to list the genes',
          },
        },
      },
    }),
    [tissues, onSelect, t, theme.palette.mode, showPrevious, previousLabel, maxLabel]
  );

  return (
    <Box>
      {showPrevious && (
        <Stack direction="row" spacing={2.5} sx={{ px: 0.5, pb: 1 }} aria-hidden>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 10, borderRadius: '0 3px 3px 0', backgroundColor: t.series }} />
            <Typography variant="caption">{releaseLabel}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 2, height: 14, borderRadius: 1, backgroundColor: t.inkSecondary }} />
            <Typography variant="caption">{previousLabel}</Typography>
          </Stack>
        </Stack>
      )}
      <Box sx={{ height: tissues.length * ROW + 48, position: 'relative' }}>
        <Bar data={data} options={options} plugins={[previousTicks]} aria-label="Genes per tissue set" role="img" />
      </Box>
    </Box>
  );
};

export default TissueChart;
