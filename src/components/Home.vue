<template>
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-4">Game Modes</h2>

    <h3 class="text-xl mt-10 mb-2">arz → en</h3>
    <button class="btn w-full mb-2" @click="$router.push('/game-cloze')">Cloze Deletion</button>
    <button class="btn w-full mb-2" @click="$router.push('/game-sr-target')">Spaced Repetition</button>


    <h3 class="text-xl mt-10 mb-2">en → arz</h3>
    <button class="btn w-full mb-2" @click="$router.push('/game-multiple-choice')">Choose From Four</button>
    <button class="btn w-full mb-2" @click="$router.push('/game-sr')">Spaced Repetition</button>


    <h3 class="text-xl mt-10 mb-2">mixed</h3>


  </div>
</template>
