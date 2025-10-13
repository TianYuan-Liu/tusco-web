import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import ArchiveIcon from '@mui/icons-material/Archive';
import BarChartIcon from '@mui/icons-material/BarChart';

type Species = 'human' | 'mouse';

interface BulkDownloadBoxProps {
  species: Species;
  tissueCount: number;
}

const BulkDownloadBox: React.FC<BulkDownloadBoxProps> = ({ species, tissueCount }) => {
  const [downloadingBulk, setDownloadingBulk] = useState(false);

  const speciesLabel = species === 'human' ? 'Human' : 'Mouse';
  const speciesPrefix = `tusco_${species}`;

  const handleBulkDownload = async () => {
    setDownloadingBulk(true);
    try {
      const response = await fetch(`/api/download/bulk/${species}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${speciesPrefix}_all_tissues.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Bulk download failed:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setDownloadingBulk(false);
    }
  };

  const handleStatisticsDownload = async () => {
    try {
      const response = await fetch(`/api/statistics/${species}`);
      if (!response.ok) throw new Error('Statistics download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${speciesPrefix}_tissue_statistics.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Statistics download failed:', error);
      alert('Failed to download statistics. Please try again.');
    }
  };

  const downloadCards = [
    {
      title: 'All Tissue Datasets',
      description: `Download all ${tissueCount} individual tissue TSV files as a single ZIP archive`,
      icon: <ArchiveIcon sx={{ fontSize: 40, color: '#2a9d8f' }} />,
      action: handleBulkDownload,
      loading: downloadingBulk,
      badge: `${tissueCount} files`,
    },
    {
      title: 'Tissue Statistics',
      description: 'Dynamically generated summary statistics for all tissue datasets',
      icon: <BarChartIcon sx={{ fontSize: 40, color: '#f4a261' }} />,
      action: handleStatisticsDownload,
      loading: false,
      badge: 'TSV',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        border: '1px solid var(--color-border-default)',
        backgroundColor: 'var(--color-bg-paper)',
        mb: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 1.5,
            color: 'var(--color-text-primary)',
            fontWeight: 600,
          }}
        >
          {speciesLabel} TUSCO Dataset Downloads
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          Access complete TUSCO gene expression datasets. Download individual files via the anatomy map below,
          or get the complete collection here.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {downloadCards.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(15, 23, 42, 0.12)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#2a9d8f',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(42, 157, 143, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {card.icon}
                  <Chip
                    label={card.badge}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(42, 157, 143, 0.1)',
                      color: '#2a9d8f',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    color: 'var(--color-text-secondary)',
                    flexGrow: 1,
                    lineHeight: 1.6,
                  }}
                >
                  {card.description}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={card.loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  disabled={card.loading}
                  onClick={card.action}
                  sx={{
                    backgroundColor: '#2a9d8f',
                    color: 'white',
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: '#238276',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(42, 157, 143, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                >
                  {card.loading ? 'Preparing Download...' : 'Download'}
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'rgba(42, 157, 143, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(42, 157, 143, 0.2)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          <strong>Note:</strong> All TSV files contain tab-separated gene annotations with Ensembl and RefSeq identifiers.
          Individual tissue files can also be downloaded by clicking labeled regions on the anatomy map below.
        </Typography>
      </Box>
    </Paper>
  );
};

export default BulkDownloadBox;
