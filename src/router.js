import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { useUserStore } from './store'; // Adjust path to where `store.js` is located
import Auth from './components/Auth.vue';
import Home from './components/Home.vue';
import Game from './components/Game.vue';
import ClozeGame from './components/ClozeGame.vue';

const pinia = createPinia(); // Create a Pinia instance

const routes = [
  { path: '/', component: Auth },
  { path: '/home', component: Home },
  { path: '/game-multiple-choice', component: Game }, // Multiple-choice game
  { path: '/game-cloze', component: ClozeGame }, // New cloze deletion game mode
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;
