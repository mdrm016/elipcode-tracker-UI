<template>
  <q-item clickable v-ripple @click="toView(link)" :active="active" active-class="text-orange" v-if="roles.includes(auth.getRol())">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label >{{ title }}</q-item-label>
      <q-item-label caption class="text-caption-dark" >
        {{ caption }}
      </q-item-label>
    </q-item-section>

  </q-item>
</template>

<script>
import { defineComponent } from "vue";
import {useRouter} from "vue-router";
import auth from "src/auth";

export default defineComponent({
  name: "AdminSidebarComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "#",
    },
    icon: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const router = useRouter()

    const toView = (link) => {
      router.push({path: link})
    }

    return {
      auth,

      toView
    }
  }
});

</script>
