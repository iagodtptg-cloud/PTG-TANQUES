<template>
  <svg :width="size" :height="size * 0.93" viewBox="0 0 600 560" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="ibc-body">
        <path d="M90 170 L220 140 L510 140 L510 430 L380 470 L90 470 Z"/>
      </clipPath>
    </defs>

    <!-- Líquido -->
    <g clip-path="url(#ibc-body)">
      <rect x="0" :y="liquidY" width="600" :height="liquidHeight" :fill="color" opacity="0.85"/>
    </g>

    <!-- Estrutura -->
    <g fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M90 170 L220 140 L510 140 L510 430 L380 470 L90 470 Z"/>
      <path d="M90 170 H380 V470 M380 170 L510 140"/>
      <path d="M90 470 V500 H380 V470"/>
      <path d="M380 470 V500 L510 460 V430"/>
    </g>

    <!-- Gaiola -->
    <g fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round">
      <path d="M162 170 V470 M235 170 V470 M308 170 V470"/>
      <path d="M90 245 H380 M90 320 H380 M90 395 H380"/>
      <path d="M412 162 V460 M445 155 V450 M478 148 V440"/>
      <path d="M380 245 L510 212 M380 320 L510 285 M380 395 L510 358"/>
      <path d="M162 170 L292 140 M235 170 L365 140 M308 170 L438 140"/>
      <path d="M133 160 H423 M176 150 H466"/>
    </g>

    <!-- Tampa -->
    <g fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <ellipse fill="#9ca3af" cx="330" cy="143" rx="26" ry="9"/>
      <path d="M304 143 V152 A26 9 0 0 0 356 152 V143"/>
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

const TOP = 140
const BOTTOM = 470
const TOTAL_H = BOTTOM - TOP

const liquidHeight = computed(() => (props.fillPercent / 100) * TOTAL_H)
const liquidY = computed(() => BOTTOM - liquidHeight.value)
</script>
