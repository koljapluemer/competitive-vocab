<template>
  <div class="text-center mb-10">


    <h2 class="text-2xl font-bold mb-4">Game Modes</h2>

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
    <button class="btn w-full mb-2" @click="$router.push('/game-new')">
      See New Words
    </button>
    <button class="btn w-full mb-2" @click="$router.push('/game-add-sentences')">
      Add Example Sentences
    </button>

  </div>
</template>


<script setup>

import { ref, onMounted } from "vue";
import { useVocabStore } from "../stores/vocabStore";

const vocabStore = useVocabStore();

console.log("STATS:", vocabStore.getVocabStatistics())

</script>