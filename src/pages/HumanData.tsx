import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Skeleton, Card, CardContent, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import TissueDownloadGrid from '../components/TissueDownloadGrid';
import StorageIcon from '@mui/icons-material/Storage';

interface TissueData {
  tissueName: string;
  uberonId: string;
  filename: string;
  originalFile: string;
  size: string;
}

const HumanData = () => {
  const [tissues, setTissues] = useState<TissueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tissues/human')
      .then(response => response.json())
      .then(data => {
        setTissues(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
        setLoading(false);
      });
  }, []);

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
              <StorageIcon 
                sx={{ 
                  fontSize: { xs: 40, md: 48 },
                  color: '#15918A',
                  mb: 2,
                }}
              />
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
                Human Tissue Data
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
                Curated TUSCO gene sets for human tissues. Click any tissue to download the corresponding TSV file with gene annotations.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Card 
                  key={item} 
                  elevation={0}
                  sx={{ 
                    height: '200px',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: '#ffffff',
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="circular" width={20} height={20} />
                    </Box>
                    <Skeleton animation="wave" height={28} width="85%" sx={{ mb: 2 }} />
                    <Box sx={{ mt: 'auto' }}>
                      <Skeleton animation="wave" height={24} width="40%" sx={{ mb: 1 }} />
                      <Skeleton animation="wave" height={20} width="70%" />
                    </Box>
                  </CardContent>
                </Card>
              ))
            }
            </Box>
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TissueDownloadGrid tissues={tissues} species="human" />
          </motion.div>
        )}
      </Container>
    </motion.div>
  );
};

export default HumanData;
