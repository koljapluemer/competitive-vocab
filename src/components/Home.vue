<template>
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-4">Game Modes</h2>
    <button class="btn btn-primary w-full mb-2" @click="$router.push('/game-cloze')">Cloze Deletion (arz → en)</button>
    <button class="btn btn-secondary w-full mb-2" @click="$router.push('/game-multiple-choice')">Choose From Four (en → arz)</button>
    <button class="btn btn-primary w-full mb-2" @click="$router.push('/game-sr')">Spaced Repetition (arz → en)</button>

  </div>
</template>
