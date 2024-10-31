<template>
  <div class="flex flex-col" v-if="currentWord">
    <h2 class="text-2xl mb-4 font-bold text-center">{{ currentWord.word_native }}</h2>
   <h2 class="text-2xl my-4 text-center">
    {{ hintString }}
   </h2>

    <input
      class="input input-bordered bg-base-200 input-lg text-4xl input-primary"
      v-model="inputAnswer"
      @input="checkAnswer"
    />

    <small class="">Diacritics are optional.</small>

    <!-- :style="{ width: `${currentWord.word_target_short.length * 1.3}em` }" -->

    <div class="flex flex-col gap-2 mt-10">
      <button class="btn btn-sm" @click="revealLetter">Reveal 1 Letter</button>
      <button class="btn btn-sm" @click="giveUp">Give Up (-1)</button>
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
const inputAnswer = ref("");
const hintString = ref("");

const loadNewWord = () => {
  // Select a random word and create cloze deletion for `word_native`
  const wordArr = vocabStore.getWords(1, true);
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    inputAnswer.value = "";
    hintString.value =  "٭".repeat(normalizeArabicText(currentWord.value.word_target_short).length);
  }
};

const checkAnswer = () => {
  if (
    normalizeArabicText(inputAnswer.value) ===
    normalizeArabicText(currentWord.value.word_target_short)
  ) {
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

const revealLetter = () => {
  // as long is there is at least one ٭ in hintString
  // choose a random index (keep guessing until hitting *)
  // and replace it with the correct letter

  const hintArr = hintString.value.split("");
  const targetArr = normalizeArabicText(currentWord.value.word_target_short).split("");

  if (hintArr.includes("٭")) {
    let randomIndex = Math.floor(Math.random() * hintArr.length);
    while (hintArr[randomIndex] !== "٭") {
      randomIndex = Math.floor(Math.random() * hintArr.length);
    }

    hintArr[randomIndex] = targetArr[randomIndex];
    hintString.value = hintArr.join("");
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
