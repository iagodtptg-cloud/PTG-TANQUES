import { computed } from 'vue'

const theme = {
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

const cssVars = computed(() => ({
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

const panelClass = 'bg-[var(--panel-bg)]'
const surfaceClass = 'bg-[var(--surface-bg)]'
const surfaceAltClass = 'bg-[var(--surface-alt)]'
const inputClass = 'bg-[var(--input-bg)] text-[var(--text-white)] border-[var(--border-color)]'
const hoverClass = 'hover:bg-[var(--hover-bg)]'
const borderClass = 'border-[var(--borderColor)]'
const textPrimaryClass = 'text-[var(--text-primary)]'
const textMutedClass = 'text-[var(--text-muted)]'
const textWhiteClass = 'text-[var(--text-white)]'
const btnPrimaryClass = 'bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] text-white'
const btnSuccessClass = 'bg-[var(--btn-success)] hover:bg-[var(--btn-success-hover)] text-white'
const btnDangerClass = 'bg-[var(--btn-danger)] hover:bg-[var(--btn-danger-hover)] text-white'

export function useTheme() {
  return {
    theme,
    cssVars,
    panelClass,
    surfaceClass,
    surfaceAltClass,
    inputClass,
    hoverClass,
    borderClass,
    textPrimaryClass,
    textMutedClass,
    textWhiteClass,
    btnPrimaryClass,
    btnSuccessClass,
    btnDangerClass
  }
}