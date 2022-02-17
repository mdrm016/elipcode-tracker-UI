<template>
  <q-page padding>

    <div class="q-pa-md" v-if="instance">

      <div class="column items-center">
        <q-card class="" dark style="width: calc(80vw)">
          <q-card-section>
            <div class="text-h6 text-app-color-primary text-center">{{ instance.name }}</div>
            <!--            <div class="text-subtitle2">by John Doe</div>-->
          </q-card-section>

          <q-separator color="grey-5" inset/>

          <div class="row q-ma-md">
            <div class="col-2">
              <!--Categoria principal-->
              <q-img v-ripple :src="`${getMediaBackend()}/${instance.categories.find(x => x.principal).image_path}`"
                     class="rounded-borders" style="height: 200px" :fit="'cover'">
                <q-tooltip anchor="top middle">
                  {{ `${instance.categories.find(x => x.principal).name}` }}
                </q-tooltip>
              </q-img>
            </div>
            <!--Otras categorias-->
            <div class="col-1">
              <div class="row" v-for="(image, idx) in (instance.categories.filter(x => !x.principal))" :key="idx">
                <q-img v-ripple :src="`${getMediaBackend()}/${image.image_path}`" class="rounded-borders"
                       style="height: 50px" :fit="'cover'">
                  <q-tooltip anchor="top middle">
                    {{ `${image.name}` }}
                  </q-tooltip>
                </q-img>
              </div>
            </div>
          </div>

          <q-separator color="grey-9" inset/>

          <!--Buttons-->
          <div class="row q-ma-md">
            <div class="q-gutter-sm">
              <q-btn color="grey-8" glossy label="Download" :loading="loadingTorrentFile"
                     @click="downloadTorrent(instance)"/>
              <q-btn color="grey-8" label="Wishlist" icon="star_border"/>
            </div>
          </div>

          <q-separator color="grey-9" inset/>

          <!--gallery-->
          <div class="q-ma-md">
            <masonry-wall :items="instance.images" :ssr-columns="1" :column-width="150" :gap="10">
              <template #default="{ item }">
                <q-img :src="`${getMediaBackend()}/${item.path}`"/>
              </template>
            </masonry-wall>
          </div>

          <q-separator color="grey-9" inset/>

          <!--description-->
          <div class="q-ma-md">
            {{ instance.description }}
          </div>

          <q-separator color="grey-9" inset/>

          <!--description-->
          <div class="q-ma-md">
            {{ instance.categories.find(x => x.principal).name }}
          </div>

          <q-separator color="grey-9" inset/>

          <!--Size-->
          <div class="q-ma-md">
            {{
              `${formatBytes(instance.info.total_length)} (${Number(instance.info.total_length).toLocaleString()} bytes)`
            }}
          </div>

          <q-separator color="grey-9" inset/>

          <!--Uploaded Time-->
          <div class="q-ma-md">
            {{ instance.uploaded_time }}
          </div>

          <q-separator color="grey-9" inset/>

          <!--Downloaded-->
          <div class="q-ma-md">
            {{ instance.download_count }} time(s)
          </div>

          <q-separator color="grey-9" inset/>

          <!--Total traffic-->
          <div class="q-ma-md">
            {{ instance.downloaded }} GB
          </div>

          <q-separator color="grey-9" inset/>

          <!--Upload by-->
          <!-- TODO: Edit torrent images and description -->
          <div class="q-ma-md">
            {{ instance.user_create }}
          </div>

          <q-separator color="grey-9" inset/>

          <!--File List-->
          <q-list dark class="rounded-borders" v-if="instance.info.files">
            <q-expansion-item :label="`${instance.info.files.length} files`">
              <div class="bg-grey-9">
                <div class="row q-ml-md" v-for="(file, idx) in instance.info.files" :key="idx">
                  <div class="col">{{ file.path.join('/') }}</div>
                  <div class="col">{{ `${formatBytes(file.length)}` }}</div>
                </div>
              </div>
            </q-expansion-item>
          </q-list>

          <q-separator color="grey-9" inset/>

          <!-- Peers -->
          <div class="q-ma-md">
            {{
              `${instance.seeders} Seeder(s) ${instance.leechers} Leecher(s) = ${instance.seeders + instance.leechers} Peer(s) connected`
            }}
          </div>

          <!-- TODO: Seed Bonus functionality -->
          <!-- TODO: Comentary section -->


        </q-card>


      </div>


    </div>
  </q-page>
</template>

<script>
import {useRoute} from "vue-router";
import {onBeforeMount, ref} from "vue";
import {HTTP} from "src/http";
import {date, useQuasar} from "quasar";
import constants from "src/constants";
import {formatBytes} from "src/utils";
import MasonryWall from "@yeger/vue-masonry-wall";

export default {
  name: 'TorrentView',
  components: {
    MasonryWall
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute();

    const id = ref(route.query.id)
    const loading = ref(false)
    const loadingTorrentFile = ref(false)
    const instance = ref(null)

    const onRequest = () => {

      loading.value = true
      HTTP.get(`/torrents/${id.value}`)
        .then(response => {
          instance.value = response.data
          instance.value.images = [instance.value.cover, ...instance.value.images]  //The cover first
          // instance.value.uploaded_time = date.formatDate(instance.value.uploaded_time, 'YYYY-MM-DD HH:mm:ss')
          document.title = instance.value.name
          // console.log(instance.value)
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Torrent not obtained'
          })
        })
        .finally(() =>
          loading.value = false
        )
    }

    const getMediaBackend = () => {
      return constants.STORAGE_BACKEND_URL
    }

    const downloadTorrent = (torrent) => {
      loadingTorrentFile.value = true
      HTTP.get(`/torrents/get_torrent_file/${torrent.id}`, {
        headers: {
          'Accept': 'application/x-bittorrent'
        },
        responseType: 'blob'
      }).then(response => {
        let filename = response.headers['x-filename'];
        let blob = response.data
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'A error ocurred to obtain file.'
          })
        })
        .finally(() => {
          loadingTorrentFile.value = false
        })
    }

    onBeforeMount(() => {
      onRequest()
    })

    return {
      loading,
      loadingTorrentFile,
      instance,

      getMediaBackend,
      downloadTorrent,
      formatBytes
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 350px
</style>
