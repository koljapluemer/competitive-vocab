<template>
  <div class="text-center">
    <h2 class="text-2xl mb-4 font-bold">{{ currentWord.wordTarget }}</h2>

    <div class="flex justify-center items-center mb-4 font-bold text-xl">
      <!-- Display word with cloze deletion input -->
      <span v-for="(part, index) in parts" :key="index">
        <span v-if="part.type === 'text'">{{ part.value }}</span>
        <input
          v-else
          v-model="inputAnswer"
          :style="{ width: `${part.value.length * 1.3}em` }"
          @input="checkAnswer"
          class="p-0 border-2 font-bold text-xl border-red-300 text-center mx-2 bg-gray-800"
          :placeholder="part.value ? '_ '.repeat(part.value.length) : ''"
        />
      </span>
    </div>

    <button class="btn btn-secondary ml-2 mt-10" @click="giveUp">Give Up (-1)</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useVocabStore } from "../../stores/vocabStore";
import { useUserStore } from "../../stores/userStore";

import { supabase } from "../../supabase";

const userStore = useUserStore();
const vocabStore = useVocabStore();

const score = ref(userStore.userScore);

const currentWord = ref({});
const inputAnswer = ref("");
const parts = ref([]); // Array to store parts of the word, including cloze input

const loadNewWord = () => {
  // Select a random word and create cloze deletion for `wordNative`
  const wordArr = vocabStore.getWords(1);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    createCloze();
  }
};

const createCloze = () => {
  const wordNative = currentWord.value.wordNative;
  const start = Math.floor(Math.random() * (wordNative.length - 2)); // Start index for deletion
  const length = Math.min(3, wordNative.length - start); // Ensure at least 2 letters but not exceeding the word length
  const end = start + length;

  parts.value = [
    { type: "text", value: wordNative.slice(0, start) },
    { type: "input", value: wordNative.slice(start, end) },
    { type: "text", value: wordNative.slice(end) },
  ];

  inputAnswer.value = ""; // Reset input answer for new word
};

const checkAnswer = () => {
  if (inputAnswer.value === parts.value.find((part) => part.type === "input").value) {
    score.value += 5;
    userStore.updateScore(score.value); // Update score in global store and Supabase
    // Register the correct answer with progressStore to update scheduling
    vocabStore.registerRepetition(currentWord.value.wordNative, 2, 3);
    logDataInSupabase(2, 3);
    userStore.addMoney(1);
    loadNewWord(); // Load the next word if answer is correct
  }
};

const giveUp = () => {
  score.value -= 1;
  userStore.updateScore(score.value); // Update score
  vocabStore.registerRepetition(currentWord.value.wordNative, 1, 3);
  logDataInSupabase(1, 3);
  loadNewWord(); // Load a new word
};

const logDataInSupabase = async (score, max_score) => {


  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentWord.value.wordNative,
      displayed_front: currentWord.value.wordTarget,
      displayed_back: parts.value,
      score: score,
      max_score: max_score,
      game_mode: "ClozeTarget",
      player_short: userStore.user,
    },
  ]);
  if (error) {
    console.error("Error logging data in Supabase", error);
  }
};

// Initial load of vocabulary and first word
onMounted(() => {
  loadNewWord();
});
</script>
