<template>
  <div class="text-center" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold border-b-2 pb-4">
      {{ reversedQuestion ? currentWord.wordTarget : currentWord.wordNative }}
    </h2>
    <h2 class="text-2xl mb-4 font-bold pb-4" v-if="isRevealed">
      {{ reversedQuestion ? currentWord.wordNative : currentWord.wordTarget }}
    </h2>
    <button v-if="!isRevealed" class="btn btn-primary" @click="revealCard">Reveal</button>

    <div v-else class="flex justify-center space-x-2 mt-4">
      <button class="btn btn-secondary" @click="rateCard('again')">Again</button>
      <button class="btn btn-secondary" @click="rateCard('hard')">Hard</button>
      <button class="btn btn-secondary" @click="rateCard('good')">Good</button>
      <button class="btn btn-secondary" @click="rateCard('easy')">Easy</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/userStore";
import { supabase } from "../../supabase";
import { useVocabStore } from "../../stores/vocabStore";

const vocabStore = useVocabStore();
const userStore = useUserStore();
const currentWord = ref<{ id: string; wordNative: string; wordTarget: string } | null>(
  null
);
const isRevealed = ref(false);

const reversedQuestion = ref(false);

// Load a new card based on spaced repetition scheduling
const loadNewCard = () => {
  const wordArr = vocabStore.getWords(1);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    isRevealed.value = false; // Reset reveal status for each new word
    reversedQuestion.value = Math.random() > 0.5;
  }
};

const revealCard = () => {
  isRevealed.value = true;
};

const rateCard = (ratingString) => {
  if (!currentWord.value) return;
  const newScore = userStore.userScore + 1;
  userStore.updateScore(newScore); // Update score in Supabase and userStore
  userStore.addMoney(1);
  const rating = {
    again: 0,
    hard: 1,
    good: 2,
    easy: 3,
  }[ratingString];
  vocabStore.registerRepetition(currentWord.value.wordNative, rating, 3);
  logDataInSupabase(rating, 3);
  loadNewCard();
};

const logDataInSupabase = async (score, max_score) => {
  // Log the current score in Supabase

  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentWord.value.wordNative,
      displayed_front: reversedQuestion.value
        ? currentWord.value.wordTarget
        : currentWord.value.wordNative,
      displayed_back: reversedQuestion.value
        ? currentWord.value.wordNative
        : currentWord.value.wordTarget,
      score,
      max_score,
      game_mode: "SpacedRepetitionMixed",
      player_short: userStore.user,
    },
  ]);
  if (error) {
    console.error("Error logging data in Supabase", error);
  }
};

// Load vocabulary and progress on mount
onMounted(() => {
  loadNewCard(); // Start with the first scheduled card
});
</script>
