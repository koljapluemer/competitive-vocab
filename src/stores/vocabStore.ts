import { defineStore } from "pinia";

import { supabase } from "../supabase";
import { get } from "http";

// first, create a simple store, ignoring fsrs for now
export const useVocabStore = defineStore("vocabStore", {
  state: () => ({
    words: [] as { word_native: string; word_target: string }[],
    localLearningData: {} as Record<string, any>,
  }),
  actions: {
    async loadWordsFromSupabase() {
      const { data, error } = await supabase
        .from("words")
        .select("word_native, word_target");
      if (error) {
        console.error("Error loading vocabulary from Supabase:", error);
        return;
      }
      this.words = data || [];
      console.log("Vocabulary loaded:", this.words);
    },
    async getOneWord() {
      if (this.words.length === 0) {
        await this.loadWordsFromSupabase();
      }
      return this.words[Math.floor(Math.random() * this.words.length)];
    },
    async getWords(n: number) {
      if (this.words.length === 0) {
        await this.loadWordsFromSupabase();
      }
      return this.words.sort(() => Math.random() - 0.5).slice(0, n);
    },

    async registerRepetition(
      wordNative: string,
      rating: number,
      max_rating: number
    ) {
      return;
    },
  },
});
