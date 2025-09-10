import React from 'react';
import {
  Box,
  List,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import FileIcon from '@mui/icons-material/Description';

interface GTFFile {
  name: string;
  size: string;
  path: string;
}

interface GTFFileListProps {
  files: GTFFile[];
  species: 'human' | 'mouse';
}

const GTFFileList: React.FC<GTFFileListProps> = ({ files, species }) => {
  const handleDownload = (filePath: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:3001/data/${species}/${filePath}`;
    link.download = filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Professional color scheme based on TUSCO logo
  const colorScheme = {
    main: '#15918A',
    light: 'rgba(21, 145, 138, 0.04)',
    accent: '#4DB5AA',
    border: 'rgba(21, 145, 138, 0.15)',
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <List sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(380px, 1fr))' },
          gap: 3,
          p: 0,
        }}>
          {files.map((file, index) => {
            const formattedName = file.name
              .replace(`tusco_${species}_`, '')
              .replace('.gtf', '')
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            return (
              <motion.div
                key={file.path}
                variants={itemVariants}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: '#ffffff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.12)',
                      borderColor: colorScheme.border,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <FileIcon sx={{ 
                      fontSize: 24, 
                      color: colorScheme.main,
                      mr: 1.5,
                      mt: 0.25,
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '1rem',
                          lineHeight: 1.4,
                          mb: 1,
                          color: '#0f172a'
                        }}
                      >
                        {formattedName}
                      </Typography>
                      <Chip
                        icon={<DownloadIcon sx={{ fontSize: '0.75rem' }} />}
                        label={file.size}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: colorScheme.border,
                          color: colorScheme.main,
                          backgroundColor: colorScheme.light,
                          fontSize: '0.75rem',
                          height: '24px',
                          '& .MuiChip-icon': {
                            color: colorScheme.main,
                          },
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    mt: 'auto',
                    pt: 1
                  }}>
                    <Tooltip title="Download GTF file">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <IconButton
                          onClick={() => handleDownload(file.path)}
                          size="small"
                          sx={{
                            bgcolor: colorScheme.light,
                            color: colorScheme.main,
                            border: `1px solid ${colorScheme.border}`,
                            '&:hover': {
                              bgcolor: 'rgba(21, 145, 138, 0.08)',
                              borderColor: colorScheme.main,
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </motion.div>
                    </Tooltip>
                  </Box>
                </Paper>
              </motion.div>
            );
          })}
        </List>
      </motion.div>
    </Box>
  );
};

export default GTFFileList;