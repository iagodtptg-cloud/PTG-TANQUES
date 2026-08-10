<template>
  <div class="login-page">
    <div class="login-card">
      <div class="badge">
        <span class="badge-icon">🔐</span>
      </div>

      <h1 class="login-title">Acesso necessário</h1>
      <p class="login-subtitle">
        Autorize o acesso à sua conta do Google para continuar.
      </p>

      <button class="login-btn" :disabled="loading" @click="handleLogin">
        <span v-if="loading" class="spinner"></span>
        <span v-else>Entrar com Google</span>
      </button>

      <p v-if="error" class="login-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSession } from './composables/session.js'

const emit = defineEmits(['success'])

const { login } = useSession()
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await login()
    emit('success')
  } catch (e) {
    error.value = 'Falha ao autenticar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--color-surface-app);
  padding: 24px;
}

.login-card {
  background: var(--color-surface-panel);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface-badge);
  display: grid;
  place-items: center;
}

.badge-icon {
  font-size: 30px;
}

.login-title {
  font-style: italic;
  font-weight: 700;
  font-size: 26px;
  color: var(--color-text-primary);
  margin: 0;
}

.login-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.login-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-surface-control);
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.login-btn:hover:not(:disabled) {
  background: var(--color-surface-raised);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-error {
  font-size: 12px;
  color: var(--color-data-down);
  margin: 0;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-text-muted);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
