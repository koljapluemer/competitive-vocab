import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createClient } from '@supabase/supabase-js';

// Import Tailwind CSS
import './index.css';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const app = createApp(App);
app.provide('supabase', supabase);
app.use(router);
app.mount('#app');
