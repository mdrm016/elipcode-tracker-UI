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
                           color="amber" @keydown.enter.prevent="onRequest()">
                    <template v-slot:append>
                      <q-icon v-if="filter == null" name="search"/>
                      <q-icon v-else name="clear" class="cursor-pointer" @click="filter = null; onRequest()"/>
                    </template>

                    <template v-slot:after>
                      <q-btn round dense flat :loading="loading" icon="send" @click="onRequest()" :disable="filter == null || filter === ''"/>
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
                          <p>Size: {{ formatBytes(item.info.total_length) }} &nbsp;&nbsp; Seeders: {{ item.seeders }}
                            &nbsp; Leechers: {{ item.leechers }}</p>
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

          <!--No Data block-->
          <div v-if="!loading && (!torrent_list || torrent_list.length === 0)" class="full-width row flex-center q-gutter-sm">
            <div class="text-app-color-primary text-h6">
              <q-icon class="text-app-color-primary" size="2em" name="sentiment_very_dissatisfied"/>
              No data
            </div>
          </div>

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
      sortBy: 'uploaded_time',
      descending: true,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 0 //if getting data from a server
    })

    const onRequest = () => {
      const {page, rowsPerPage, sortBy, descending} = pagination.value

      let search = {
        status: 'visible', //['visible', 'dead', 'all']
        filter: filter.value
      }

      $q.loading.show()
      loading.value = true
      // TODO: sincronize with backend
      HTTP.post('/search/torrents', search, {
        params: {
          page: page ? page : null,
          per_page: rowsPerPage ? rowsPerPage : null
        }
      })
        .then(response => {
          torrent_list.value = response.data.items
          pagination.value.page = response.data.page
          // pagination.value.rowsPerPage = response.data.per_page
          // pagination.value.rowsNumber = response.data.row_number
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Torrent list not obtained'
          })
        })
        .finally(() => {
          $q.loading.hide()
          loading.value = false
        })
    }

    const goToTorrentView = (row) => {
      let routeResolved = router.resolve({path: "torrentview", query: {id: row.id}})
      window.open(routeResolved.href, '_blank');  // To new tab
    }

    onMounted(() => {
      onRequest()
    })

    return {
      filter,
      loading,
      torrent_list,
      pagination,

      getMediaBackend,
      downloadTorrent,
      goToTorrentView,
      formatBytes,
      onRequest
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
