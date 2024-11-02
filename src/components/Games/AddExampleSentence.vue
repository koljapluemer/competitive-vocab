<template>
  <div class="flex flex-col" v-if="currentWord">
    <h2 class="text-3xl mb-4 font-bold text-center">{{ currentWord.word_target }}</h2>
    <h2 class="text-2xl mb-4 font-bold text-center">{{ currentWord.word_native }}</h2>

    <div class="border rounded p-4 my-4 flex flex-col gap-2">
      <h3 class="font-bold">Example Sentences</h3>

      <div
        class="card bg-base-200 p-2 card-compact"
        v-for="sentence in currentWord.example_sentences"
      >
        {{ sentence }}
      </div>
      <input
        class="input input-bordered bg-base-200 input-primary mt-4"
        v-model="inputAnswer"
        placeholder="..."
      />
      <!-- enable if at least 2 letters in input -->
      <button class="btn btn-sm" @click="addSentence" :disabled="inputAnswer.length < 2">
        Add example sentence
      </button>
    </div>
    <button class="btn btn-sm" @click="loadNewWord">Show Next Word</button>
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
  if (wordArr.length > 0) {
    currentWord.value = wordArr[0];
    inputAnswer.value = "";
  }
};

const addSentence = async () => {
  vocabStore.addExampleSentenceToWord(currentWord.value.word_native, inputAnswer.value);
  logDataInSupabase(2, 3);
  score.value += 2;
  userStore.updateScore(score.value);
  userStore.addMoney(1);
  inputAnswer.value = "";
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


// Initial load of vocabulary and first word
onMounted(() => {
  loadNewWord();
});
</script>
