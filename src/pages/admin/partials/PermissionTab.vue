<template>

  <!--List view-->
  <section v-if="view === 'list'">
    <div class="q-pa-md">
      <q-table
        title="Permissions"
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

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width/>
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn size="sm" color="orange" round dense @click="props.row.expand = !props.row.expand"
                     :icon="props.row.expand ? 'remove' : 'add'"/>
            </q-td>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ capitalize(col.value) }}
            </q-td>
          </q-tr>
          <q-tr v-show="props.row.expand" :props="props">
            <q-td colspan="100%">

              <q-list dark dense style="width: calc(50vw)">
                <q-item clickable v-ripple v-for="(permission, idx) in props.row.children" :key="idx">
                  <q-item-section>{{ permission.name }}</q-item-section>
                  <q-item>
                    <q-btn color="amber" icon="edit" round flat dense
                           @click="view = 'edit'; editPermission(permission)"
                           v-if="auth.checkPermissions('permission_update')">
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn color="amber" icon="delete" round flat dense @click="deletePermission(permission)"
                           v-if="auth.checkPermissions('permission_delete')">
                      <q-tooltip>Delete</q-tooltip>
                    </q-btn>
                  </q-item>
                </q-item>
              </q-list>

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

  <!--    Add Form-->
  <section v-if="view === 'add' || view === 'edit' || view === 'view'">
    <div class="column items-center">
      <div style="width: calc(50vw)">
        <q-card-section>
          <div class="text-h6 text-app-color-primary">{{ capitalize(view) }} a permission</div>
        </q-card-section>
        <q-separator inset color="white"></q-separator>

        <q-form
          @submit="onSubmit"
          @reset="onReset"
          ref="permissionForm">

          <div class="row">
            <div class="col">
              <q-card-section>
                <q-btn flat color="amber" label="Back" icon="arrow_back" @click="view = 'list'"/>
              </q-card-section>

              <div class="q-pa-md q-gutter-md">

                <q-select
                  dark
                  standout
                  clearable
                  color="dark"
                  v-model="group"
                  label="Group permission *"
                  hint="Select or input a Group"
                  use-input
                  use-chips
                  input-debounce="0"
                  @new-value="createGroup"
                  :options="filterGroupOptions"
                  @filter="filterGroup"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type or select something' ]"
                />

                <q-input
                  dark
                  standout
                  color="dark"
                  v-model="name"
                  label="Permission name *"
                  hint="A descriptive name for the permission"
                  required
                  maxlength="100"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type something']"
                />

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
import {onMounted, ref} from "vue";
import {capitalize, groupBy} from "src/utils";
import {HTTP} from "src/http";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import auth from "src/auth";

const columns = [
  {
    name: 'group',
    label: 'Group',
    align: 'left',
    field: row => row.group,
    format: val => `${val}`,
    sortable: true
  }
]

export default {
  name: "PermissionTab",
  setup() {
    const $q = useQuasar()

    let groupOptions = []

    const pagination = ref({
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    })
    const rows = ref([])
    const filter = ref('')
    const view = ref('list')
    const loading = ref(false)
    const id = ref(null)
    const group = ref(null)
    const name = ref(null)
    const filterGroupOptions = ref([])
    const permissionForm = ref(null)

    const onSubmit = () => {
      permissionForm.value.validate().then(success => {
        if (success) {
          let permissionData = {
            name: name.value.toLowerCase(),
            group: group.value.toLowerCase()
          }

          if (id.value) { //Edit
            loading.value = true
            HTTP.put(`/permission/${id.value}`, permissionData)
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
                $q.notify({
                  color: 'red-5',
                  textColor: 'white',
                  icon: 'warning',
                  message: error.response.data ? error.response.data.error : 'An error has occurred'
                })
              }).finally(() => {
              loading.value = false
            })
          } else {  //Add
            loading.value = true
            HTTP.post('/permission', permissionData)
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
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    const onReset = () => {
      id.value = null
      group.value = null
      name.value = null
      restoreOptions()
    }

    const restoreOptions = () => {
      groupOptions = []
      rows.value.forEach(value => {
        if (!groupOptions.includes(value.group)) {
          groupOptions.push(value.group)
        }
      })
    }

    const onRequest = () => {
      loading.value = true
      HTTP.post('/search/permission', {}, {
        params: {
          pagination: false
        },
      })
        .then(response => {
          loading.value = true
          const data = response.data
          const grouped = groupBy(data, perm => perm.group);
          rows.value = grouped

          // Get Group options
          restoreOptions()
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

    const createGroup = (val, done) => {
      if (val.length > 0) {
        if (!groupOptions.includes(val)) {
          groupOptions.push(val)
        }
        done(val, 'toggle')
      }
    }

    const filterGroup = (val, update) => {
      update(() => {
        if (val === '') {
          filterGroupOptions.value = groupOptions
        } else {
          const needle = val.toLowerCase()
          filterGroupOptions.value = groupOptions.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }

    const editPermission = (instance) => {
      id.value = instance.id
      group.value = instance.group
      name.value = instance.name
    }

    const deletePermission = (instance) => {
      $q.dialog({
        dark: true,
        title: 'Confirm delete permission',
        message: `Would you like delete the permission ${instance.name}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
        // Delete category
        HTTP.delete(`/permission/${instance.id}`)
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

    onMounted(() => {
      onRequest()
    })

    return {
      auth,
      pagination,
      columns,
      rows,
      filter,
      loading,
      view,
      id,
      group,
      name,
      filterGroupOptions,
      permissionForm,

      capitalize,
      onSubmit,
      onReset,
      createGroup,
      filterGroup,
      editPermission,
      deletePermission
    }
  }
}
</script>
