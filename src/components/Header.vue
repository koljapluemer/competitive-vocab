<template>
  <header class="mb-10 py-2 w-full bg-base-200" v-if="userStore.user">
    <nav class="nw-full flex flex-row justify-between m-auto max-w-md px-2">
      <div class="font-bold">{{ userStore.user }}: {{ userStore.userScore }}</div>

      <div class="flex flex-col gap-1 w-full">
        <progress
          class="w-full"
          :value="userStore.userScore"
          :max="userStore.userScore + userStore.opponentScore"
        ></progress>
        <div class="flex flex-col">
          <small class="text-center" v-if="userStore.userScore < userStore.opponentScore"
            >You're currently behind</small
          >
          <small
            class="text-center"
            v-else-if="userStore.userScore > userStore.opponentScore"
            >You're currently ahead</small
          >
        </div>
      </div>

      <div class="font-bold text-right">
        {{ userStore.opponent }}: {{ userStore.opponentScore }}
      </div>
    </nav>

    <nav class="rounded justify-center flex flex-row my-4 gap-4">
      <div class="flex flex-row items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        <small> {{ getRemainingTimeInContestInHumanReadable() }} left </small>
      </div>
      <div class="flex flex-row items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.121 7.629A3 3 0 0 0 9.017 9.43c-.023.212-.002.425.028.636l.506 3.541a4.5 4.5 0 0 1-.43 2.65L9 16.5l1.539-.513a2.25 2.25 0 0 1 1.422 0l.655.218a2.25 2.25 0 0 0 1.718-.122L15 15.75M8.25 12H12m9 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <small>
          {{ userStore.money }}
        </small>
      </div>
    </nav>

    <nav class="flex flew-row gap-2 my-2 justify-center">
      <router-link to="/home" class="btn btn-square btn-outline">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </router-link>

      <button class="btn btn-square btn-outline" @click="openRandomGameMode">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
          />
        </svg>
      </button>

      <button class="btn btn-square btn-outline" @click="copyGameStateToClipboard">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
          />
        </svg>
      </button>
      <router-link to="/settings" class="btn btn-square btn-outline">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </router-link>
    </nav>
  </header>

  <div class="" v-else>
    <button class="btn">
      <router-link to="/">Select User</router-link>
    </button>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/userStore";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const copyGameStateToClipboard = async () => {
  try {
    // copy the scores, and add trophy emoji for the winner
    let gameStateText = `Competition State: \n\n${userStore.user}: ${
      userStore.userScore
    } ${userStore.userScore > userStore.opponentScore ? "🏆" : ""}\n${
      userStore.opponent
    }: ${userStore.opponentScore} ${
      userStore.opponentScore > userStore.userScore ? "🏆" : ""
    }`;

    await navigator.clipboard.writeText(gameStateText);
  } catch ($e) {
    alert("Cannot copy progress");
  }
};

const getRemainingTimeInContestInHumanReadable = () => {
  // contest endtime is format 2024-11-03T08:59:00
  const remainingTime = new Date(userStore.contestEndTime) - new Date();
  // get in days, hours, minutes
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} day${days > 1 ? "s" : ""}, ${hours} hour${
    hours > 1 ? "s" : ""
  }, ${minutes} minute${minutes > 1 ? "s" : ""}`;
};

const openRandomGameMode = () => {
  // open a random game mode
  // include ALL of the game mode paths above in the array
  // they're not named, we're going via route url
  const gameModes = [
    "game-cloze",
    "game-sr-target",
    "game-multiple-choice",
    "game-sr",
    "game-missing-letter",
    "game-write-target",
    "game-sr-mixed",
  ];
  const randomGameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
  router.push(`/${randomGameMode}`);
};
</script>
