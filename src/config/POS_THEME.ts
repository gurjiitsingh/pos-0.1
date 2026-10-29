 // POS_THEME.ts


// =====================================================
// POS BACKGROUNDS
// =====================================================

export type PosBackground =
  | 'white'
  | 'softSlate'
  | 'darkSlate'
  | 'black'
  | 'dark'
  | 'blue';

// =====================================================
// BACKGROUND CONFIG TYPE
// =====================================================

export type PosBackgroundConfig = {
  name: string;

  // ===================================================
  // MAIN BACKGROUND
  // ===================================================

  // Tailwind background class
  className: string;

  // Tailwind main text class
  text: string;

  // Actual CSS main text color
  textColor: string;

  // Tailwind muted text class
  mutedText: string;

  // Actual CSS muted text color
  mutedTextColor: string;

  // Text color used on light surfaces
  surfaceText: string;


  // ===================================================
  // GENERAL UI
  // ===================================================

  // Normal UI border
  border: string;

  // Softer border for items/cards/rows
  itemBorder: string;

  // Row separator
  divide: string;

  // Actual CSS line/separator color
  line: string;


  // ===================================================
  // TOPBAR
  // ===================================================

  // Topbar background
  topbarBg: string;

  // Topbar main text
  topbarText: string;

  // Topbar muted/secondary text
  topbarMutedText: string;

  // Topbar bottom border
  topbarBorder: string;


  // ===================================================
  // CATEGORY SIDEBAR
  // ===================================================

  // Category sidebar background
  categorySidebarBg: string;

  // Normal category text
  categorySidebarText: string;

  // Muted/secondary category text
  categorySidebarMutedText: string;

  // Category separator/border
  categorySidebarBorder: string;

  // Category hover background
  categorySidebarHover: string;
};


// =====================================================
// POS BACKGROUNDS
// =====================================================

// =====================================================
// POS BACKGROUNDS
// =====================================================

export const POS_BACKGROUNDS: Record<
  PosBackground,
  PosBackgroundConfig
> = {

  // ===================================================
  // WHITE
  // ===================================================

  white: {
    name: 'White',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-white',

    text: 'text-slate-800',
    textColor: '#1E293B',

    mutedText: 'text-slate-500',
    mutedTextColor: '#64748B',

    surfaceText: 'text-slate-800',

    border: 'border-slate-200',
    itemBorder: 'border-slate-200/60',
    divide: 'divide-slate-100',

    line: '#E2E8F0',

    // =================================================
    // TOPBAR
    // Slightly darker than main white
    // =================================================

    topbarBg: 'bg-slate-100',
    topbarText: 'text-slate-800',
    topbarMutedText: 'text-slate-500',
    topbarBorder: 'border-slate-200',

    // =================================================
    // CATEGORY SIDEBAR
    // Very slightly different from main background
    // =================================================

    categorySidebarBg: 'bg-zinc-300',
    categorySidebarText: 'text-slate-800',
    categorySidebarMutedText: 'text-slate-500',
    categorySidebarBorder: 'border-slate-200',
    categorySidebarHover: 'hover:bg-slate-100',
  },


  // ===================================================
  // SOFT SLATE
  // ===================================================

  softSlate: {
    name: 'Soft Slate',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-zinc-300',

    text: 'text-slate-800',
    textColor: '#1E293B',

    mutedText: 'text-slate-500',
    mutedTextColor: '#464B53',

    surfaceText: 'text-slate-800',

    border: 'border-slate-200/60',
    itemBorder: 'border-slate-300/60',
    divide: 'divide-slate-200',

    line: '#CBD5E1',

    // =================================================
    // TOPBAR
    // Slightly darker
    // =================================================

    topbarBg: 'bg-zinc-200',
    topbarText: 'text-slate-800',
    topbarMutedText: 'text-slate-600',
    topbarBorder: 'border-zinc-400',

    // =================================================
    // CATEGORY SIDEBAR
    // Slightly darker than main POS
    // =================================================

    categorySidebarBg: 'bg-zinc-400',
    categorySidebarText: 'text-slate-900',
    categorySidebarMutedText: 'text-slate-600',
    categorySidebarBorder: 'border-zinc-400',
    categorySidebarHover: 'hover:bg-zinc-200',
  },

    // ===================================================
  // BLUE
  // ===================================================

  blue: {
    name: 'Blue',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-[#5C6A83]',

    text: 'text-white',
    textColor: '#FFFFFF',

    mutedText: 'text-[#C7D2E3]',
    mutedTextColor: '#D6E2F2',

    surfaceText: 'text-slate-800',

    border: 'border-[#555]',
    itemBorder: 'border-[#5878AA]',
    divide: 'divide-[#6F8FBE]',

    line: '#828E9F',

    // =================================================
    // TOPBAR
    // Slightly darker / stronger
    // =================================================

    topbarBg: 'bg-[#4F5D75]',
    topbarText: 'text-white',
    topbarMutedText: 'text-[#C7D2E3]',
    topbarBorder: 'border-[#6F7D94]',

    // =================================================
    // CATEGORY SIDEBAR
    // Slightly darker than main
    // =================================================

    categorySidebarBg: 'bg-[#4F5D75]',
    categorySidebarText: 'text-white',
    categorySidebarMutedText: 'text-[#C7D2E3]',
    categorySidebarBorder: 'border-[#687891]',
    categorySidebarHover: 'hover:bg-[#61728C]',
  },


  // ===================================================
  // DARK SLATE
  // ===================================================

  darkSlate: {
    name: 'Dark Slate',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-slate-700',

    text: 'text-white',
    textColor: '#FFFFFF',

    mutedText: 'text-slate-200',
    mutedTextColor: '#E2E8F0',

    surfaceText: 'text-slate-800',

    border: 'border-slate-500/50',
    itemBorder: 'border-slate-500/30',
    divide: 'divide-slate-500/30',

    line: '#64748B',

    // =================================================
    // TOPBAR
    // Slightly darker than main POS
    // =================================================

    topbarBg: 'bg-slate-800',
    topbarText: 'text-white',
    topbarMutedText: 'text-slate-300',
    topbarBorder: 'border-slate-600',

    // =================================================
    // CATEGORY SIDEBAR
    // Slightly lighter than topbar
    // =================================================

    categorySidebarBg: 'bg-slate-800',
    categorySidebarText: 'text-white',
    categorySidebarMutedText: 'text-slate-200',
    categorySidebarBorder: 'border-slate-500',
    categorySidebarHover: 'hover:bg-slate-600',
  },


  // ===================================================
  // BLACK
  // ===================================================

  black: {
    name: 'Black',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-black',

    text: 'text-white',
    textColor: '#FFFFFF',

    mutedText: 'text-slate-300',
    mutedTextColor: '#CBD5E1',

    surfaceText: 'text-slate-800',

    border: 'border-slate-700',
    itemBorder: 'border-slate-800',
    divide: 'divide-slate-800',

    line: '#334155',

    // =================================================
    // TOPBAR
    // Darkest surface
    // =================================================

    topbarBg: 'bg-zinc-700',
    topbarText: 'text-white',
    topbarMutedText: 'text-slate-300',
    topbarBorder: 'border-slate-800',

    // =================================================
    // CATEGORY SIDEBAR
    // Slightly above pure black
    // =================================================

    categorySidebarBg: 'bg-zinc-700',
    categorySidebarText: 'text-white',
    categorySidebarMutedText: 'text-slate-300',
    categorySidebarBorder: 'border-slate-400',
    categorySidebarHover: 'hover:bg-slate-900',
  },


  // ===================================================
  // DARK
  // ===================================================

  dark: {
    name: 'Dark',

    // =================================================
    // MAIN POS BACKGROUND
    // =================================================

    className: 'bg-slate-800',

    text: 'text-white',
    textColor: '#FFFFFF',

    mutedText: 'text-slate-300',
    mutedTextColor: '#CBD5E1',

    surfaceText: 'text-slate-800',

    border: 'border-slate-600',
    itemBorder: 'border-slate-700',
    divide: 'divide-slate-700',

    line: '#475569',

    // =================================================
    // TOPBAR
    // Slightly darker
    // =================================================

    topbarBg: 'bg-slate-900',
    topbarText: 'text-white',
    topbarMutedText: 'text-slate-300',
    topbarBorder: 'border-slate-700',

    // =================================================
    // CATEGORY SIDEBAR
    // Slightly different from main
    // =================================================

    categorySidebarBg: 'bg-slate-750',
    categorySidebarText: 'text-white',
    categorySidebarMutedText: 'text-slate-300',
    categorySidebarBorder: 'border-slate-600',
    categorySidebarHover: 'hover:bg-slate-700',
  },



};



// =====================================================
// POS THEMES
// =====================================================

export type PosThemeName =
  | 'blue'
  | 'orange'
  | 'teal'
  | 'cyan'
  | 'amber';


// =====================================================
// POS THEME CONFIG TYPE
// =====================================================

export type PosThemeConfig = {
  // Selected / active color
  primary: string;

  // Hover color
  primaryHover: string;

  // Very light theme surface
  primaryLight: string;

  // Hover / selected-light surface
  primarySelected: string;

  // Primary readable text
  primaryText: string;

  // Inactive button background
  inactive: string;
};


// =====================================================
// POS THEMES
// =====================================================

export const POS_THEMES: Record<
  PosThemeName,
  PosThemeConfig
> = {

  // ===================================================
  // BLUE
  // ===================================================

  blue: {
    primary: '#4275EC',

    primaryHover: '#3569DF',

    primaryLight: '#EEF3FF',

    primarySelected: '#DCE6FF',

    primaryText: '#315FCF',

    inactive: '#9197a4',
  },


  // ===================================================
  // ORANGE
  // ===================================================

  orange: {
    primary: '#E98A3A',

    primaryHover: '#D97A2B',

    primaryLight: '#FFF3E8',

    primarySelected: '#FFE5D0',

    primaryText: '#C96F25',

    inactive: '#4C4C4CB8',
  },


  // ===================================================
  // TEAL
  // ===================================================

  teal: {
    primary: '#3BA7A0',

    primaryHover: '#31938D',

    primaryLight: '#E9F7F6',

    primarySelected: '#D4EFED',

    primaryText: '#287F7A',

    inactive: '#6c7675',
  },


  // ===================================================
  // CYAN
  // ===================================================

  cyan: {
    primary: '#22B8CF',

    primaryHover: '#18A7BD',

    primaryLight: '#ECFBFE',

    primarySelected: '#D8F6FA',

    primaryText: '#14869A',

    inactive: '#a1aaab',
  },


  // ===================================================
  // AMBER
  // ===================================================

  amber: {
    primary: '#F59E0B',

    primaryHover: '#D97706',

    primaryLight: '#FFF8E7',

    primarySelected: '#FDECC8',

    primaryText: '#B45309',

    inactive: '#8A7654',
  },
};