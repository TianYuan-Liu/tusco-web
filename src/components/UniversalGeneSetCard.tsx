import React from 'react';
import { Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScienceIcon from '@mui/icons-material/Science';

type Species = 'human' | 'mouse';

interface UniversalGeneSetCardProps {
  species: Species;
}

const UniversalGeneSetCard: React.FC<UniversalGeneSetCardProps> = ({ species }) => {
  const speciesLabel = species === 'human' ? 'Human' : 'Mouse';
  const geneCount = species === 'human' ? 46 : 32;
  const fileName = `tusco_${species}.tsv`;
  const downloadPath = `/data/${species}/${fileName}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadPath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.03) 0%, rgba(42, 157, 143, 0.08) 100%)',
          border: '1px solid rgba(42, 157, 143, 0.15)',
          p: { xs: 3, md: 4 },
          mb: 3,
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(42, 157, 143, 0.12)',
            border: '1px solid rgba(42, 157, 143, 0.25)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2a9d8f 0%, #4DB5AA 50%, #2a9d8f 100%)',
            opacity: 0.8,
          },
        }}
      >
        {/* Decorative background element */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(42, 157, 143, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header with icon and badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #2a9d8f 0%, #238276 100%)',
                  boxShadow: '0 8px 24px rgba(42, 157, 143, 0.3)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: '#2a9d8f',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    fontSize: '0.7rem',
                  }}
                >
                  SQANTI3 Compatible
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {speciesLabel} Universal Gene Set
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Genes expressed across all tissues" arrow placement="top">
              <Chip
                icon={<ScienceIcon sx={{ fontSize: 16 }} />}
                label={`${geneCount} genes`}
                sx={{
                  backgroundColor: 'rgba(42, 157, 143, 0.12)',
                  color: '#2a9d8f',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  height: 32,
                  borderRadius: 2,
                  '& .MuiChip-icon': {
                    color: '#2a9d8f',
                  },
                }}
              />
            </Tooltip>
          </Box>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              mb: 3,
              maxWidth: 600,
              fontSize: '0.95rem',
            }}
          >
            The universal gene set contains genes expressed across all {speciesLabel.toLowerCase()} tissues.
            Use this reference file with SQANTI3 for comprehensive transcript annotation and quality control.
          </Typography>

          {/* Feature highlights */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 3,
            }}
          >
            {['Cross-tissue expression', 'SQANTI3 ready', 'Tab-separated format'].map((feature) => (
              <Box
                key={feature}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  backgroundColor: 'rgba(15, 23, 42, 0.04)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                  }}
                >
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Download button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-block' }}
          >
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                background: 'linear-gradient(135deg, #2a9d8f 0%, #238276 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(42, 157, 143, 0.35)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #238276 0%, #1a6b61 100%)',
                  boxShadow: '0 6px 20px rgba(42, 157, 143, 0.45)',
                },
              }}
            >
              Download {fileName}
            </Button>
          </motion.div>

          {/* File info */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 2,
              color: 'var(--color-text-tertiary)',
              opacity: 0.7,
            }}
          >
            TSV file with Ensembl and RefSeq identifiers
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default UniversalGeneSetCard;
