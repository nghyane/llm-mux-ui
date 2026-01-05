/**
 * LLM-Mux Design System Tokens
 * 
 * This file documents the design standards for consistency across the dashboard.
 * Refer to these patterns when creating new components or pages.
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Page-level titles
  pageTitle: 'text-2xl font-semibold tracking-tight text-(--text-primary)',
  pageDescription: 'text-sm text-(--text-secondary)',

  // Section titles (within page content)
  sectionTitle: 'text-base font-semibold text-(--text-primary)',
  sectionDescription: 'text-sm text-(--text-secondary)',

  // Modal titles (larger for focus)
  modalTitle: 'text-lg font-semibold text-(--text-primary)',

  // Card internal titles
  cardTitle: 'text-base font-semibold text-(--text-primary)',
  cardSubtitle: 'text-sm text-(--text-secondary)',

  // Labels
  label: 'text-sm text-(--text-secondary)',
  labelSmall: 'text-xs text-(--text-tertiary)',
  labelUppercase: 'text-xs font-medium text-(--text-secondary) uppercase tracking-wider',

  // Body text
  body: 'text-sm text-(--text-primary)',
  bodySecondary: 'text-sm text-(--text-secondary)',

  // Monospace (for codes, keys, etc.)
  mono: 'font-mono text-xs',
  monoSmall: 'font-mono text-[10px]',
} as const

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  // Card padding
  cardPadding: 'p-6',           // Standard content cards
  cardPaddingCompact: 'p-4',    // Stat cards, compact cards
  cardPaddingLarge: 'p-8',      // Hero sections

  // Section spacing
  sectionGap: 'space-y-8',      // Between major page sections
  contentGap: 'space-y-6',      // Within sections
  itemGap: 'space-y-4',         // Between items in a list

  // Grid gaps
  gridGap: 'gap-6',             // Standard grid gap
  gridGapCompact: 'gap-4',      // Compact grids (stats)

  // Margins
  titleMargin: 'mb-4',          // After section titles
  descriptionMargin: 'mt-1',    // After titles in headers
} as const

// ============================================================================
// SEMANTIC COLORS (Use CSS Variables)
// ============================================================================

export const semanticColors = {
  // Success states
  successBg: 'bg-(--success-bg)',
  successText: 'text-(--success-text)',
  successBadge: 'bg-(--success-bg) text-(--success-text)',

  // Error/Danger states
  dangerBg: 'bg-(--danger-bg)',
  dangerText: 'text-(--danger-text)',
  dangerBadge: 'bg-(--danger-bg) text-(--danger-text)',

  // Warning states
  warningBg: 'bg-(--warning-bg)',
  warningText: 'text-(--warning-text)',
  warningBadge: 'bg-(--warning-bg) text-(--warning-text)',

  // Info states
  infoBg: 'bg-(--info-bg)',
  infoText: 'text-(--info-text)',
  infoBadge: 'bg-(--info-bg) text-(--info-text)',

  // Neutral
  mutedBg: 'bg-(--bg-muted)',
  hoverBg: 'bg-(--bg-hover)',
} as const

// ============================================================================
// COMPONENT PATTERNS
// ============================================================================

export const patterns = {
  // Page structure
  pageWrapper: 'space-y-8',
  pageHeader: 'flex flex-col sm:flex-row sm:items-end justify-between gap-4',

  // Cards
  card: 'rounded-xl border border-(--border-color) bg-(--bg-card) shadow-sm',
  cardHover: 'hover:border-(--border-hover) transition-colors',

  // Buttons
  buttonWithIcon: 'flex items-center gap-2',

  // Stats grid
  statsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',

  // Content grid (2-3 columns)
  contentGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  contentGridWide: 'grid grid-cols-1 lg:grid-cols-3 gap-6',

  // Table container
  tableContainer: 'overflow-x-auto',
} as const

// ============================================================================
// ICON SIZING
// ============================================================================

export const iconSizes = {
  button: 'sm',        // Icons in buttons
  stat: 'md',          // Icons in stat cards
  decorative: 'lg',    // Large decorative icons
  inline: 'sm',        // Inline with text
} as const

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
  skeleton: 'animate-pulse',
  transition: 'transition-all duration-200',
  transitionColors: 'transition-colors duration-200',
} as const

export const focusRing = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ring-offset)',
  inset: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-inset',
  subtle: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--ring)',
  nav: 'focus-visible:outline-none focus-visible:bg-(--bg-hover)',
} as const

export const interactiveStates = {
  button: 'hover:bg-(--bg-hover) active:bg-(--bg-active) transition-colors',
  buttonPrimary: 'hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all',
  buttonGhost: 'hover:bg-(--bg-hover) active:bg-(--bg-active)',
  listItem: 'hover:bg-(--bg-hover) active:bg-(--bg-active) cursor-pointer',
  card: 'hover:border-(--border-hover) hover:shadow-md active:shadow-sm transition-all',
} as const
