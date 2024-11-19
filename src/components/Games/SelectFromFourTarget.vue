<template>
  <div class="text-center">
    <h2 class="text-4xl my-10 font-bold">
      {{ currentQuestion.wordNative || "Loading..." }}
    </h2>
    <div class="flex flex-col gap-2" v-if="answerOptions.length">
      <!-- TODO: shuffle this but not broken -->
      <button
        v-for="(option, index) in answerOptions"
        :key="index"
        class="btn w-full"
        style="font-size: 2rem; line-height: 2.5rem; height: inherit"
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
import { supabase } from "../../supabase";

const userStore = useUserStore();
const vocabStore = useVocabStore();

const currentQuestion = ref({});
const answerOptions = ref([]);

const numberOfWrongClicks = ref(0);

// Fetch the next due card when the component mounts
onMounted(() => {
  loadNewQuestion();
});

// Fetch and set the next due card as the current question
const loadNewQuestion = () => {
  console.log("Loading new question");
  const correctWords = vocabStore.getWords(1)
  const otherOptions = vocabStore.getWords(3, false, true); 
  const wordsForPuzzle = [ ...correctWords, ...otherOptions];
  console.log("words for puzzle", wordsForPuzzle);
  currentQuestion.value = correctWords[0];
  numberOfWrongClicks.value = 0;
  answerOptions.value = [];
  for (const word of wordsForPuzzle) {
    answerOptions.value.push(word.wordTarget);
  }
  answerOptions.value = answerOptions.value.sort(() => 0.5 - Math.random());
};

// Handle answer selection
const selectAnswer = (selected) => {
  if (selected === currentQuestion.value.wordTarget) {
    const newScore = userStore.userScore + 3;
    userStore.updateScore(newScore); // Update score in Supabase and userStore

    // Register the correct answer with progressStore to update scheduling
    const registeredScore = Math.max(0, 4 - numberOfWrongClicks.value);
    vocabStore.registerRepetition(
      currentQuestion.value.wordNative,
      registeredScore,
      4
    );
    userStore.addMoney(1);
    logDataInSupabase(registeredScore, 4);

    loadNewQuestion();

    // Load the next question
  } else {
    numberOfWrongClicks.value += 1;
  }
};

const logDataInSupabase = async (score, max_score) => {
  // Log the current score in Supabase
  // use table: learn_log
  // with following properties:
  // word_id = currentWord.value.wordNative
  // displayed_front = currentQuestion.wordNative
  // displayed_back = answerOptions to string
  // score
  // max_score
  // game_mode = "SelectFromFourTarget"

  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentQuestion.value.wordNative,
      displayed_front: currentQuestion.value.wordNative,
      displayed_back: answerOptions.value.join(", "),
      score: score,
      max_score: max_score,
      game_mode: "SelectFromFourTarget",
      player_short: userStore.user,
    },
  ]);
  if (error) {
    console.error("Error logging data in Supabase", error);
  }
};
</script>
