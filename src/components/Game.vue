<template>
  <div class="text-center">
    <h2 class="text-4xl my-10 font-bold">{{ currentQuestion.en || "Loading..." }}</h2>
    <div class="flex flex-col gap-2" v-if="answerOptions.length">
      <button
        v-for="(option, index) in answerOptions"
        :key="index"
        class="btn w-full"
        style="font-size: 2rem; line-height: 2.5rem;"
        :class="{ 'btn-error ': isWrong(option), 'btn-success': isCorrect(option) }"
        @click="selectAnswer(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { supabase } from '../supabase'; // Import the Supabase client directly
import { useUserStore } from '../store';
const userStore = useUserStore();

const score = ref(0);
const vocabulary = ref([]);
const currentQuestion = ref({});
const answerOptions = ref([]);

// Load vocabulary when the component mounts
onMounted(async () => {
  await loadVocabulary();
  if (vocabulary.value.length > 0) {
    setNewQuestion();
  }
});

const loadVocabulary = async () => {
  const { data, error } = await supabase.from("words").select();
  if (error) {
    console.error("Error loading vocabulary:", error);
    return;
  }
  console.log("Vocabulary loaded:", data);
  vocabulary.value = data.map((row) => ({ en: row.word_native, ar: row.word_target }));
};

const setNewQuestion = () => {
  if (vocabulary.value.length === 0) return; // Check if vocabulary is loaded

  const correctWord =
    vocabulary.value[Math.floor(Math.random() * vocabulary.value.length)];
  currentQuestion.value = correctWord;

  // Ensure we have 4 unique options, one correct and three random incorrect
  const options = [correctWord.ar];
  while (options.length < 4) {
    const randomWord =
      vocabulary.value[Math.floor(Math.random() * vocabulary.value.length)].ar;
    if (!options.includes(randomWord)) options.push(randomWord);
  }
  answerOptions.value = options.sort(() => Math.random() - 0.5);
};

const selectAnswer = (selected) => {
  if (selected === currentQuestion.value.ar) {
    const newScore = userStore.userScore + 3;
    userStore.updateScore(newScore); // Update both Supabase and store
    setNewQuestion();
  }
};

const selectedOption = ref("");
const isCorrect = (option) =>
  option === currentQuestion.value.ar && option === selectedOption.value;
const isWrong = (option) =>
  option !== currentQuestion.value.ar && option === selectedOption.value;

</script>
