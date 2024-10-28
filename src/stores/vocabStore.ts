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
    async loadWords() {
      const { data, error } = await supabase
        .from("words")
        .select("word_native, word_target");
      if (error) {
        console.error("Error loading vocabulary from Supabase:", error);
      }
      this.words = data || [];
      const localLearningData = localStorage.getItem("localLearningData");
      if (localLearningData) {
        this.localLearningData = JSON.parse(localLearningData);
        console.log("Local learning data loaded:", this.localLearningData);
      }
    },

    getWords(n: number) {
      //   first, get all cards that are actually due, sorted by nextDue (first due first in list)
      // words[] is the authorative list, and localLearningData is used to check whether learning data exist per word
      //   therefor, ONLYYY words in words[] are considered
      // relevant prop is simply called "due" and has format due:"2024-11-12T14:29:29.441Z"
      const now = new Date();
      const dueCards = this.words.filter((word) => {
        const card = this.localLearningData[word.word_native];
        if (!card) {
          return false;
        }
        const dueAsDate = new Date(card.due);
        return dueAsDate < now;
      });

      const dueCardsSorted = dueCards.sort((a, b) => {
        const cardA = this.localLearningData[a.word_native];
        const cardB = this.localLearningData[b.word_native];
        return !(new Date(cardA.due) - new Date(cardB.due));
      });

      //   make another array:
      // this one should contain two types of words
      // those that are not due, and those that are not yet in localLearningData
      // new ones (not yet in data) should come first, then the not due ones, sorted by due (which IS NOT CALLED 'nextDue' BUT JUST 'due')

      const newCards = this.words.filter((word) => {
        const card = this.localLearningData[word.word_native];
        if (!card) {
          return true;
        } else {
          return false;
        }
      });

      const notDueCards = this.words.filter((word) => {
        const card = this.localLearningData[word.word_native];
        if (!card) {
          return false;
        }
        const dueAsDate = new Date(card.due);
        return dueAsDate >= now;
      });
      const notDueCardsSortedByDue = notDueCards.sort((a, b) => {
        const cardA = this.localLearningData[a.word_native];
        const cardB = this.localLearningData[b.word_native];
        return new Date(cardA.due) - new Date(cardB.due);
      });

      // make one combined array: dueCardsSorted + newCards + notDueCardsSortedByDue
      // return the first n elements of this array
      const combined = [
        ...dueCardsSorted,
        ...newCards,
        ...notDueCardsSortedByDue,
      ];
      return combined.slice(0, n);
    },

    registerRepetition(wordNative: string, rating: number, max_rating: number) {
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
        // TODO: this state update here doesn't seem to work?!
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
