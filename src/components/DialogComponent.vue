<template>
  <q-dialog v-model="showDialog" @hide="$emit('onHide')">
    <q-card style="width: 300px" dark>
      <q-card-section>
        <div class="text-h6">{{ titleDialog }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ messageDialog }}
      </q-card-section>

      <q-card-actions align="right" class="bg-dark text-teal">
        <q-btn flat label="OK" text-color="amber" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

import {ref, watch} from "vue";

export default {
  name: 'DialogComponent',
  props: {
    active: Boolean,
    title: String,
    message: String,
  },
  setup(props) {
    const showDialog = ref(false)
    const titleDialog = ref(null)
    const messageDialog = ref(null)

    watch(() => props.active, (currentValue, oldValue) => {
        showDialog.value = currentValue
        titleDialog.value = props.title
        messageDialog.value = props.message
      },
      {deep: true}
    );

    return {
      showDialog,
      titleDialog,
      messageDialog
    }

  }
}
</script>
