<template>
  <header class="border-b-2 mb-10 pb-2" v-if="userStore.user">
    <nav class="navbar bg-base-100 w-full flex flex-row justify-between">
      <div class="font-bold">{{ userStore.user }}: {{ userStore.userScore }}</div>
      <div class="font-bold">{{ userStore.opponent }}: {{ userStore.opponentScore }}</div>
    </nav>

    <nav class="flex flew-row gap-2 justify-center">
      <button class="btn btn-sm">
        <router-link to="/home">Home</router-link>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useUserStore } from "../store";

const userStore = useUserStore();
</script>
