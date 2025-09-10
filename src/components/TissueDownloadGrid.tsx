import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Paper,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import BiotechIcon from '@mui/icons-material/Biotech';

interface TissueData {
  tissueName: string;
  uberonId: string;
  filename: string;
  originalFile: string;
  size: string;
}

interface TissueDownloadGridProps {
  tissues: TissueData[];
  species: 'human' | 'mouse';
}

const TissueDownloadGrid: React.FC<TissueDownloadGridProps> = ({ tissues, species }) => {
  const handleDownload = (tissue: TissueData) => {
    // Create download link with friendly filename
    const link = document.createElement('a');
    link.href = `http://localhost:3001/data/${species}/${tissue.originalFile}`;
    link.download = tissue.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Color scheme based on TUSCO logo
  const colorScheme = {
    main: '#15918A',
    light: 'rgba(21, 145, 138, 0.04)',
    accent: '#4DB5AA',
    border: 'rgba(21, 145, 138, 0.15)',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={3}>
        {tissues.map((tissue, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tissue.uberonId}>
            <motion.div
              variants={itemVariants}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
            >
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#ffffff',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(21, 145, 138, 0.12)',
                    borderColor: colorScheme.border,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleDownload(tissue)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    p: 0,
                  }}
                >
                  <CardContent sx={{ 
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}>
                    {/* Header with icon */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 1 
                    }}>
                      <BiotechIcon sx={{ 
                        fontSize: 24, 
                        color: colorScheme.main,
                      }} />
                      <Tooltip title="Click to download">
                        <DownloadIcon sx={{ 
                          fontSize: 20, 
                          color: colorScheme.accent,
                          opacity: 0.7,
                        }} />
                      </Tooltip>
                    </Box>

                    {/* Tissue name */}
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        color: '#0f172a',
                        textTransform: 'capitalize',
                        minHeight: '2.6rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {tissue.tissueName}
                    </Typography>

                    {/* Metadata */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1,
                      mt: 'auto'
                    }}>
                      <Chip
                        label={tissue.size}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: colorScheme.border,
                          color: colorScheme.main,
                          backgroundColor: colorScheme.light,
                          fontSize: '0.75rem',
                          height: '24px',
                          alignSelf: 'flex-start',
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                      />
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(15, 23, 42, 0.02)',
                          border: '1px solid rgba(15, 23, 42, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#64748b',
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {tissue.uberonId}
                        </Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
};

export default TissueDownloadGrid;