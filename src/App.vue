<template>
  <Header/> <!-- Show Header if user is authenticated -->
  <router-view />
</template>

<script setup>
import Header from './components/Header.vue';
import { ref, onMounted } from 'vue';

const user = ref(sessionStorage.getItem('user')); // Check if user is authenticated

onMounted(() => {
  user.value = sessionStorage.getItem('user'); // Refresh user state on mount
});
</script>
