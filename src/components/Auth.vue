<template>
  <div class="flex flex-col items-center">
    <h2 class="text-2xl mb-4 font-bold">Select User</h2>
    <button class="btn btn-primary w-full mb-2" @click="login('KS')">KS</button>
    <button class="btn btn-secondary w-full" @click="login('MZ')">MZ</button>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const login = async (shorthand) => {
  userStore.setUser(shorthand); // Set the user shorthand in the store
  await userStore.fetchScores(); // Fetch both user's and opponent's scores
  router.push('/home'); // Redirect to home
};
</script>
