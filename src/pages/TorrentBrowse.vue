<template>
  <q-page padding>
    <!-- content -->

    <div class="column items-center">
      <q-card class="" dark style="width: calc(90vw)">

        <div class="q-pa-md">

          <div class="row">
            <div class="col">
              <q-card class="no-border no-shadow bg-transparent">
                <q-card-section class="q-pa-sm">
                  <q-input dark rounded v-model="filter" outlined placeholder="Input a search criteria..."
                           color="amber">
                    <template v-slot:append>
                      <q-icon v-if="filter == null" name="search"/>
                      <q-icon v-else name="clear" class="cursor-pointer" @click="filter = null"/>
                    </template>
                  </q-input>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-separator color="grey-9" inset/>

          <masonry-wall class="q-ma-md" :items="torrent_list" :ssr-columns="1" :column-width="200" :gap="10">
            <template #default="{ item }">
              <q-img v-ripple :src="`${getMediaBackend()}/${item.cover.path}`" class="browse-image">
                <div @click.prevent="goToTorrentView(item)" style="width: 100%; height: 100%; background: none"/>
                <div class="absolute-top options-browse">
                  <q-img :src="`${getMediaBackend()}/${cat.image_path}`" class="browse-image q-ml-xs q-mb-xs"
                         v-for="(cat, idx) in item.categories" :key="idx"
                         style="max-height: 28px; max-width: 36px"/>
                </div>
                <div class="absolute-bottom options-browse">

                  <q-btn flat round color="white" icon="image">
                    <q-popup-proxy>
                      <q-banner rounded dark style="max-width: calc(50vw)">
                        <template v-slot:avatar>
                          <masonry-wall :items="item.images" :ssr-columns="1" :column-width="100" :gap="0">
                            <template #default="{ item }">
                              <img :src="`${getMediaBackend()}/${item.path}`" style="width: 100%"/>
                            </template>
                          </masonry-wall>
                        </template>
                      </q-banner>
                    </q-popup-proxy>
                  </q-btn>

                  <q-btn flat round color="white" icon="info_outline">
                    <q-popup-proxy>
                      <q-banner rounded dark style="max-width: calc(30vw)">
                        <div class="q-ma-sm q-gutter-sm">
                          <p>{{ item.name }}</p>
                          <p>{{ item.uploaded_time }}</p>
                          <p>Size: {{ formatBytes(item.info.total_length) }} &nbsp;&nbsp; Seeders: {{item.seeders}} &nbsp; Leechers: {{item.leechers}}</p>
                          <p>{{ item.info.files.length }} files</p>

                          <q-separator color="grey-9" inset/>
                          <div class="text-subtitle2">{{ item.description }}</div>
                        </div>
                      </q-banner>
                    </q-popup-proxy>
                  </q-btn>
                  <q-btn flat round color="white" icon="cloud_download" @click="downloadTorrent(item)"/>
                  <q-btn flat round color="white" icon="star_border"/>
                </div>
              </q-img>
            </template>
          </masonry-wall>

        </div>

      </q-card>
    </div>

  </q-page>
</template>

<script>
import {onMounted, ref} from "vue";
import {HTTP} from "src/http";
import {date, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import MasonryWall from "@yeger/vue-masonry-wall";
import {downloadTorrent, getMediaBackend, formatBytes} from "src/utils";

export default {
  name: 'TorrentBrowse',
  components: {
    MasonryWall
  },
  setup() {

    const $q = useQuasar()
    const router = useRouter()

    const filter = ref(null)
    const loading = ref(false)
    const torrent_list = ref([])
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 50
      // rowsNumber: xx if getting data from a server
    })

    const onRequest = (props) => {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      loading.value = true
      $q.loading.show()

      // TODO: sincronize with backend
      HTTP.post('/search/torrents', {})
        .then(response => {
          torrent_list.value = response.data.items
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Torrent list not obtained'
          })
        })
        .finally(() =>
          $q.loading.hide()
        )
    }

    const goToTorrentView = (row) => {
      let routeResolved = router.resolve({path: "torrentview", query: {id: row.id}})
      window.open(routeResolved.href, '_blank');  // To new tab
    }

    onMounted(() => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
    })

    return {
      filter,
      loading,
      torrent_list,
      pagination,

      getMediaBackend,
      downloadTorrent,
      goToTorrentView,
      formatBytes
    }
  }
}
</script>

<style>
.q-img__content > div {
  padding: 5px 0 0;
}

.options-browse {
  display: none;
}

.browse-image:hover .options-browse {
  display: block;
}

.q-btn:hover {
  color: #ffc107 !important;
}
</style>
