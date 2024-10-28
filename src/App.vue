<template>
  <Header/> <!-- Show Header if user is authenticated -->
  <router-view />
</template>

<script setup>
import Header from './components/Header.vue';
import { ref, onMounted } from 'vue';
import { useUserStore } from "./stores/userStore";

const userStore = useUserStore();

onMounted(async () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    userStore.setUser(savedUser);
    await userStore.fetchScores();
  }
});
</script>
