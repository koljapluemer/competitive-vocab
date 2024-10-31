import { defineStore } from "pinia";

import { supabase } from '../supabase'; // Import the Supabase client directly

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userScore: 0,
    opponent: null,
    opponentScore: 0,
    currentContestId: null,
    contestEndTime: null
  }),
  actions: {
    setUser(shorthand) {
      this.user = shorthand;
      localStorage.setItem('user', shorthand);
      if (shorthand == 'MZ') {
        this.opponent = 'KS';
      } else {
        this.opponent = 'MZ';
      }
      sessionStorage.setItem('user', shorthand);
    },
    async updateScore(newScore) {
      if (!this.user) return;

      if (this.user === 'MZ') {
        const { error: updateError } = await supabase
          .from('contests')
          .update({ mz_score: newScore })
          .eq('id', this.currentContestId);

        if (updateError) {
          console.error("Error updating user score:", updateError);
        } else {
          console.log('updated user score to: ', newScore);
          this.userScore = newScore;
        }
      } else {
        console.log(this.currentContestId, newScore);
        const { error: updateError } = await supabase
          .from('contests')
          .update({ ks_score: newScore })
          .eq('id', this.currentContestId);

        if (updateError) {
          console.error("Error updating user score:", updateError);
        } else {
          console.log('updated user score to: ', newScore);
          this.userScore = newScore;
        }
      }


    },

    async fetchCurrentContest() {
      if (!this.user) return;

      // check if there is a contest running
      // get from contest table
      // the important fact is whether there is one with an end_time (type timestamptz) in the future
      // if not, create one:
      // end_time should be next Sunday, 11.59am, Berlin time 

      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select()
        .gt('end_time', new Date().toISOString());

      if (contestError) {
        console.error("Error fetching contest:", contestError);
      }

      console.log('contest data: ', contestData);


      if (!contestData || contestData.length === 0) {
        await this.createNewContest();
      } else {
        this.currentContestId = contestData[0].id;
        this.contestEndTime = contestData[0].end_time;

        if (this.user === 'MZ') {
          this.userScore = contestData[0].mz_score;
          this.opponentScore = contestData[0].ks_score;
        }
        else {
          this.userScore = contestData[0].ks_score;
          this.opponentScore = contestData[0].mz_score;
        }

        console.log('user score: ', this.userScore);

      }
    },

    async createNewContest() {
      console.log('no contest running, creating one');
      const nextSunday = new Date();
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
      nextSunday.setHours(9, 59, 0, 0);

      const { error: insertError } = await supabase
        .from('contests')
        .insert({ end_time: nextSunday });

      if (insertError) {
        console.error("Error inserting contest:", insertError);
      }

      await this.fetchCurrentContest();
    }
  }
});