<template>
  <q-page padding>
    <!-- content -->

    <!--List view-->
    <section v-if="view === 'list'">
      <div class="q-pa-md">
        <q-table
          title="Users"
          :rows="rows"
          :columns="columns"
          :loading="loading"
          :filter="filter"
          v-model:pagination="pagination"
          dark
          color="amber"
        >

          <template v-slot:top-right>
            <div class="row">
              <div class="col-3">
                <q-btn color="amber" icon="add" round flat @click="view = 'add'; ; onReset()">
                  <q-tooltip> Add</q-tooltip>
                </q-btn>
              </div>
              <div class="col-9">
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search" dark
                         filled color="dark">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
              </div>
            </div>
          </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                <template v-if="col.name === 'action'">
<!--                  <q-btn color="amber" icon="remove_red_eye" round flat dense-->
<!--                         @click="view = 'view'; editOrViewUser(props.row)">-->
<!--                    <q-tooltip>View</q-tooltip>-->
<!--                  </q-btn>-->
                  <q-btn color="amber" icon="edit" round flat dense
                         @click="view = 'edit'; editOrViewUser(props.row)"
                         v-if="auth.checkPermissions('user_update')">
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  <!--                  <q-btn color="amber" icon="delete" round flat dense @click="deleteUser(props.row)">-->
                  <!--                    <q-tooltip>Delete</q-tooltip>-->
                  <!--                  </q-btn>-->
                </template>
                <template v-else>
                  {{ col.value }}
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

    </section>

    <!--Edit Form-->
    <section v-if="view === 'edit' || view === 'view'">
      <div class="column items-center">
        <div style="width: calc(50vw)">
          <q-card-section>
            <div class="text-h6 text-app-color-primary">{{ capitalize(view) }} user <b>"{{username}}"</b></div>
          </q-card-section>
          <q-separator inset color="white"></q-separator>

          <q-form
            @submit="onSubmit"
            ref="userForm">

            <div class="row">
              <div class="col">
                <q-card-section>
                  <q-btn flat color="amber" label="Back" icon="arrow_back" @click="view = 'list'"/>
                </q-card-section>

                <div class="q-pa-md q-gutter-md">

                  <q-select
                    dark
                    standout
                    color="amber"
                    v-model="status"
                    :options="userOptions"
                    label="Status"
                    hint="Change the status of the user"
                    required
                    maxlength="20"
                    lazy-rules
                    :rules="[ val => val && val.length > 0 || 'Please select something']"
                    :disable="view === 'view'"/>

                  <div class="q-gutter-sm">
                    <div class="text-subtitle1">Roles</div>
                    <q-radio
                      v-for="(rolAvailable, idx) in roles" :key="idx"
                      dark color="amber"
                      v-model="rol"
                      :val="rolAvailable"
                      :label="capitalize(rolAvailable)"
                      :disable="view === 'view'"/>
                  </div>

                </div>
              </div>
            </div>
            <div v-if="view !== 'view'" class="row">
              <div class="col q-mt-md">
                <div class="text-center">
                  <q-btn label="Submit" type="submit" color="dark" text-color="amber" :loading="loading"/>
                </div>
              </div>
            </div>
          </q-form>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script>
import {date, useQuasar} from "quasar";
import {onMounted, ref} from "vue";
import {HTTP} from "src/http";
import {capitalize, formatBytes} from "src/utils";
import auth from "src/auth";

const columns = [
  {name: 'username', label: 'Username', align: 'left', field: 'username', sortable: true},
  {name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true},
  {name: 'rol', label: 'Rol', align: 'left', field: row => row.rol.name, sortable: true},
  {name: 'uploaded', label: 'Uploaded', align: 'left', field: row => formatBytes(row.uploaded), sortable: true},
  {name: 'downloaded', label: 'Downloaded', align: 'left', field: row => formatBytes(row.downloaded), sortable: true},
  {name: 'user_create', label: 'User Create', align: 'left', field: 'user_create', sortable: true},
  {
    name: 'date_create',
    label: 'Date Create',
    align: 'left',
    field: row => date.formatDate(row.date_create, 'YYYY-MM-DD HH:mm:ss'),
    sortable: true
  },
  {name: 'action', align: 'center', label: 'Actions', field: 'action'}
]

const userOptions = ['active', 'inactive', 'low_ratio', 'warning']

export default {
  name: 'Users',
  setup() {
    const $q = useQuasar()

    const pagination = ref({
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    })
    const rows = ref([])
    const filter = ref('')
    const view = ref('list')
    const loading = ref(false)
    const id = ref(null)
    const username = ref(null)
    const status = ref(null)
    const rol = ref(null)
    const roles = ref([])
    const userForm = ref(null)

    const onRequest = () => {
      loading.value = true
      HTTP.post('/search/user', {})
        .then(async response => {
          loading.value = true
          rows.value = response.data.items
          let rolesAvailables = (await HTTP.get('/rol')).data.items
          roles.value = rolesAvailables.map(x => x.name)
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

    const onSubmit = () => {
      userForm.value.validate().then(success => {
        if (success) {
          let userData = {
            status: status.value,
            rol: rol.value
          }

          if(id.value) {  //Edit
            loading.value = true
            HTTP.put(`/user/${id.value}`, userData)
              .then(response => {
                // Reset the form for masive load
                onReset()
                // Go to list
                onRequest()
                view.value = 'list'

                // show message
                $q.notify({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'cloud_done',
                  message: response.data.msg
                })
              })
              .catch(error => {
                console.log(error)
                $q.notify({
                  color: 'red-5',
                  textColor: 'white',
                  icon: 'warning',
                  message: error.response?.data ? error.response.data.error : 'An error has occurred'
                })
              }).finally(() => {
              loading.value = false
            })
          }
        }
      })
    }

    const editOrViewUser = (instance) => {
      id.value = instance.id
      username.value = instance.username
      status.value = instance.status
      rol.value = instance.rol.name
    }

    const onReset = () => {
      id.value = null
      username.value = null
      status.value = null
      rol.value = null
    }

    onMounted(() => {
      onRequest()
    })


    return {
      auth,
      pagination,
      columns,
      userOptions,
      rows,
      filter,
      loading,
      view,
      id,
      username,
      status,
      rol,
      roles,
      userForm,

      onSubmit,
      capitalize,
      editOrViewUser,
      onReset
    }
  }
}
</script>
