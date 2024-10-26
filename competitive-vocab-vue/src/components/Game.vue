<template>
  <div class="text-center">
    <h2 class="text-2xl mb-4 font-bold">{{ currentQuestion.en || "Loading..." }}</h2>
    <div class="grid grid-cols-2 gap-4" v-if="answerOptions.length">
      <button
        v-for="(option, index) in answerOptions"
        :key="index"
        class="btn w-full"
        :class="{ 'btn-error': isWrong(option), 'btn-success': isCorrect(option) }"
        @click="selectAnswer(option)"
      >
        {{ option }}
      </button>
    </div>
    <p class="mt-4">Score: {{ score }}</p>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";

const supabase = inject("supabase");
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
    score.value += 1;
    updateScore();
    setNewQuestion();
  }
};

const selectedOption = ref("");
const isCorrect = (option) =>
  option === currentQuestion.value.ar && option === selectedOption.value;
const isWrong = (option) =>
  option !== currentQuestion.value.ar && option === selectedOption.value;

// score handling

const updateScore = async () => {
  const shorthand = sessionStorage.getItem("user"); // Get the current user's shorthand ("MZ" or "KS")

  if (!shorthand) {
    console.error("No user shorthand found in sessionStorage.");
    return;
  }

  // Fetch the current player by shorthand
  const { data: playerData, error: fetchError } = await supabase
    .from("players")
    .select("id, score")
    .eq("shorthand", shorthand)
    .single();

  if (fetchError) {
    console.error("Error fetching player:", fetchError);
    return;
  }

  if (!playerData) {
    console.error("Player not found.");
    return;
  }

  // Update the score for the current player
  const newScore = playerData.score + 1; // Increase score by 1

  const { error: updateError } = await supabase
    .from("players")
    .update({ score: newScore })
    .eq("id", playerData.id);

  if (updateError) {
    console.error("Error updating score:", updateError);
  } else {
    console.log(`Score updated successfully for ${shorthand}. New score: ${newScore}`);
  }
};
</script>
