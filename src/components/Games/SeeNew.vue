<template>
  <div class="text-center" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold border-b-2 pb-4">{{ currentWord.wordNative }}</h2>
    <h2 class="text-2xl mb-4 font-bold pb-4">
      {{ currentWord.wordTarget }}
    </h2>

    <button class="btn btn-secondary" @click="showNextCard()">Got It</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/userStore";
import { useVocabStore } from "../../stores/vocabStore";
import { supabase } from "../../supabase";

const vocabStore = useVocabStore();
const userStore = useUserStore();
const currentWord = ref<{ id: string; wordNative: string; wordTarget: string } | null>(
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
  vocabStore.registerRepetition(currentWord.value.wordNative, 0, 0);
  logDataInSupabase(0, 0);
  loadNewCard();
};

const logDataInSupabase = async (score, max_score) => {
  // Log the current score in Supabase
  // use table: learn_log
  // with following properties:
  // word_id = currentWord.value.wordNative
  // displayed_front = currentWord.wordNative
  // displayed_back = currentWord.wordTarget
  // score = -1
  // max_score = -1
  // game_mode = "SeeNew"

  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentWord.value.wordNative,
      displayed_front: currentWord.value.wordNative,
      displayed_back: currentWord.value.wordTarget,
      score: -1,
      max_score: -1,
      game_mode: "SeeNew",
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
