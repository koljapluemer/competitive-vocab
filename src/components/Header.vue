<template>
    <header class="navbar bg-base-100 w-full flex flex-row justify-between" v-if="userStore.user">
      <div class="font-bold">{{ userStore.user }}: {{ userStore.userScore }}</div>
      <div class="font-bold">{{ userStore.opponent }}: {{ userStore.opponentScore }}</div>
    </header>
  </template>
  
  <script setup>
  import { useUserStore } from '../store';
  
  const userStore = useUserStore();
  </script>
  