import { createApp, ref } from 'vue';
createApp({
  setup() {
    return {
      count: ref(0),
    };
  },
}).mount('#app');
