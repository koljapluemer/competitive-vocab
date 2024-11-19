import { defineStore } from "pinia";

import { supabase } from "../supabase";
import {
  createEmptyCard,
  Card,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
  Grades,
  FSRS,
  FSRSParameters,
  RecordLog,
} from "ts-fsrs";

interface Word {
  // supabase
  wordNative: string;
  wordTarget: string;
  wordNativeShort?: string;
  wordTargetShort?: string;
  nativeLang?: string;
  useAsWord?: boolean;
  useAsSentence?: boolean;
  context?: string;
  wordTypeInfo?: string;
  rootInfo?: string;
  extraInfo?: string;
  // local only
  due?: Date;
  stability?: number;
  difficulty?: number;
  elapsed_days?: number;
  scheduled_days?: number;
  reps?: number;
  lapses?: number;
  state?: number;
  last_review?: Date;
}

// first, create a simple store, ignoring fsrs for now
export const useVocabStore = defineStore("vocabStore", {
  state: () => ({
    words: [] as Word[],
    // basically a write-only
    // gets read once, at app start, then is only used to save learning progress locally
    localLearningData: {},
    lastUsedWords: [] as Word[],
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
      const wordsFromSupabase = data || [];
      const localLearningDataJSON = localStorage.getItem("localLearningData");
      if (localLearningDataJSON) {
        this.localLearningData = JSON.parse(localLearningDataJSON);
      }
      wordsFromSupabase.forEach((_word) => {
        const word: Word = {
          wordNative: _word["word_native"],
          wordTarget: _word["word_target"],
          wordNativeShort: _word["word_native_short"],
          wordTargetShort: _word["word_target_short"],
          nativeLang: _word["native_lang"],
          useAsWord: _word["use_as_word"],
          useAsSentence: _word["use_as_sentence"],
          context: _word["context"],
          wordTypeInfo: _word["word_type_info"],
          rootInfo: _word["root_info"],
          extraInfo: _word["extra_info"],
        };

        const wordLearningData = this.localLearningData[word.wordNative];
        if (wordLearningData != null && wordLearningData != undefined) {
          word.due = new Date(wordLearningData.due);
          word.stability = wordLearningData.stability;
          word.difficulty = wordLearningData.difficulty;
          word.elapsed_days = wordLearningData.elapsed_days;
          word.scheduled_days = wordLearningData.scheduled_days;
          word.reps = wordLearningData.reps;
          word.lapses = wordLearningData.lapses;
          word.state = wordLearningData.state;
          word.last_review = wordLearningData.last_review;
        }

        this.words.push(word);
      });
      console.log("words after load:", this.words);
    },

    getWords(
      n: number,
      ignoreWordsWithoutTargetShort = false,
      shuffleCompletely = false
    ): Word[] {
      let relevantWords: Word[] = this.words;

      // TODO: see if this works as intended
      // (not sure where we use this flag, though)
      if (ignoreWordsWithoutTargetShort) {
        relevantWords = relevantWords.filter((word) => {
          return word.wordTargetShort;
        });
      }

      // remove words that are not in an active context
      relevantWords = relevantWords.filter((word) => {
        return this.vocabContexts.some((context) => {
          return context.active && word.context === context.name;
        });
      });
      console.log("Words in active context: ", relevantWords.length);

      // get words that are due
      // could sort these, but it also kinda doesn't matter, due is due
      const now = new Date();
      const dueWords = relevantWords
        .filter((word) => {
          return word.due && word.due < now;
        })
        .sort(() => Math.random() - 0.5);
      console.log("dueWords: ", dueWords);

      // words never learned before (shuffled)
      const wordsNeverLearnedBefore = relevantWords
        .filter((word) => {
          return typeof word.due === "undefined";
        })
        .sort(() => Math.random() - 0.5);
      console.log("wordsNeverLearnedBefore", wordsNeverLearnedBefore);

      // words learned before, but not due (shuffled)
      const wordsDueInTheFuture = relevantWords
        .filter((word) => {
          return word.due && word.due > now;
        })
        .sort(() => Math.random() - 0.5);
      console.log("words due in the future", wordsDueInTheFuture);

      let combinedWords = [
        ...dueWords,
        ...wordsNeverLearnedBefore,
        ...wordsDueInTheFuture,
      ];
      console.log("combined has length:", combinedWords.length);

      for (let _word of this.lastUsedWords) {
        combinedWords = combinedWords.filter((word) => word != _word);
      }

      console.log(
        "after filtering last used, combined has length:",
        combinedWords.length
      );

      if (shuffleCompletely) {
        combinedWords = combinedWords.sort(() => Math.random() - 0.5);
      } else {
        this.lastUsedWords.push(combinedWords[0]);
        this.lastUsedWords = this.lastUsedWords.slice(-4);
        console.log("last used:", this.lastUsedWords);
      }

      const slice = combinedWords.slice(0, n);

      // if words were not seen, at basic learning data
      console.log('slice before adding learning data', slice)
      for (let word of slice) {
        if (typeof word.due === "undefined") {
          console.log('new word in slice!')
          const card = createEmptyCard();
          word = this.setLearningDataFieldsOnWord(card, word);
        }
      }
      console.log('slice after adding learning data', slice)


      return slice;
    },

    getVocabStatistics() {
      let relevantWords: Word[] = this.words;
      const now = new Date();

      // remove words that are not in an active context
      relevantWords = relevantWords.filter((word) => {
        return this.vocabContexts.some((context) => {
          return context.active && word.context === context.name;
        });
      });

      const dueWords = relevantWords.filter((word) => {
        return word.due && word.due < now;
      });
      const newCards = relevantWords.filter((word) => {
        return typeof word.due === "undefined";
      });
      const notDueCards = relevantWords.filter((word) => {
        return word.due && word.due > now;
      });

      const returnObject = {
        nr_of_words: relevantWords.length,
        nr_of_due_words: dueWords.length,
        nr_of_new_words: newCards.length,
        nr_of_not_due_words: notDueCards.length,
      };
      return returnObject;
    },

    getPreviouslyUnseenWords(n: number): Word[] {
      return this.words
        .filter((word) => {
          return typeof word.due === "undefined";
        })
        .filter((word) => {
          return this.vocabContexts.some((context) => {
            return context.active && word.context === context.name;
          });
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, n);
    },

    registerRepetition(wordNative: string, rating: number, max_rating: number) {
      let word = this.words.find((word) => word.wordNative === wordNative);
      let card: Card;

      const params: FSRSParameters = generatorParameters({
        maximum_interval: 1000,
      });
      const f: FSRS = new FSRS(params);

      console.info("Previously registered word rated: ", rating);
      // map the rating from min 0-max-rating to 0-3
      const mappedRating = (3 * rating) / max_rating;
      // round down
      const mappedRatingRounded = Math.floor(mappedRating);
      // use ts-fsrs grades:
      // 0: Again, 1: Hard, 2: Good, 3: Easy
      card = {
        due: word.due,
        stability: word.stability,
        difficulty: word.difficulty,
        elapsed_days: word.elapsed_days,
        scheduled_days: word.scheduled_days,
        reps: word.reps,
        lapses: word.lapses,
        state: word.state,
        last_review: word.last_review,
      };
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

      word = this.setLearningDataFieldsOnWord(card, word);
      console.log('word after rep', word)

      this.localLearningData[word.wordNative] = word;
      this.saveLearningDataLocally();
    },

    setLearningDataFieldsOnWord(learningData: Card, word: Word) {
      word.due = learningData.due;
      word.stability = learningData.stability;
      word.difficulty = learningData.difficulty;
      word.elapsed_days = learningData.elapsed_days;
      word.scheduled_days = learningData.scheduled_days;
      word.reps = learningData.reps;
      word.lapses = learningData.lapses;
      word.state = learningData.state;
      word.last_review = learningData.last_review;

      return word;
    },

    saveLearningDataLocally() {
      localStorage.setItem(
        "localLearningData",
        JSON.stringify(this.localLearningData)
      );
    },

    // TODO: likely broken, at least awkward in new paradigm
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
      localStorage.setItem("localLearningData", JSON.stringify({}));
    },
  },
});
