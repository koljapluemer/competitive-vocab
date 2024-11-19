<template>
  <div class="text-center mb-10">
    <span>Cards due right now: {{vocabStore.getVocabStatistics()["nr_of_new_words"]  +  vocabStore.getVocabStatistics()["nr_of_due_words"] }} / {{ vocabStore.getVocabStatistics()["nr_of_words"] }} </span>
    <progress class="progress progress-primary w-56" :value='vocabStore.getVocabStatistics()["nr_of_new_words"]  +  vocabStore.getVocabStatistics()["nr_of_due_words"]' :max='vocabStore.getVocabStatistics()["nr_of_words"]'></progress>

    <h2 class="text-2xl font-bold mb-4 mt-10">Game Modes</h2>

    <h3 class="text-xl mt-10 mb-2">arz → en</h3>
    <button class="btn w-full mb-2" @click="$router.push('/game-cloze')">
      Cloze Deletion
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-sr-target')">
      Spaced Repetition
    </button>

    <h3 class="text-xl mt-10 mb-2">en → arz</h3>
    <button class="btn w-full mb-2" @click="$router.push('/game-multiple-choice')">
      Choose From Four
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-sr')">
      Spaced Repetition
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-missing-letter')">
      Missing Letter
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-write-target')">
      Write
    </button>

    <h3 class="text-xl mt-10 mb-2">↔</h3>
    <button class="btn w-full mb-2" @click="$router.push('/game-sr-mixed')">
      Spaced Repetition
    </button>

    <h3 class="text-xl mt-10 mb-2">specials</h3>
    <!-- <button class="btn w-full mb-2" @click="$router.push('/game-new')">
      See New Words
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-add-sentences')">
      Add Example Sentences
    </button> -->
  </div>
</template>

<script setup>
import { useVocabStore } from "../stores/vocabStore";
// import { ref, onMounted } from "vue";


const vocabStore = useVocabStore();

</script>
