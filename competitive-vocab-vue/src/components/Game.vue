<template>
    <div class="text-center">
      <h2 class="text-2xl mb-4 font-bold">{{ currentQuestion.en }}</h2>
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="(option, index) in answerOptions"
          :key="index"
          class="btn w-full"
          :class="{'btn-error': isWrong(option), 'btn-success': isCorrect(option)}"
          @click="selectAnswer(option)"
        >
          {{ option }}
        </button>
      </div>
      <p class="mt-4">Score: {{ score }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, inject, onMounted } from 'vue';
  
  const supabase = inject('supabase');
  const score = ref(0);
  const vocabulary = ref([]);
  const currentQuestion = ref({});
  const answerOptions = ref([]);
  
  onMounted(async () => {
    await loadVocabulary();
    setNewQuestion();
  });
  
  const loadVocabulary = async () => {
    const { data } = await supabase.from('words').select('word_native, word_target');
    vocabulary.value = data.map((row) => ({ en: row.word_native, ar: row.word_target }));
  };
  
  const setNewQuestion = () => {
    const correctWord = vocabulary.value[Math.floor(Math.random() * vocabulary.value.length)];
    currentQuestion.value = correctWord;
    
    const options = [correctWord.ar];
    while (options.length < 4) {
      const randomWord = vocabulary.value[Math.floor(Math.random() * vocabulary.value.length)].ar;
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
  
  const updateScore = async () => {
    const user = sessionStorage.getItem('user');
    await supabase
      .from('players')
      .upsert({ name: user, score: score.value }, { onConflict: ['name'] });
  };
  </script>
  