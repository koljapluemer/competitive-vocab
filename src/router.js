import { createRouter, createWebHashHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/userStore'; // Adjust path to where `store.js` is located
import Auth from './components/Auth.vue';
import Home from './components/Home.vue';
import Settings from './components/Settings.vue';
import SelectFromFourTarget from './components/Games/SelectFromFourTarget.vue';
import SpacedRepetitionNativeToTarget from './components/Games/SpacedRepetitionNativeToTarget.vue';
import SpacedRepetitionTargetToNative from './components/Games/SpacedRepetitionTargetToNative.vue';
import SpacedRepetitionMixed from './components/Games/SpacedRepetitionMixed.vue';
import ClozeTarget from './components/Games/ClozeTarget.vue';
import MissingLetterTarget from './components/Games/MissingLetterTarget.vue';
import SeeNew from './components/Games/SeeNew.vue';
import WriteTarget from './components/Games/WriteTarget.vue';
import AddExampleSentence from './components/Games/AddExampleSentence.vue';
import ResetLocalStorage from './components/ResetLocalStorage.vue';

const pinia = createPinia(); // Create a Pinia instance

const routes = [
  { path: '/', component: Auth },
  { path: '/home', component: Home },
  { path: '/settings', component: Settings },
  { path: '/game-multiple-choice', component: SelectFromFourTarget }, // Multiple-choice game
  { path: '/game-cloze', component: ClozeTarget }, // New cloze deletion game mode
  { path: '/game-sr', component: SpacedRepetitionNativeToTarget },
  { path: '/game-sr-target', component: SpacedRepetitionTargetToNative },
  { path: '/game-sr-mixed', component: SpacedRepetitionMixed },
  { path: '/game-missing-letter', component: MissingLetterTarget },
  { path: '/game-new', component: SeeNew },
  { path: '/game-write-target', component: WriteTarget },
  { path: '/game-add-sentences', component: AddExampleSentence },
  { path: '/reset', component: ResetLocalStorage}
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});



export default router;
