<template>
  <header class="border-b-2 mb-10 pb-2" v-if="userStore.user">
    <nav class="navbar bg-base-100 w-full flex flex-row justify-between">
      <div class="font-bold">{{ userStore.user }}: {{ userStore.userScore }}</div>

      <div class="flex flex-col gap-1 w-full">
        <progress
          class="w-full"
          :value="userStore.userScore"
          :max="userStore.userScore + userStore.opponentScore"
        ></progress>
        <small v-if="userStore.userScore < userStore.opponentScore">You're currently behind</small>
        <small v-else-if="userStore.userScore > userStore.opponentScore">You're currently ahead</small>
      </div>
      <div class="font-bold text-right">
        {{ userStore.opponent }}: {{ userStore.opponentScore }}
      </div>
    </nav>

    <nav class="flex flew-row gap-2 justify-center">
      <button class="btn btn-sm">
        <router-link to="/home">Home</router-link>
      </button>
    </nav>
  </header>

  <div class="" v-else>
    <button class="btn">
        <router-link to="/">Select User</router-link>
    </button>

  </div>
</template>

<script setup>
import { useUserStore } from "../store";

const userStore = useUserStore();
</script>
