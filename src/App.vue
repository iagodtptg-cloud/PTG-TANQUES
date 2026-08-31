<script setup>
import { onMounted } from 'vue'
import { useSession } from './components/composables/session.js'
import LoginPage from './components/LoginPage.vue'
import HomePage from './components/HomePage.vue'
import BombonaIcon from './components/icons/BombonaIcon.vue'

const { hasSession, initialized, init } = useSession()

onMounted(async () => {
  await init()
})
</script>

<template>
  <div class="bg-black min-h-screen">
    <div v-if="!initialized" class="loading-screen">
      <div class="loading-spinner"></div>
    </div>
    <LoginPage v-else-if="!hasSession" />
    <HomePage v-else />
  </div>
</template>

<style>
.loading-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--color-surface-app);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-text-muted);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>