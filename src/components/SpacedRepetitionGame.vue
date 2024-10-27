<template>
  <div class="text-center" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold">
      {{ isRevealed ? currentWord.word_native : currentWord.word_target }}
    </h2>

    <button v-if="!isRevealed" class="btn btn-primary" @click="revealCard">Reveal</button>

    <div v-else class="flex justify-center space-x-2 mt-4">
      <button class="btn btn-secondary" @click="rateCard('again')">Again</button>
      <button class="btn btn-secondary" @click="rateCard('hard')">Hard</button>
      <button class="btn btn-secondary" @click="rateCard('good')">Good</button>
      <button class="btn btn-secondary" @click="rateCard('easy')">Easy</button>
    </div>

    <p class="text-lg mt-6">Score: {{ score }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProgressStore } from "../stores/progressStore";
import { useUserStore } from "../stores/userStore";
import { Rating } from "ts-fsrs";
import { supabase } from "../supabase"; // Import the Supabase client directly

const userStore = useUserStore();
const progressStore = useProgressStore();
const score = ref(userStore.userScore);
const vocabulary = ref<{ id: string; word_native: string; word_target: string }[]>([]);
const currentWord = ref<{ id: string; word_native: string; word_target: string } | null>(
  null
);
const isRevealed = ref(false);

// Load vocabulary from Supabase or any other source
const loadVocabulary = async () => {
  const { data, error } = await supabase
    .from("words")
    .select("id, word_native, word_target");
  if (!error && data) vocabulary.value = data;
};

// Load a new card based on spaced repetition scheduling
const loadNewCard = () => {
  const cardId = getNextCardId();
  currentWord.value = vocabulary.value.find((word) => word.id === cardId) || null;
  if (currentWord.value) {
    progressStore.initializeCard(cardId); // Initialize the card in progressStore if new
    isRevealed.value = false; // Reset reveal status for each new word
  }
};

// Get the next card's ID based on scheduling (chooses the earliest due card)
const getNextCardId = () => {
  // Get card IDs sorted by their scheduled due date
  const dueCards = Object.entries(progressStore.cards).sort(([, cardA], [, cardB]) => {
    return cardA.due.getTime() - cardB.due.getTime();
  });
  return dueCards[0]?.[0] || vocabulary.value[0]?.id; // Default to the first word if no due cards
};

const revealCard = () => {
  isRevealed.value = true;
};

// Update card scheduling based on user rating and load the next word
const rateCard = (rating: "again" | "hard" | "good" | "easy") => {
  const ratingsMap: Record<typeof rating, Rating> = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  };

  if (currentWord.value) {
    const cardId = currentWord.value.id;
    progressStore.updateCardProgress(cardId, ratingsMap[rating]); // Update the card's scheduling
    score.value += 1;
    userStore.updateScore(score.value); // Update user score globally
    loadNewCard(); // Load the next word
  }
};

// Load vocabulary and progress on mount
onMounted(async () => {
  await loadVocabulary();
  progressStore.loadProgress(); // Load learning progress from local storage
  loadNewCard(); // Start with the first scheduled card
});
</script>
