<template>
  <Header />
  <!-- Show Header if user is authenticated -->
  <router-view v-if="wordsLoaded" class="m-auto max-w-md px-2" />
  <div class="m-auto flex-grow max-w-md px-2" v-else>...</div>

  <div class="mx-auto mt-20 text-center">
    <small class="">v0.24.11.19.2</small>
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
import { ref, onMounted } from "vue";
import { useUserStore } from "./stores/userStore";
import { useVocabStore } from "./stores/vocabStore";

const userStore = useUserStore();
const vocabStore = useVocabStore();
const wordsLoaded = ref(false);

onMounted(async () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    userStore.setUser(savedUser);
    await userStore.fetchCurrentContest();
  }

  await userStore.fetchCurrentContest();

  await vocabStore.loadWords();
  wordsLoaded.value = true;
});
</script>
