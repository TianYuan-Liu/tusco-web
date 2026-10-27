import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Alert, Box, Container, CssBaseline, LinearProgress, ThemeProvider } from '@mui/material';
import useDarkMode from './hooks/useDarkMode';
import { createAppTheme } from './theme';
import { ReleaseProvider, useRelease, useReleaseLink } from './context/ReleaseContext';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Downloads from './pages/Downloads';
import Method from './pages/Method';
import Releases from './pages/Releases';
import Cite from './pages/Cite';

// JBrowse is large: load the genome browser only when it is opened
const GenomeBrowser = lazy(() => import('./pages/GenomeBrowser'));

const TITLES: [RegExp, string][] = [
  [/^\/explore\/human/, 'Human gene sets'],
  [/^\/explore\/mouse/, 'Mouse gene sets'],
  [/^\/browser/, 'Genome browser'],
  [/^\/downloads/, 'Downloads'],
  [/^\/(method|pipeline)/, 'Method'],
  [/^\/releases/, 'Releases'],
  [/^\/cite/, 'Cite'],
];

// Scroll to the top on page changes and keep the document title in step
const RouteEffects: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    const title = TITLES.find(([re]) => re.test(pathname))?.[1];
    document.title = title ? `${title} · TUSCO` : 'TUSCO · single-isoform controls for long-read transcriptomes';
  }, [pathname, hash]);
  return null;
};

// /pipeline and /downloads/<species> are the addresses of the previous site
const LegacyDownloads: React.FC = () => {
  const { species } = useParams();
  return <Downloads key={species} />;
};
const RedirectKeepingRelease: React.FC<{ to: string }> = ({ to }) => {
  const link = useReleaseLink();
  return <Navigate to={link(to)} replace />;
};

const ReleaseError: React.FC = () => {
  const { error } = useRelease();
  if (!error) return null;
  return (
    <Container maxWidth="lg" sx={{ pt: 3 }}>
      <Alert severity="error">The list of gene set releases could not be loaded ({error}). Please reload the page.</Alert>
    </Container>
  );
};

const App: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const mode = darkMode ? 'dark' : 'light';
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ReleaseProvider>
          <RouteEffects />
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SiteHeader mode={mode} onToggleMode={toggleDarkMode} />
            <Box component="main" sx={{ flex: 1 }}>
              <ReleaseError />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<RedirectKeepingRelease to="/explore/human" />} />
                <Route path="/explore/:species" element={<Explore />} />
                <Route path="/browser" element={<RedirectKeepingRelease to="/browser/human" />} />
                <Route
                  path="/browser/:species"
                  element={
                    <Suspense fallback={<LinearProgress sx={{ m: 4 }} />}>
                      <GenomeBrowser />
                    </Suspense>
                  }
                />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/downloads/:species" element={<LegacyDownloads />} />
                <Route path="/method" element={<Method />} />
                <Route path="/pipeline" element={<RedirectKeepingRelease to="/method" />} />
                <Route path="/releases" element={<Releases />} />
                <Route path="/cite" element={<Cite />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <SiteFooter />
          </Box>
        </ReleaseProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
