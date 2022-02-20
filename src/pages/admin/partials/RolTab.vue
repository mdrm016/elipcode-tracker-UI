<template>

  <!--List view-->
  <section v-if="view === 'list'">
    <div class="q-pa-md">
      <q-table
        title="Roles"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        :filter="filter"
        v-model:pagination="pagination"
        @request="onRequest"
        dark
        color="amber"
      >
        <template v-slot:top-right>
          <div class="row">
            <div class="col-3">
              <q-btn color="amber" icon="add" round flat @click="view = 'add'; onReset()">
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
                <q-btn color="amber" icon="remove_red_eye" round flat dense
                       @click="view = 'view'; viewRol(props.row)"
                       v-if="auth.checkPermissions('rol_get')">
                  <q-tooltip>View</q-tooltip>
                </q-btn>
                <q-btn color="amber" icon="edit" round flat dense
                       @click="view = 'edit'; editRol(props.row)"
                       v-if="auth.checkPermissions('rol_update')">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn color="amber" icon="delete" round flat dense @click="deleteRol(props.row)"
                       v-if="auth.checkPermissions('rol_delete')">
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </template>
              <template v-else>
                {{ capitalize(col.value) }}
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

  <!--Add Form-->
  <section v-if="view === 'add' || view === 'edit' || view === 'view'">
    <div class="column items-center">
      <div style="width: calc(50vw)">
        <q-card-section>
          <div class="text-h6 text-app-color-primary">{{ capitalize(view) }} a rol</div>
        </q-card-section>
        <q-separator inset color="white"></q-separator>

        <q-form
          @submit="onSubmit"
          @reset="onReset"
          ref="rolForm">

          <div class="row">
            <div class="col">
              <q-card-section>
                <q-btn flat color="amber" label="Back" icon="arrow_back" @click="view = 'list'"/>
              </q-card-section>

              <div class="q-pa-md q-gutter-md">

                <q-input
                  dark
                  standout
                  color="dark"
                  v-model="name"
                  label="Rol name *"
                  :hint="view !== 'view' ? 'A descriptive name for the rol' : ''"
                  required
                  maxlength="20"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type something']"
                  :disable="view === 'view'"
                />

                <TreePermissions :nodes="permissions" @selected="event => permissionsSelected = event"
                                 ref="treeComponent" :strategy="view !== 'view' ? 'leaf' : 'none'"></TreePermissions>

              </div>

            </div>
          </div>
          <div v-if="view !== 'view'" class="row">
            <div class="col q-mt-md">
              <div class="text-center">
                <q-btn label="Submit" type="submit" color="dark" text-color="amber" :loading="loading"/>
                <q-btn v-if="view === 'add'" label="Reset" type="reset" color="dark" text-color="amber" flat
                       class="q-ml-sm"/>
              </div>
            </div>
          </div>
        </q-form>
      </div>
    </div>
  </section>

</template>

<script>
import {onMounted, ref, watch} from "vue";
import {HTTP} from "src/http";
import {capitalize} from "src/utils";
import {useQuasar} from "quasar";
import TreePermissions from "pages/admin/partials/TreePermissions";
import auth from "src/auth";

const columns = [
  {name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true},
  {name: 'action', align: 'center', label: 'Actions', field: 'action'}
]

export default {
  name: "RolTab",
  components: {
    TreePermissions
  },
  setup() {

    const $q = useQuasar()

    let permisssionStore = []

    const pagination = ref({
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    })
    const view = ref('list')
    const filter = ref('')
    const rows = ref([])
    const loading = ref(false)
    const name = ref(null)
    const id = ref(null)
    const permissions = ref([])
    const permissionsSelected = ref([])
    const rolForm = ref(null)
    const treeComponent = ref(null)

    const onRequest = () => {
      HTTP.post('/search/rol', {})
        .then(async response => {
          loading.value = true
          rows.value = response.data.items
          let permissionListRaw = (await HTTP.get('/permission')).data
          permisssionStore = groupByForTree(permissionListRaw, perm => perm.group);
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Roles list not obtained'
          })
        })
        .finally(() =>
          loading.value = false
        )
    }

    const onSubmit = () => {
      rolForm.value.validate().then(success => {
        if (success) {
          let rolData = {
            name: name.value.toLowerCase(),
            permissions: permissionsSelected.value
          }

          if (id.value) {  //Edit
            loading.value = true
            HTTP.put(`/rol/${id.value}`, rolData)
              .then(response => {
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
                $q.notify({
                  color: 'red-5',
                  textColor: 'white',
                  icon: 'warning',
                  message: error.response.data ? error.response.data.error : 'An error has occurred'
                })
              }).finally(() => {
              loading.value = false
            })
          } else {  // Add
            loading.value = true
            HTTP.post('/rol', rolData)
              .then(response => {
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
                $q.notify({
                  color: 'red-5',
                  textColor: 'white',
                  icon: 'warning',
                  message: error.response.data ? error.response.data.error : 'An error has occurred'
                })
              }).finally(() => {
              loading.value = false
            })
          }
        }
      })

    }

    const onReset = () => {
      id.value = null
      name.value = null
      permissions.value = permisssionStore
      treeComponent.value?.clearTicked()
    }

    const editRol = (instance) => {
      id.value = instance.id
      name.value = instance.name
      permissions.value = permisssionStore
      let permissionsSelected = instance.permissions.map(x => x.name)
      setTimeout(() => treeComponent.value?.setTickedComponent(permissionsSelected), 0)
    }

    const viewRol = (instance) => {
      name.value = instance.name
      permissions.value = groupByForTree(instance.permissions, perm => perm.group);
    }

    const deleteRol = (instance) => {
      $q.dialog({
        dark: true,
        title: 'Confirm delete rol',
        message: `Would you like delete the rol ${instance.name}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
        // Delete category
        HTTP.delete(`/rol/${instance.id}`)
          .then(response => {
            // return to page view
            $q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'cloud_done',
              message: response.data.msg
            })
            onRequest()
            view.value = 'list'
          })
          .catch(error => {
            $q.notify({
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: error.response && error.response.data ? error.response.data.error : 'An error has occurred'
            })
          })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    const groupByForTree = (xs, f) => {
      let reduced = xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), []);

      return Object.keys(reduced).map(key => {
        let data = []
        reduced[key].forEach(value => {
          let tmp = {
            label: value.name
          }
          data.push(tmp)
        })
        return {label: key, children: data};
      })
    }

    onMounted(() => {
      onRequest()
    })

    return {
      auth,
      view,
      filter,
      columns,
      rows,
      pagination,
      loading,
      permissions,
      permissionsSelected,
      name,
      id,
      rolForm,
      treeComponent,

      onRequest,
      onSubmit,
      onReset,
      editRol,
      deleteRol,
      capitalize,
      viewRol,

    }
  }
}
</script>

<style scoped>

</style>
