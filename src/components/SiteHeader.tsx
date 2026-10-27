import React, { useState } from 'react';
import { NavLink, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useRelease, useReleaseLink } from '../context/ReleaseContext';
import { inSentence } from '../data/catalog';
import Logo from './Logo';

const NAV = [
  { to: '/explore/human', match: '/explore', label: 'Gene sets' },
  { to: '/browser/human', match: '/browser', label: 'Genome browser' },
  { to: '/downloads', match: '/downloads', label: 'Downloads' },
  { to: '/method', match: '/method', label: 'Method' },
  { to: '/releases', match: '/releases', label: 'Releases' },
  { to: '/cite', match: '/cite', label: 'Cite' },
];

interface Props {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export const ReleaseSelect: React.FC = () => {
  const { index, release, setRelease } = useRelease();
  if (!index || !release) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" color="text.secondary" component="label" htmlFor="release-select">
        Release
      </Typography>
      <Select
        size="small"
        value={release.id}
        onChange={(e) => setRelease(e.target.value as string)}
        inputProps={{ id: 'release-select' }}
        sx={{ fontSize: '0.85rem', '& .MuiSelect-select': { py: 0.5, pl: 1.25 } }}
      >
        {index.releases.map((r) => (
          <MenuItem key={r.id} value={r.id} sx={{ fontSize: '0.875rem' }}>
            {r.id}
            <Typography component="span" variant="caption" sx={{ ml: 1 }}>
              {r.id === index.current ? 'current' : inSentence(r.name)}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

const SiteHeader: React.FC<Props> = ({ mode, onToggleMode }) => {
  const theme = useTheme();
  const link = useReleaseLink();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (match: string) => pathname.startsWith(match) || (match === '/method' && pathname.startsWith('/pipeline'));

  return (
    <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" spacing={3} sx={{ height: { xs: 58, md: 64 } }}>
          <Box component={RouterLink} to={link('/')} aria-label="TUSCO home" sx={{ color: 'text.primary', flexShrink: 0 }}>
            <Logo height={30} teal={mode === 'dark' ? theme.palette.primary.main : undefined} />
          </Box>

          <Stack component="nav" direction="row" spacing={2.5} sx={{ display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch' }}>
            {NAV.map((item) => (
              <Box
                key={item.to}
                component={NavLink}
                to={link(item.to)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  color: isActive(item.match) ? 'text.primary' : 'text.secondary',
                  fontWeight: isActive(item.match) ? 600 : 400,
                  borderBottom: 2,
                  borderColor: isActive(item.match) ? 'primary.main' : 'transparent',
                  mb: '-1px',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ReleaseSelect />
          </Box>
          <Tooltip title={mode === 'dark' ? 'Light theme' : 'Dark theme'}>
            <IconButton onClick={onToggleMode} aria-label="Toggle dark theme" size="small" disableRipple>
              {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            size="small"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, p: 2 }} role="presentation">
          <Box sx={{ mb: 2 }}>
            <ReleaseSelect />
          </Box>
          <List>
            {NAV.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={link(item.to)}
                selected={isActive(item.match)}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SiteHeader;
