import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/userStore'; // Adjust path to where `store.js` is located
import Auth from './components/Auth.vue';
import Home from './components/Home.vue';
import SelectFromFourTarget from './components/Games/SelectFromFourTarget.vue';
import SpacedRepetitionNativeToTarget from './components/Games/SpacedRepetitionNativeToTarget.vue';
import ClozeTarget from './components/Games/ClozeTarget.vue';

const pinia = createPinia(); // Create a Pinia instance

const routes = [
  { path: '/', component: Auth },
  { path: '/home', component: Home },
  { path: '/game-multiple-choice', component: SelectFromFourTarget }, // Multiple-choice game
  { path: '/game-cloze', component: ClozeTarget }, // New cloze deletion game mode
  { path: '/game-sr', component: SpacedRepetitionNativeToTarget },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;
