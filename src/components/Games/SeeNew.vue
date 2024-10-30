<template>
  <div class="text-center" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold border-b-2 pb-4">{{ currentWord.word_native }}</h2>
    <h2 class="text-2xl mb-4 font-bold pb-4">
      {{ currentWord.word_target }}
    </h2>


      <button class="btn btn-secondary" @click="showNextCard()">Got It</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/userStore";
import { useVocabStore } from "../../stores/vocabStore";

const vocabStore = useVocabStore();
const userStore = useUserStore();
const currentWord = ref<{ id: string; word_native: string; word_target: string } | null>(
  null
);
const isRevealed = ref(false);

// Load a new card based on spaced repetition scheduling
const loadNewCard = () => {
  const wordArr = vocabStore.getPreviouslyUnseenWords(1);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    isRevealed.value = false; // Reset reveal status for each new word
  }
};

const revealCard = () => {
  isRevealed.value = true;
};

const showNextCard = () => {
  if (!currentWord.value) return;
  const newScore = userStore.userScore + 1;
  userStore.updateScore(newScore); // Update score in Supabase and userStore
  vocabStore.registerRepetition(currentWord.value.word_native, 0, 0);
  loadNewCard();
};

// Load vocabulary and progress on mount
onMounted(() => {
  loadNewCard(); // Start with the first scheduled card
});
</script>
