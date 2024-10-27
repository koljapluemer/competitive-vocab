<template>
  <div class="text-center">
    <h2 class="text-2xl mb-4 font-bold">{{ currentWord.word_target }}</h2>

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
import { useUserStore } from "../stores/userStore";

import { supabase } from "../supabase"; // Import the Supabase client directly

const userStore = useUserStore();
const score = ref(userStore.userScore);
const vocabulary = ref([]);
const currentWord = ref({});
const inputAnswer = ref("");
const parts = ref([]); // Array to store parts of the word, including cloze input

const loadVocabulary = async () => {
  const { data, error } = await supabase.from("words").select("word_native, word_target");
  if (!error && data) vocabulary.value = data;
};

const loadNewWord = () => {
  // Select a random word and create cloze deletion for `word_native`
  currentWord.value =
    vocabulary.value[Math.floor(Math.random() * vocabulary.value.length)];
  createCloze();
};

const createCloze = () => {
  const wordNative = currentWord.value.word_native;
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
    loadNewWord(); // Load the next word if answer is correct
  }
};

const giveUp = () => {
  score.value -= 1;
  userStore.updateScore(score.value); // Update score
  loadNewWord(); // Load a new word
};

// Initial load of vocabulary and first word
onMounted(async () => {
  await loadVocabulary();
  loadNewWord();
});
</script>
