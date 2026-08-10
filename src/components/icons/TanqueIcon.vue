<template>
  <svg :width="size" :height="size * 1.55" viewBox="0 0 400 620" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="tanque-body">
        <path d="M100 130 A100 85 0 0 1 300 130 L300 555 A100 18 0 0 1 100 555 Z"/>
      </clipPath>
    </defs>

    <!-- Líquido -->
    <g clip-path="url(#tanque-body)">
      <rect x="0" :y="liquidY" width="400" :height="liquidHeight" :fill="color" opacity="0.85"/>
    </g>

    <!-- Outlines -->
    <g fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M100 130 A100 85 0 0 1 300 130 L300 555 A100 18 0 0 1 100 555 Z"/>
      <path d="M100 540 A100 18 0 0 0 300 540"/>
      <path d="M186 46 L186 34 Q186 28 192 28 L208 28 Q214 28 214 34 L214 46"/>
    </g>

    <g fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round">
      <path d="M126 140 V535 M138 140 V535"/>
      <path d="M126 170 H134 M126 210 H134 M126 250 H134 M126 290 H134
               M126 330 H134 M126 370 H134 M126 410 H134 M126 450 H134
               M126 490 H134 M126 530 H134"/>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 80 },
  fillPercent: { type: Number, default: 0 },
  color: { type: String, default: '#22c3dc' }
})

const TOP = 130
const BOTTOM = 555
const TOTAL_H = BOTTOM - TOP

const liquidHeight = computed(() => (props.fillPercent / 100) * TOTAL_H)
const liquidY = computed(() => BOTTOM - liquidHeight.value)
</script>
