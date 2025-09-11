import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import AnatomyMap from '../components/AnatomyMap';
import { useNavigate, useParams } from 'react-router-dom';

interface TissueData {
  tissueName: string;
  uberonId: string;
  filename: string;
  originalFile: string;
  size: string;
}

const Downloads: React.FC = () => {
  const [humanTissues, setHumanTissues] = useState<TissueData[]>([]);
  const [mouseTissues, setMouseTissues] = useState<TissueData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { species } = useParams();
  const routeSpecies: 'human' | 'mouse' = species === 'mouse' ? 'mouse' : 'human';
  const [speciesTab, setSpeciesTab] = useState<'human' | 'mouse'>(routeSpecies);

  // Simplified page: no species tab state required

  useEffect(() => {
    const fetchTissues = async () => {
      try {
        const [humanResponse, mouseResponse] = await Promise.all([
          fetch('/api/tissues/human'),
          fetch('/api/tissues/mouse')
        ]);
        
        const humanData = await humanResponse.json();
        const mouseData = await mouseResponse.json();
        
        setHumanTissues(humanData);
        setMouseTissues(mouseData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tissues:', error);
        setLoading(false);
      }
    };

    fetchTissues();
  }, []);

  // Keep tab state in sync with URL param
  useEffect(() => {
    if (speciesTab !== routeSpecies) {
      setSpeciesTab(routeSpecies);
    }
  }, [routeSpecies, speciesTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: 'var(--color-bg-default)' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                mb: 3,
                textAlign: 'center',
                color: 'var(--color-text-primary)',
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              Downloads
            </Typography>
            {/* Removed descriptive subtitle to simplify the page */}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 4 },
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-paper)',
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{
                        mb: 1.5,
                        color: 'var(--color-text-primary)',
                        textAlign: 'center',
                      }}
                    >
                      Interactive Data Exploration
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        textAlign: 'center',
                        maxWidth: 900,
                        mx: 'auto',
                      }}
                    >
                      Explore tissue-specific TUSCO gene expression across anatomy. Click labeled tissues to download TSV data files.
                    </Typography>

                    <Tabs
                      value={speciesTab === 'human' ? 0 : 1}
                      onChange={(_, v) => {
                        const newSpecies = v === 0 ? 'human' : 'mouse';
                        setSpeciesTab(newSpecies);
                        navigate(`/downloads/${newSpecies}`);
                      }}
                      variant="fullWidth"
                      sx={{ mb: 3 }}
                    >
                      <Tab label="Human" />
                      <Tab label="Mouse" />
                    </Tabs>

                    <Divider sx={{ mb: 3 }} />

                    {speciesTab === 'human' ? (
                      <Box>
                        <Typography variant="h5" sx={{ mb: 1.5, color: 'var(--color-text-primary)' }}>
                          Human TUSCO Gene Distribution
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'var(--color-text-secondary)' }}>
                          {humanTissues.length} tissue datasets
                        </Typography>
                        {!loading && (
                          <AnatomyMap species="human" tissues={humanTissues} />
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h5" sx={{ mb: 1.5, color: 'var(--color-text-primary)' }}>
                          Mouse TUSCO Gene Distribution
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'var(--color-text-secondary)' }}>
                          {mouseTissues.length} tissue datasets
                        </Typography>
                        {!loading && (
                          <AnatomyMap species="mouse" tissues={mouseTissues} />
                        )}
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default Downloads;
