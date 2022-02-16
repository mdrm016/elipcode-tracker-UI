<template>
  <q-layout view="hHh Lpr fFf">
    <NavbarComponent/>

    <q-page-container class="bg-grey-10 text-white">
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>

import {defineComponent} from "vue";
import NavbarComponent from "components/NavbarComponent";

export default defineComponent({
  name: "MainLayout",
  components: {
    NavbarComponent
  },
  setup() {
    return {}
  }
});
</script>

