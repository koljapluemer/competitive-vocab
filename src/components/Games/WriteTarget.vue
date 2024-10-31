<template>
  <div class="flex flex-col" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold text-center">{{ currentWord.word_native }}</h2>
    <!-- {{ currentWord.word_target_short }} -->
    <input
      class="input input-bordered bg-base-200"
      v-model="inputAnswer"
      @input="checkAnswer"
    />
    <small class="">Diacritics are optional.</small>

    <!-- :style="{ width: `${currentWord.word_target_short.length * 1.3}em` }" -->

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

const loadNewWord = () => {
  // Select a random word and create cloze deletion for `word_native`
  const wordArr = vocabStore.getWords(1, true);
  console.log("got words", wordArr);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    inputAnswer.value = "";
  }
};

const checkAnswer = () => {
  if (normalizeArabicText(inputAnswer.value) === normalizeArabicText(currentWord.value.word_target_short)) {
    score.value += 5;
    userStore.updateScore(score.value); // Update score in global store and Supabase
    // Register the correct answer with progressStore to update scheduling
    vocabStore.registerRepetition(currentWord.value.word_native, 2, 3);
    logDataInSupabase(2, 3);
    loadNewWord(); // Load the next word if answer is correct
  }
};

const giveUp = () => {
  score.value -= 1;
  userStore.updateScore(score.value); // Update score
  vocabStore.registerRepetition(currentWord.value.word_native, 1, 3);
  logDataInSupabase(1, 3);
  loadNewWord(); // Load a new word
};

const logDataInSupabase = async (score, max_score) => {
  const { data, error } = await supabase.from("learn_log").insert([
    {
      word_id: currentWord.value.word_native,
      displayed_front: currentWord.value.word_native,
      displayed_back: currentWord.value.word_target_short,
      score: score,
      max_score: max_score,
      game_mode: "WriteTarget",
      player_short: userStore.user,
    },
  ]);
  if (error) {
    console.error("Error logging data in Supabase", error);
  }
};

const normalizeArabicText = (text) => {
  //remove special characters
  text = text.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, "");

  //normalize Arabic
  text = text.replace(/(آ|إ|أ)/g, "ا");
  text = text.replace(/(ة)/g, "ه");
  text = text.replace(/(ئ|ؤ)/g, "ء");
  text = text.replace(/(ى)/g, "ي");

  //convert arabic numerals to english counterparts.
  var starter = 0x660;
  for (var i = 0; i < 10; i++) {
    text.replace(String.fromCharCode(starter + i), String.fromCharCode(48 + i));
  }

  return text;
};

// Initial load of vocabulary and first word
onMounted(() => {
  loadNewWord();
});
</script>
