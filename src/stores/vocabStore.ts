import { defineStore } from "pinia";

import { supabase } from "../supabase";
import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
  Grades,
  FSRS,
  FSRSParameters,
  RecordLog,
} from "ts-fsrs";

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

      const localLearningData = localStorage.getItem("localLearningData");
      if (localLearningData) {
        this.localLearningData = JSON.parse(localLearningData);
        console.log("Local learning data loaded:", this.localLearningData);
      }
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
      // if word is not saved in localstorage, ignore actual rating and just save it
      if (!this.localLearningData[wordNative]) {
        console.info("New card registered: ", wordNative);
        this.createFSRSCard(wordNative);
        return;
      } else {
        const params: FSRSParameters = generatorParameters({
          maximum_interval: 1000,
        });
        const f: FSRS = new FSRS(params);

        console.info("Previously registered card rated: ", rating);
        // map the rating from min 0-max-rating to 0-3
        const mappedRating = (3 * rating) / max_rating;
        // round down
        const mappedRatingRounded = Math.floor(mappedRating);
        console.log("mapped rating: ", mappedRatingRounded);
        // use ts-fsrs grades:
        // 0: Again, 1: Hard, 2: Good, 3: Easy
        let card = this.localLearningData[wordNative];
        const schedulingCards: RecordLog = f.repeat(card, new Date());
        switch (mappedRatingRounded) {
          case 0:
            card = schedulingCards[Rating.Again].card;
            break;
          case 1:
            card = schedulingCards[Rating.Hard].card;
            break;
          case 2:
            card = schedulingCards[Rating.Good].card;
            break;
          case 3:
            card = schedulingCards[Rating.Easy].card;
            break;
          default:
            console.error("Rating out of range: ", mappedRatingRounded);
            return;
        }

        // update localstorage/state
        this.localLearningData[wordNative] = card;
        localStorage.setItem(
          "localLearningData",
          JSON.stringify(this.localLearningData)
        );
      }
    },

    // this is called when a word is not yet rated
    // and not yet stored in localstorage
    createFSRSCard(wordNative: string) {
      const card = createEmptyCard();
      this.localLearningData[wordNative] = card;
      localStorage.setItem(
        "localLearningData",
        JSON.stringify(this.localLearningData)
      );
    },
  },
});
