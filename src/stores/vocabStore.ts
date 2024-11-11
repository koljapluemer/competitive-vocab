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
    // localLearningData is NOT used dynamically, only when loading initially!!
    localLearningData: {} as Record<string, any>,
    lastUsedWord: "" as string,
    vocabContexts: [
      {
        name: "Marta Jonas 200",
        active: true,
      },
      {
        name: "Sam Naguib Mahfouz P1",
        active: false,
      },
    ],
  }),

  actions: {
    async loadWords() {
      const { data, error } = await supabase.from("words").select();
      if (error) {
        console.error("Error loading vocabulary from Supabase:", error);
      }
      this.words = data || [];
      const localLearningDataJSON = localStorage.getItem("localLearningData");
      if (localLearningDataJSON) {
        this.localLearningData = JSON.parse(localLearningDataJSON);
        console.log("Local learning data loaded:", this.localLearningData);
        // add the rest of the data from localstorage to the word
        this.words.forEach((word) => {
          if (this.localLearningData[word.word_native]) {
            Object.assign(word, this.localLearningData[word.word_native]);
          }
        });
      }

      console.log("Words loaded: ", this.words);

      // TODO: right now I just hardcoded the contexts above
      // (so Marta has hers activated and mine deactivated)
      // ...that's rather hacky
      // code below starts dynamically getting contexts from the data

      // get an array of unique values for the prop "context" in the supabase data we just got
      // const contexts = Array.from(new Set(this.words.map((word) => word.context)));
      // console.log("Contexts: ", contexts);
    },

    getWords(
      n: number,
      ignoreWordsWithoutTargetShort = false,
      shuffleCompletely = false
    ) {
      //   first, get all cards that are actually due, sorted by nextDue (first due first in list)
      // words[] is the authorative list, and localLearningData is used to check whether learning data exist per word
      //   therefor, ONLYYY words in words[] are considered
      // relevant prop is simply called "due" and has format due:"2024-11-12T14:29:29.441Z"
      let relevantWords = this.words;

      if (ignoreWordsWithoutTargetShort) {
        // check for property word_target_short
        relevantWords = relevantWords.filter((word) => {
          return word.word_target_short;
        });
      }

      // remove words that are not in an active context
      relevantWords = relevantWords.filter((word) => {
        return this.vocabContexts.some((context) => {
          return context.active && word.context === context.name;
        });
      });

      console.log("Words in active context: ", relevantWords.length);

      const now = new Date();
      const dueCards = relevantWords.filter((word) => {
        return word.due && new Date(word.due) < now;
      });

      const dueCardsSorted = dueCards.sort((a, b) => {
        return new Date(a.due) - new Date(b.due);
      });

      console.log("dueCardsSorted: ", dueCardsSorted);

      //   make another array:
      // this one should contain two types of words
      // those that are not due, and those that are not yet in localLearningData
      // new ones (not yet in data) should come first, then the not due ones, sorted by due (which IS NOT CALLED 'nextDue' BUT JUST 'due')

      // "!due" refers to the absence of that property, not to the card not being due
      // (since it is a timestamp, not set before it was at least seen once)
      const newCards = relevantWords.filter((word) => {
        return !word.due;
      });
      console.log("newCards: ", newCards);

      const notDueCards = relevantWords.filter((word) => {
        return word.due && new Date(word.due) > now;
      });

      // we sort these randomly, otherwise we have a lot of the same repetitions
      const notDueCardsSortedRandomly = notDueCards.sort(
        () => Math.random() - 0.5
      );
      console.log("notDueCardsSortedByDue: ", notDueCardsSortedRandomly);

      // make one combined array: dueCardsSorted + newCards + notDueCardsSortedByDue
      // return the first n elements of this array
      let combined = [
        ...dueCardsSorted,
        ...newCards,
        ...notDueCardsSortedRandomly,
      ];

      // remove lastUsedWord from the array (so we don't get the same word twice in a row)
      if (this.lastUsedWord) {
        const index = combined.findIndex((word) => {
          return word.word_native === this.lastUsedWord;
        });
        if (index !== -1) {
          combined.splice(index, 1);
        }
      }

      // update lastUsedWord
      this.lastUsedWord = combined[0].word_native;

      console.log("Combined Cards, Sorted: ", combined);
      if (shuffleCompletely) {
        combined = combined.sort(() => Math.random() - 0.5);
      }
      
      return combined.slice(0, n);
    },

    getVocabStatistics() {
      let relevantWords = this.words;
      const now = new Date();

      // remove words that are not in an active context
      relevantWords = relevantWords.filter((word) => {
        return this.vocabContexts.some((context) => {
          return context.active && word.context === context.name;
        });
      });

      const dueCards = relevantWords.filter((word) => {
        return word.due && new Date(word.due) < now;
      });
      const newCards = relevantWords.filter((word) => {
        return !word.due;
      });
      const notDueCards = relevantWords.filter((word) => {
        return word.due && new Date(word.due) > now;
      });

      return {
        nr_of_cards: relevantWords.length,
        nr_of_due_cards: dueCards.length,
        nr_of_new_cards: newCards.length,
        nr_of_not_due_cards: notDueCards.length,
      };
    },

    getPreviouslyUnseenWords(n: number) {
      // get all words that have no t been seen, aka have no due date
      let newWords = this.words.filter((word) => {
        return !word.due;
      });

      // remove words that are not in an active context
      newWords = newWords.filter((word) => {
        return this.vocabContexts.some((context) => {
          return context.active && word.context === context.name;
        });
      });

      console.log("Words in active context: ", newWords.length);

      console.log(`New words: ${newWords.length}`);
      newWords = newWords.sort(() => Math.random() - 0.5);

      return newWords.slice(0, n);
    },

    registerRepetition(wordNative: string, rating: number, max_rating: number) {
      const word = this.words.find((word) => word.word_native === wordNative);
      // if word was never rated, ignore actual rating and just save it
      // check by seeing if in words it has a due date set:
      if (!word.due) {
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
        let card = word;
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

        // update word in words[] with new data
        // (also save the changes to localstorage)
        this.words = this.words.map((word) => {
          if (word.word_native === wordNative) {
            return card;
          } else {
            return word;
          }
        });

        // loop properties of card and update localLearningData
        const cardData = { ...card };
        Object.keys(cardData).forEach((key) => {
          this.localLearningData[wordNative][key] = cardData[key];
        });
        console.log("local learning data updated: ", this.localLearningData);

        localStorage.setItem(
          "localLearningData",
          JSON.stringify(this.localLearningData)
        );
      }
    },

    // example sentences should be an array, may not exist yet
    addExampleSentenceToWord(wordNative: string, exampleSentence: string) {
      if (!this.localLearningData[wordNative]) {
        console.error("Word not yet in localLearningData: ", wordNative);
        return;
      }
      const card = this.localLearningData[wordNative];
      if (!card.example_sentences) {
        card.example_sentences = [];
      }
      card.example_sentences.push(exampleSentence);
      this.localLearningData[wordNative] = card;
      localStorage.setItem(
        "localLearningData",
        JSON.stringify(this.localLearningData)
      );
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

    toggleContext(contextName: string) {
      // find the context in the array and toggle its active property
      const context = this.vocabContexts.find((context) => {
        return context.name === contextName;
      });
      if (context) {
        context.active = !context.active;
      }
    },

    resetLocalStorage() {
      localStorage.setItem(
        "localLearningData",
        JSON.stringify({})
      );
    }
  },
});
