<template>
  <div class="text-center mb-10">
    <h2 class="text-2xl font-bold mb-4">Settings</h2>
    <h3 class="text-xl">Which Vocab To Learn?</h3>

    <div class="flex flex-col gap-2">
      <div
        class="form-control"
        v-for="context in vocabStore.vocabContexts"
        :key="context.name"
      >
        <label class="label">
          <span class="label-text">{{ context.name }}</span>
          <input
            class="checkbox"
            type="checkbox"
            :checked="context.active"
            @change="vocabStore.toggleContext(context.name)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVocabStore } from "../stores/vocabStore";

const vocabStore = useVocabStore();
</script>
