<template>
  <div class="flex flex-col items-center max-w-md m-auto">
    <h2 class="text-2xl mb-4 font-bold">Select User</h2>
    <button class="btn btn-primary w-full mb-2" @click="selectUser('KS')">KS</button>
    <button class="btn btn-secondary w-full" @click="selectUser('MZ')">MZ</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const selectUser = (username) => {
  // Save the selected user to session storage
  sessionStorage.setItem('user', username);

  // Redirect to the home screen
  router.push('/home');
};
</script>
