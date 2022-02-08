<template>
  <q-page>

    <q-card-section>
      <div class="text-h6 text-app-color-primary">Torrents List</div>
    </q-card-section>
    <q-separator inset color="white"></q-separator>

    <div class="q-pa-md">
      <q-table
        title="Torrents"
        :rows="torrent_list"
        :columns="columns"
        row-key="name"
        dark
        color="amber"
        :pagination="pagination"
        :loading="loading"
      >

        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              color="amber"
              icon="download"
              round
              flat
              dense
              @click="downloadTorrent(props.row)"
            />
          </q-td>
        </template>

        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied"/>
            <span>
            Well this is sad... {{ message }}
          </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon"/>
          </div>
        </template>

      </q-table>
    </div>

  </q-page>
</template>

<script>
import {HTTP} from "src/http";
import {useQuasar} from "quasar";
import {onMounted, ref} from "vue";

const columns = [
  {name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true},
  {name: 'category', label: 'Category', align: 'left', field: 'category', sortable: true},
  {name: 'seeders', align: 'center', label: 'Seeders', field: 'seeders'},
  {name: 'leechers', align: 'center', label: 'Leechers', field: 'leechers'},
  {name: 'action', align: 'center', label: 'Acciones', field: 'action'}
]

export default {
  setup() {

    const $q = useQuasar()

    const torrent_list = ref([])
    const loading = ref(false)

    const get_announce = () => {
      HTTP.get('/torrents')
        .then(response => {
          loading.value = true
          console.log(response.data.items)
          torrent_list.value = response.data.items
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

    onMounted(() => {
      get_announce()
    })

    return {
      columns,
      torrent_list,
      pagination: {
        rowsPerPage: 30 // current rows per page being displayed
      },
      loading,

      downloadTorrent(torrentRow) {
        HTTP.get(`/torrents/get_torrent_file/${torrentRow.torrent_id}`, {
          headers: {
            'Accept': 'application/x-bittorrent'
          },
          responseType: 'blob' })
        .then(response => {
          // const blob = new Blob([response.data], { type: response.data.type });
          let blob = response.data
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${torrentRow.name}.torrent`;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch(error => {
          console.log(error)
        })
      }
    }

  }
}
</script>
