<template>
  <div class="text-center">
    <h2 class="text-4xl my-10 font-bold">
      {{ currentQuestion.word_native || "Loading..." }}
    </h2>
    <div class="flex flex-col gap-2" v-if="answerOptions.length">
      <button
        v-for="(option, index) in answerOptions"
        :key="index"
        class="btn w-full"
        style="font-size: 2rem; line-height: 2.5rem"
        @click="selectAnswer(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useVocabStore } from "../../stores/vocabStore";
import { useUserStore } from "../../stores/userStore";

const userStore = useUserStore();
const vocabStore = useVocabStore();

const currentQuestion = ref({});
const answerOptions = ref([]);

const numberOfWrongClicks = ref(0);

// Fetch the next due card when the component mounts
onMounted(async () => {
  await loadNewQuestion();
});

// Fetch and set the next due card as the current question
const loadNewQuestion = async () => {
  console.log("Loading new question");
  const wordsForPuzzle = await vocabStore.getWords(4); // returns 4!!! words, 1 to be used as the correct answer
  console.log("words for puzzle", wordsForPuzzle);
  currentQuestion.value = wordsForPuzzle[0];
  numberOfWrongClicks.value = 0;
  answerOptions.value = [];
  for (const word of wordsForPuzzle) {
    answerOptions.value.push(word.word_target);
  }
};

// Handle answer selection
const selectAnswer = async (selected) => {
  if (selected === currentQuestion.value.word_target) {
    const newScore = userStore.userScore + 3;
    userStore.updateScore(newScore); // Update score in Supabase and userStore

    // Register the correct answer with progressStore to update scheduling
    vocabStore
      .registerRepetition(
        currentQuestion.word_native,
        Math.max(0, 4 - numberOfWrongClicks.value),
        4
      )
      .then(() => loadNewQuestion());

    // Load the next question
  } else {
    numberOfWrongClicks.value += 1;
  }
};
</script>
