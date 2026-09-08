import { computed } from 'vue'

export const theme = {
  panelBg: '#3a3e40',
  surfaceBg: '#2a2d2e',
  surfaceAlt: '#2f3233',
  inputBg: '#222222',
  hoverBg: '#4a4e50',
  borderColor: '#4a4e50',
  accent: '#22c3dc',
  textPrimary: '#e0e0e0',
  textMuted: '#a6abad',
  textWhite: '#ffffff',
  btnPrimary: '#2e86f0',
  btnPrimaryHover: '#4c8df5',
  btnSuccess: '#1ed71e',
  btnSuccessHover: '#00e626',
  btnDanger: '#d32f2f',
  btnDangerHover: '#b71c1c',
  iconStroke: '#9ca3af',
  liquidFill: '#22c3dc',
  scrollbarThumb: '#4a4e50',
  scrollbarThumbHover: '#6a6e70'
}

export const cssVars = computed(() => ({
  '--panel-bg': theme.panelBg,
  '--surface-bg': theme.surfaceBg,
  '--surface-alt': theme.surfaceAlt,
  '--input-bg': theme.inputBg,
  '--hover-bg': theme.hoverBg,
  '--border-color': theme.borderColor,
  '--accent': theme.accent,
  '--text-primary': theme.textPrimary,
  '--text-muted': theme.textMuted,
  '--text-white': theme.textWhite,
  '--btn-primary': theme.btnPrimary,
  '--btn-primary-hover': theme.btnPrimaryHover,
  '--btn-success': theme.btnSuccess,
  '--btn-success-hover': theme.btnSuccessHover,
  '--btn-danger': theme.btnDanger,
  '--btn-danger-hover': theme.btnDangerHover,
  '--icon-stroke': theme.iconStroke,
  '--liquid-fill': theme.liquidFill,
  '--scrollbar-thumb': theme.scrollbarThumb,
  '--scrollbar-thumb-hover': theme.scrollbarThumbHover
}))