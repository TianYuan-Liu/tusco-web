# TUSCO Website UI Refresh - Changelog

## Version 2.0.0 - UI Refresh & Paper Integration

### 🎨 Design System & Branding
- **NEW**: Extracted brand colors from official TUSCO logo (#15918A teal, #EE446F pink)
- **NEW**: Comprehensive design tokens system (`src/styles/design-tokens.css`, `tokens.json`)
- **NEW**: Dark mode support with system preference detection
- **NEW**: WCAG AA compliant color palette with 4.5:1+ contrast ratios
- **IMPROVED**: Typography hierarchy using Inter font family for scientific credibility

### 🧭 Navigation & Information Architecture
- **CHANGED**: Navigation structure aligned with paper content:
  - Home → Methods → Results → Downloads → Cite
  - Removed: Human Data, Mouse Data, Pipeline (consolidated into Downloads)
- **NEW**: Paper-grounded content organization
- **NEW**: Scientific terminology integration with contextual tooltips

### 📚 Content & Scientific Communication  
- **NEW**: Interactive glossary tooltips for technical terms (Sn, nrPre, rPre, PDR, FDR, TP/PTP/FP/FN, SQANTI3, etc.)
- **NEW**: Methods page with comprehensive pipeline documentation
- **NEW**: Results page with tabbed interface:
  - Agreement vs SIRVs analysis
  - RIN correlation studies  
  - Sequencing depth vs false negatives
  - Biological replicate consistency
  - TUSCO-novel challenge results
- **NEW**: Citation page with copy-to-clipboard functionality
- **IMPROVED**: Home page content focused on scientific methodology

### ♿ Accessibility Improvements
- **NEW**: Keyboard navigation support with visible focus indicators
- **NEW**: Screen reader optimizations with semantic HTML and ARIA labels
- **NEW**: Reduced motion support for users with vestibular disorders  
- **NEW**: High contrast mode support
- **IMPROVED**: Color contrast meeting WCAG AA standards
- **IMPROVED**: Focus management and skip links

### 🔧 Technical Enhancements
- **NEW**: React hooks for dark mode management (`useDarkMode.ts`)
- **NEW**: Reusable accessibility components (`GlossaryTooltip`, `DarkModeToggle`)
- **IMPROVED**: Component architecture with better separation of concerns
- **IMPROVED**: Performance optimizations for animations and re-renders
- **IMPROVED**: CSS custom properties for maintainable theming

### 🎯 User Experience  
- **NEW**: Smooth animations with Framer Motion optimizations
- **NEW**: Responsive design improvements for mobile and tablet
- **NEW**: Progressive disclosure of complex scientific information
- **IMPROVED**: Visual hierarchy supporting scientific documentation
- **IMPROVED**: Loading states and micro-interactions

### 📱 Responsive Design
- **IMPROVED**: Mobile-first approach with optimized breakpoints
- **IMPROVED**: Touch-friendly interactive elements (minimum 44px targets)
- **IMPROVED**: Readable typography scaling across devices
- **NEW**: Responsive navigation with collapsible menu items

### 🔄 Preserved Functionality
- **MAINTAINED**: All existing API endpoints and data structures
- **MAINTAINED**: TSV file download functionality  
- **MAINTAINED**: Interactive anatomy maps with click handlers
- **MAINTAINED**: Tissue-specific data browsing
- **MAINTAINED**: Component IDs for backward compatibility

### 📊 Data Presentation
- **NEW**: Enhanced Downloads page with species-specific sections
- **IMPROVED**: Data organization with visual cards and icons
- **MAINTAINED**: Full access to human (53 genes) and mouse (37 genes) datasets
- **IMPROVED**: Visual presentation of tissue-specific data

### 🎨 Visual Improvements
- **NEW**: Consistent spacing using design tokens (4px base unit)
- **NEW**: Rounded corners and subtle shadows for modern aesthetic
- **NEW**: Improved button states and hover effects
- **IMPROVED**: Card layouts with better visual hierarchy
- **IMPROVED**: Icon consistency and semantic usage

## Migration Notes

### For Developers
- **CSS**: All hardcoded colors replaced with CSS custom properties
- **Components**: New reusable components in `src/components/`
- **Hooks**: New custom hooks in `src/hooks/`  
- **Styles**: Design tokens available in CSS and JSON formats

### For Users
- **Navigation**: New menu structure - existing bookmarks may need updating
- **Dark Mode**: Available via toggle in navigation bar
- **Accessibility**: Improved keyboard navigation and screen reader support
- **Mobile**: Better responsive experience on tablets and phones

### Breaking Changes
- **Routes**: Changed from `/human`, `/mouse`, `/pipeline` to `/methods`, `/results`, `/downloads`, `/cite`
- **Components**: Some internal component props may have changed (external APIs unchanged)

### Backwards Compatibility
- **APIs**: All backend endpoints remain unchanged
- **Data**: No changes to data formats or structures
- **IDs**: All element IDs preserved for existing integrations

## File Changes

### New Files
- `src/styles/design-tokens.css` - Design system tokens
- `src/styles/tokens.json` - Programmatic access to tokens  
- `src/hooks/useDarkMode.ts` - Dark mode state management
- `src/components/GlossaryTooltip.tsx` - Interactive term definitions
- `src/components/DarkModeToggle.tsx` - Theme switching component
- `src/pages/Methods.tsx` - Pipeline documentation
- `src/pages/Results.tsx` - Benchmarking results with tabs
- `src/pages/Cite.tsx` - Citation and attribution
- `UX_RATIONALE.md` - Design decisions documentation
- `COLOR_PALETTE.md` - Brand and accessibility guidelines
- `CHANGELOG_UI.md` - This changelog

### Modified Files
- `src/App.tsx` - Updated routing and theme integration
- `src/components/Navbar.tsx` - New navigation structure and dark mode
- `src/pages/Home.tsx` - Scientific content and glossary integration  
- `src/pages/Downloads.tsx` - Enhanced data presentation (renamed from HumanData/MouseData)

### Preserved Files
- `src/components/TissueDownloadGrid.tsx` - Data download functionality
- `src/components/AnatomyMap.tsx` - Interactive anatomy visualizations
- All data files in `data/` directory
- Backend server files and API endpoints