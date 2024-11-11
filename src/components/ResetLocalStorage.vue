<script setup>

import { useVocabStore } from "../stores/vocabStore";
import { useRouter } from 'vue-router';

const router = useRouter();
const vocabStore = useVocabStore();


vocabStore.resetLocalStorage()
router.push('/')

</script>