<template>
  <q-page>

    <q-card-section>
      <div class="text-h6 text-app-color-primary">Torrents List</div>
    </q-card-section>
    <q-separator inset color="white"></q-separator>

    <div class="q-pa-md">
      <q-table
        title="Torrents"
        :rows="rows"
        :columns="columns"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loading"
        @request="onRequest"
        binary-state-sort
        dark
        color="amber"
      >
        <template v-slot:top-right>
          <q-input class="full-width" borderless dense debounce="300" v-model="filter" placeholder="Search" dark filled
                   color="dark">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <template v-ripple v-if="col.name === 'cover'">
                <div @click="goToTorrentView(props.row)">
                  <q-img :src="`${getMediaBackend()}/${props.row.cover.path}`" class="rounded-borders" style="min-width: 75px; height: 100px;"/>
                </div>
              </template>
              <template v-else>
                <template v-if="col.name === 'action'">
                  <q-btn color="amber" icon="download" round
                         flat dense @click="downloadTorrent(props.row)"/>
                </template>
                <template v-else>
                  {{ col.value }}
                </template>
              </template>

            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <span class="text-app-color-primary"> {{ message }} </span>
            <q-icon class="text-app-color-primary" size="2em" :name="filter ? 'filter_b_and_w' : icon"/>
          </div>
        </template>

      </q-table>
    </div>

  </q-page>
</template>

<script>
import {HTTP} from "src/http";
import {date, useQuasar} from "quasar";
import {onMounted, ref} from "vue";
import constants from "src/constants";
import {useRouter} from "vue-router";
import {downloadTorrent} from "src/utils";


const columns = [
  {name: 'cover', label: '', align: 'center', field: 'cover'},
  {
    name: 'category',
    label: 'Category',
    align: 'left',
    field: row => row.categories.find(x => x.principal).name,
    sortable: true
  },
  {
    name: 'date',
    label: 'Upload date',
    align: 'center',
    field: row => date.formatDate(row.uploaded_time, 'YYYY-MM-DD HH:mm:ss'),
    sortable: true
  },
  {name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true},
  {name: 'seeders', align: 'center', label: 'Seeders', field: 'seeders'},
  {name: 'leechers', align: 'center', label: 'Leechers', field: 'leechers'},
  {name: 'action', align: 'center', label: 'Actions', field: 'action'}
]

export default {
  setup() {

    const $q = useQuasar()
    const router = useRouter()

    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 20
      // rowsNumber: xx if getting data from a server
    })

    const onRequest = (props) => {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      loading.value = true

      // TODO: sincronize with backend
      HTTP.post('/search/torrents', {})
        .then(response => {
          rows.value = response.data.items
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Torrent List not obtained'
          })
        })
        .finally(() =>
          loading.value = false
        )
    }

    const getMediaBackend = () => {
      return constants.STORAGE_BACKEND_URL
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
      pagination,
      columns,
      rows,

      onRequest,
      downloadTorrent,
      getMediaBackend,
      goToTorrentView,
    }

  }
}
</script>
