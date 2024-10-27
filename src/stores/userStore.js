// src/store.js
import { defineStore } from 'pinia';
import { supabase } from '../supabase'; // Import the Supabase client directly

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userScore: 0,
    opponent: null,
    opponentScore: 0,
  }),
  actions: {
    setUser(shorthand) {
      this.user = shorthand;
      if (shorthand == 'MZ') {
        this.opponent = 'KS';
        } else {
        this.opponent = 'MZ';
        }
      sessionStorage.setItem('user', shorthand);
    },
    async fetchScores() {
      if (!this.user) return;

      const opponentShorthand = this.user === 'MZ' ? 'KS' : 'MZ';

      const { data: userData, error: userError } = await supabase
        .from('players')
        .select('score')
        .eq('shorthand', this.user)
        .single();

      if (userError) {
        console.error("Error fetching user score:", userError);
      } else if (userData) {
        this.userScore = userData.score;
      }

      const { data: opponentData, error: opponentError } = await supabase
        .from('players')
        .select('score')
        .eq('shorthand', opponentShorthand)
        .single();

      if (opponentError) {
        console.error("Error fetching opponent score:", opponentError);
      } else if (opponentData) {
        this.opponentScore = opponentData.score;
      }
    },
    async updateScore(newScore) {
      if (!this.user) return;

      const { error: updateError } = await supabase
        .from('players')
        .update({ score: newScore })
        .eq('shorthand', this.user);

      if (updateError) {
        console.error("Error updating user score:", updateError);
      } else {
        this.userScore = newScore;
      }
    }
  }
});
