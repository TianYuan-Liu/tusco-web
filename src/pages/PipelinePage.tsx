import React, { useState } from 'react';
import { Container, Typography, Box, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import GeneSelectionPipeline from '../components/GeneSelectionPipeline';

const PipelinePage = () => {
  const [species, setSpecies] = useState<'human' | 'mouse'>('human');

  const handleSpeciesChange = (
    event: React.MouseEvent<HTMLElement>,
    newSpecies: 'human' | 'mouse' | null,
  ) => {
    if (newSpecies !== null) {
      setSpecies(newSpecies);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          pt: { xs: 6, md: 8 },
          pb: { xs: 4, md: 6 },
          overflow: 'hidden',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: '#0f172a',
                  textAlign: 'center',
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  lineHeight: 1.2,
                }}
              >
                TUSCO Gene Selection Pipeline
              </Typography>
              <Divider 
                sx={{ 
                  width: '50px', 
                  mx: 'auto', 
                  my: 2, 
                  borderColor: '#15918A',
                  borderWidth: 2,
                }} 
              />
              <Typography
                variant="subtitle1"
                sx={{
                  mb: { xs: 3, md: 4 },
                  textAlign: 'center',
                  color: '#475569',
                  maxWidth: 700,
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                Discover our reproducible pipeline integrating multi-source annotations, population splicing evidence, and expression compendia with strict "no alternative isoforms" criteria
              </Typography>
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <ToggleButtonGroup
                  value={species}
                  exclusive
                  onChange={handleSpeciesChange}
                  aria-label="species selection"
                  sx={{
                    '& .MuiToggleButtonGroup-grouped': {
                      border: '1px solid rgba(15, 23, 42, 0.15)',
                      px: 3,
                      py: 1,
                      color: '#475569',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(21, 145, 138, 0.08)',
                        color: '#15918A',
                        borderColor: 'rgba(21, 145, 138, 0.25)',
                        fontWeight: 600,
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(15, 23, 42, 0.04)',
                      },
                    },
                  }}
                >
                  <ToggleButton 
                    value="human" 
                    aria-label="human genes"
                    sx={{
                      borderRadius: '8px 0 0 8px',
                    }}
                  >
                    Human Genes
                  </ToggleButton>
                  <ToggleButton 
                    value="mouse" 
                    aria-label="mouse genes"
                    sx={{
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    Mouse Genes
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <GeneSelectionPipeline species={species} />
    </motion.div>
  );
};

export default PipelinePage;