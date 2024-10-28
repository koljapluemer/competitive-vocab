<template>
  <Header/> <!-- Show Header if user is authenticated -->
  <router-view v-if="wordsLoaded"/>
  <div class="" v-else>...</div>
</template>

<script setup>
import Header from './components/Header.vue';
import { ref, onMounted } from 'vue';
import { useUserStore } from "./stores/userStore";
import { useVocabStore } from "./stores/vocabStore";

const userStore = useUserStore();
const vocabStore = useVocabStore();
const wordsLoaded = ref(false);

onMounted(async () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    userStore.setUser(savedUser);
    await userStore.fetchScores();
  }

  await vocabStore.loadWords();
  wordsLoaded.value = true;
});
</script>
