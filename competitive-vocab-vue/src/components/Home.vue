<template>
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-4">Game Modes</h2>
    <button class="btn btn-primary w-full" @click="startGame()">Single Choice Buttons</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const startGame = () => {
  router.push('/game');
};
</script>
