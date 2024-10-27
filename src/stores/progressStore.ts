import { defineStore } from 'pinia';
import { FSRS, generatorParameters, createEmptyCard, Rating, Card, RecordLog } from 'ts-fsrs';

// Configure FSRS parameters
const params = generatorParameters({ enable_fuzz: true, enable_short_term: false });
const fsrs = new FSRS(params);

export const useProgressStore = defineStore('progress', {
  state: () => ({
    cards: {} as Record<string, Card>, // Dictionary of cards indexed by card ID
  }),

  actions: {
    // Initialize a new card if it doesn't exist
    initializeCard(cardId: string) {
      if (!this.cards[cardId]) {
        const newCard = createEmptyCard(new Date()); // Create a new card with today's date
        this.cards[cardId] = newCard;
        this.saveProgress(); // Save progress to local storage
      }
    },

    // Schedule the card based on the selected rating
    updateCardProgress(cardId: string, rating: Rating) {
      const card = this.cards[cardId];
      if (card) {
        // Run scheduling for the card using the provided rating
        const schedulingCards: RecordLog = fsrs.repeat(card, new Date());
        
        // Get the updated card state based on the selected rating
        const updatedCard = schedulingCards[rating].card;
        this.cards[cardId] = updatedCard; // Update the card in the store
        this.saveProgress(); // Persist updates to local storage
      }
    },

    // Save only card learning progress to local storage
    saveProgress() {
      localStorage.setItem('learningProgress', JSON.stringify(this.cards));
    },

    // Load card learning progress from local storage
    loadProgress() {
      const savedProgress = localStorage.getItem('learningProgress');
      if (savedProgress) {
        this.cards = JSON.parse(savedProgress);
      }
    },
  },
});
