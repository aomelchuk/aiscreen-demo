<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth.ts'
const auth = useAuthStore()

onMounted(() => {
  if (!localStorage.getItem('auth_token')) {
     auth.login()
  }
})
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style scoped>

</style>
