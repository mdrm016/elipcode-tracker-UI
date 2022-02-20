<template>
  <div
    class="fullscreen text-amber-8 text-center q-pa-md flex flex-center"
    style="background-color: #32322f"
  >
    <div>
      <div style="font-size: 30vh">
        <q-icon name="broken_image"></q-icon>
      </div>

      <div class="text-h2" style="opacity: 0.4">Oops. You do not have permission to access this page...</div>

      <q-btn
        class="q-mt-xl"
        color="dark"
        text-color="amber"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'NotAllowed',
})
</script>
