<template>
  <svg :width="size" :height="size * 1.2" viewBox="0 0 600 720" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="bombona-body">
        <path d="M117 202 L136 146 Q139 137 149 137 L238 137 Q248 137 251 128
                 L260 82 Q263 71 274 71 L449 71 Q459 71 463 80 L483 136
                 L483 616 Q483 649 450 649 L150 649 Q117 649 117 616 Z"/>
      </clipPath>
    </defs>

    <!-- Líquido -->
    <g clip-path="url(#bombona-body)">
      <rect x="0" :y="liquidY" width="600" :height="liquidHeight" :fill="color" opacity="0.85"/>
    </g>

    <!-- Outlines -->
    <g fill="none" stroke="#9ca3af" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M117 202 L136 146 Q139 137 149 137 L238 137 Q248 137 251 128
               L260 82 Q263 71 274 71 L449 71 Q459 71 463 80 L483 136
               L483 616 Q483 649 450 649 L150 649 Q117 649 117 616 Z"/>
      <path d="M154 137 L154 98 Q154 93 159 93 L229 93 Q234 93 234 98 L234 137"/>
      <path d="M166 96 V134 M178 96 V134 M190 96 V134 M202 96 V134 M214 96 V134 M224 96 V134"/>
      <rect x="146" y="146" width="112" height="21" rx="10.5"/>
      <rect x="296" y="105" width="136" height="41" rx="20.5"/>
      <path d="M307 158 H424"/>
      <path d="M128 211 H472 V601 Q472 634 439 634 H161 Q128 634 128 601 Z"/>
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

const TOP = 202
const BOTTOM = 649
const TOTAL_H = BOTTOM - TOP

const liquidHeight = computed(() => (props.fillPercent / 100) * TOTAL_H)
const liquidY = computed(() => BOTTOM - liquidHeight.value)
</script>
