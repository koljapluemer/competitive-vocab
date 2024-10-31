<template>
  <div class="text-center">
    <h2 class="text-2xl mb-4 font-bold">{{ currentWord.word_native }}</h2>
    <h2 class="text-3xl mb-4 font-bold">{{ wordWithCloze }}</h2>

    <!-- loop answer buttons -->
    <div class="flex justify-center space-x-2 mt-4">
      <button
        v-for="(option, index) in answerOptions"
        :key="index"
        class="btn text-3xl"
        style="font-size: 1.5em"
        @click="checkAnswer(option)"
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

const score = ref(userStore.userScore);

const currentWord = ref({});
const wordWithCloze = ref(""); // Word with cloze deletion
const answerOptions = ref([]); // Array to store answer options
const correctAnswer = ref(""); // Correct answer

const numberOfWrongClicks = ref(0);

const loadNewWord = () => {
  // Select a random word and create cloze deletion for `word_native`
  const wordArr = vocabStore.getWords(1);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    createCloze();
  }
};

const createCloze = () => {
  // create a single letter cloze in target word
  // (which will be from the arabic script)
  // do not replace spaces or punctuation (only arabic letters)
  // create 4 buttons, 3 of them wrong with random arabic letters (which are not the right ones)

  const wordNative = currentWord.value.word_native;
  const wordTarget = currentWord.value.word_target;
  let replacedIndex = Math.floor(Math.random() * wordTarget.length); // Start index for deletion

  // check for ARABIC letter ا ب ...
  let whileKillCounter = 0;
  while (
    wordTarget[replacedIndex].charCodeAt(0) < 1569 ||
    wordTarget[replacedIndex].charCodeAt(0) > 1610
  ) {
    replacedIndex = Math.floor(Math.random() * wordTarget.length);
    whileKillCounter++;
    if (whileKillCounter > 100) {
      console.error("while loop killed, no cloze could be created for: ", wordTarget);
      loadNewWord();
    }
  }

  wordWithCloze.value =
    wordTarget.slice(0, replacedIndex) + "❓" + wordTarget.slice(replacedIndex + 1);
  correctAnswer.value = wordTarget[replacedIndex];

  // Create 4 answer options
  answerOptions.value = [correctAnswer.value];
  // add 3 random arabic letters
  for (let i = 0; i < 3; i++) {
    let randomLetter = String.fromCharCode(
      Math.floor(Math.random() * (1610 - 1569 + 1)) + 1569
    );
    while (answerOptions.value.includes(randomLetter)) {
      randomLetter = String.fromCharCode(
        Math.floor(Math.random() * (1610 - 1569 + 1)) + 1569
      );
    }
    answerOptions.value.push(randomLetter);
  }

  answerOptions.value = answerOptions.value.sort(() => 0.5 - Math.random());
  numberOfWrongClicks.value = 0;
};

const checkAnswer = (selected) => {
  if (selected === correctAnswer.value) {
    const newScore = userStore.userScore + 2;
    userStore.updateScore(newScore); // Update score in Supabase and userStore

    // Register the correct answer with progressStore to update scheduling

    const score = Math.max(0, 4 - numberOfWrongClicks.value);
    vocabStore.registerRepetition(
      currentWord.value.word_native,
      score,
      4
    );
    logDataInSupabase(score, 4);
    loadNewWord();

    // Load the next question
  } else {
    console.log("wrong answer");
    numberOfWrongClicks.value += 1;
  }
};

const logDataInSupabase = async (score, max_score) => {
  // Log the current score in Supabase
  // use table: learn_log
  // with following properties:
  // word_id = currentWord.value.word_native
  // displayed_front = currentWord.word_native
  // displayed_back = wordWithCloze
  // score = score
  // max_score = max_score
  // game_mode = "MissingLetterTarget"

  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentWord.value.word_native,
      displayed_front: currentWord.value.word_native,
      displayed_back: wordWithCloze.value,
      score: score,
      max_score: max_score,
      game_mode: "MissingLetterTarget",
      player_short: userStore.user,
    },
  ]);
  if (error) {
    console.error("Error logging data in Supabase", error);
  }

}

// Initial load of vocabulary and first word
onMounted(() => {
  loadNewWord();
});
</script>
