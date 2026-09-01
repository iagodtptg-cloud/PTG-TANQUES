<template>
<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size * 2" viewBox="580 80 460 920" preserveAspectRatio="xMidYMid meet">
  <defs>
    <pattern id="ticks" width="10" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 1 H9 M0 5 H5 M0 9 H5 M0 13 H5 M0 17 H7"
            stroke="#000" stroke-width="1.4"/>
    </pattern>
    <clipPath id="aboveRef">
      <path d="M0 0 H1600 V737 H992 Q812 793 632 737 H0 Z"/>
    </clipPath>
    <clipPath id="tankBody">
      <path d="M628 212 L632 737 Q812 793 992 737 L995 212 C992 150 916 126 811 126 C706 126 630 150 628 212 Z"/>
    </clipPath>
  </defs>

  <!-- ===== BASE ===== -->
  <path d="M652 880 L747 938 L966 906 L868 848 Z" fill="none"
        stroke="#000" stroke-width="9" stroke-linejoin="round"/>
  <path d="M652 880 L747 938 L966 906 L868 848 Z" fill="none"
        stroke="none" stroke-width="5" stroke-linejoin="round"/>

  <path d="M868 810 V864" fill="none" stroke="#000" stroke-width="9"/>
  <path d="M868 810 V864" fill="none" stroke="none" stroke-width="5"/>
  <ellipse cx="868" cy="869" rx="15" ry="6" fill="#000" stroke="#000" stroke-width="2.5"/>

  <path d="M652 754 V898" fill="none" stroke="#000" stroke-width="9"/>
  <path d="M652 754 V898" fill="none" stroke="none" stroke-width="5"/>
  <ellipse cx="654" cy="903" rx="17" ry="7" fill="#000" stroke="#000" stroke-width="2.5"/>

  <path d="M966 752 V924" fill="none" stroke="#000" stroke-width="9"/>
  <path d="M966 752 V924" fill="none" stroke="none" stroke-width="5"/>
  <ellipse cx="966" cy="929" rx="17" ry="7" fill="#000" stroke="#000" stroke-width="2.5"/>

  <path d="M652 756 L786 856 Q812 868 838 856 L972 756 Q812 800 652 756 Z" fill="#000" stroke="#000" stroke-width="3"/>

  <path d="M747 800 V960" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round"/>
  <path d="M747 800 V960" fill="none" stroke="none" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="747" cy="965" rx="18" ry="7.5" fill="#000" stroke="#000" stroke-width="2.5"/>

  <!-- ===== CORPO + DOMO ===== -->
  <path :d="liquidPath" :fill="color" clip-path="url(#tankBody)"/>
  <g stroke="#000" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M628 212 L632 737"/>
    <path d="M995 212 L992 737"/>
    <path d="M632 737 Q812 793 992 737" />
    <path d="M632 750 Q812 806 992 750" />
    <path d="M632 737 V750 M992 737 V750"/>
    <path d="M628 212 Q811 241 995 212"/>
    <path d="M628 212 C630 150 706 126 811 126 C916 126 992 150 995 212"/>
  </g>

  <!-- ===== MEDIDORES ===== -->
  <g clip-path="url(#aboveRef)">
    <g stroke="#000" stroke-width="2.5" fill="none" stroke-linejoin="round">
      <path d="M648 440 L681 447 V780 H648 Z"/>
      <path d="M925 289 L959 283 V780 H925 Z"/>
      <rect x="695" y="414" width="10" height="346"/>
      <rect x="880" y="394" width="10" height="372"/>
    </g>
    <rect x="705" y="420" width="10" height="340" fill="url(#ticks)"/>
    <rect x="890" y="400" width="10" height="366" fill="url(#ticks)"/>
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

const TOP = 126
const BOTTOM = 793
const TOTAL_H = BOTTOM - TOP

const liquidHeight = computed(() => (props.fillPercent / 100) * TOTAL_H)
const liquidY = computed(() => BOTTOM - liquidHeight.value)
const liquidPath = computed(() => {
  if (props.fillPercent <= 0) return ''
  const y = liquidY.value
  return `M628 ${y} L628 793 L995 793 L995 ${y} Z`
})
</script>
