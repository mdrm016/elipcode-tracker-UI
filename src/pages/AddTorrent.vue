<template>
  <q-page>

    <div class="q-pa-md">

      <q-card-section>
        <div class="text-h6 text-app-color-primary">Upload a torrent</div>
      </q-card-section>
      <q-separator inset color="white"></q-separator>

      <q-card-section>
        <div class="text-subtitle1">
          Your announce url: <b class="text-subtitle2 text-app-color-primary">{{ announce }}</b>
        </div>
      </q-card-section>

      <q-card-section>

        <q-form
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
          color="dark"
        >

          <div class="row">
            <div class="col">
              <q-input
                dark
                standout
                v-model="name"
                label="Torrent name *"
                color="dark"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Please type something']"
              />

              <br>

              <q-input
                v-model="description"
                label="Description"
                dark
                standout
                type="textarea"
              />

              <br>

              <q-input
                @update:model-value="val => { torrent_file = val[0] }"
                dark
                standout
                type="file"
                hint="Torrent file *"
                accept="application/x-bittorrent"
              />

              <br>

              <q-toggle dark v-model="accept" label="I accept responsibility for the publication of this file"/>


              <div>
                <q-btn label="Submit" type="submit" color="dark" text-color="amber" :disable="!accept"/>
                <q-btn label="Reset" type="reset" flat class="q-ml-sm float-right" color="dark" text-color="amber"/>
              </div>
            </div>

            <div class="col">

            </div>
          </div>

        </q-form>
      </q-card-section>
    </div>

  </q-page>

</template>

<script>
import {useQuasar} from 'quasar'
import {onMounted, ref} from 'vue'
import {HTTP} from "src/http";
import {useRouter} from "vue-router";

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const name = ref('My muscle Torrent')//ref(null)
    const description = ref('My muscle Torrent description')//ref(null)
    const torrent_file = ref(null)
    const accept = ref(true)//ref(false)
    const announce = ref('')

    const get_announce = () => {
      HTTP.get('/get_announce')
        .then(response => {
          announce.value = response.data.announce
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Announce not obtained'
          })
        })
    }

    onMounted(() => {
      get_announce()
    })

    return {
      announce,
      name,
      description,
      torrent_file,
      accept,

      onSubmit() {
        if (accept.value !== true) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'You need to accept the license and terms first'
          })
        } else {
          let torrentFormData = new FormData();
          torrentFormData.append('name', name.value);
          torrentFormData.append('description', description.value);
          torrentFormData.append('torrent_file', torrent_file.value);

          HTTP.post('/torrents', torrentFormData)
            .then(response => {
              // return to page view
              $q.notify({
                color: 'green-4',
                textColor: 'white',
                icon: 'cloud_done',
                message: response.data.msg
              })
              router.push({path: '/torrentlist'}) // Posteriormente se debe redirigir a pantalla de visualización
            })
            .catch(error => {
              console.log(error)
              $q.notify({
                color: 'red-5',
                textColor: 'white',
                icon: 'warning',
                message: error.response.data ? error.response.data.error : 'An error has occurred'
              })
            })

        }
      },
      onReset() {
        name.value = null
        description.value = null
        torrent_file.value = null
        accept.value = false
      }
    }
  }
}
</script>
