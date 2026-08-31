<script setup>
defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'error' }
})

defineEmits(['close'])
</script>

<template>
  <div
v-if="message" class="w-full text-center py-2 px-4 rounded-lg mb-2 text-sm font-medium transition-all"
    :class="type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    style="color: #fff">
    {{ message }}
  </div>
</template>