import { createRouter, createWebHistory } from 'vue-router';
import Auth from './components/Auth.vue';
import Home from './components/Home.vue';
import Game from './components/Game.vue';

const routes = [
  { path: '/', component: Auth },
  { path: '/home', component: Home },
  { path: '/game', component: Game },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
