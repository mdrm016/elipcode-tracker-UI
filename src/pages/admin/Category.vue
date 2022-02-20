<template>
  <q-page padding>
    <!-- content -->
    <!--    List view-->
    <section v-if="view === 'list'">
      <div class="q-pa-md">
        <q-table
          title="Categories"
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
                <template v-if="col.name === 'image'">
                  <q-item clickable v-ripple v-if="props.row.image_path">
                    <q-item-section clickable v-ripple>
                      <q-img :src="`${getMediaBackend()}/${props.row.image_path}`" class="rounded-borders" style="max-width: 100px; height: 75px;"/>
                    </q-item-section>
                  </q-item>
                  <span v-else>No image</span>
                </template>
                <template v-else>
                  <template v-if="col.name === 'action'">
                    <q-btn color="amber" icon="remove_red_eye" round flat dense
                           @click="view = 'view'; editOrViewCategory(props.row)"
                           v-if="auth.checkPermissions('category_get')">
                      <q-tooltip>View</q-tooltip>
                    </q-btn>
                    <q-btn color="amber" icon="edit" round flat dense
                           @click="view = 'edit'; editOrViewCategory(props.row)"
                           v-if="auth.checkPermissions('category_update')">
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn color="amber" icon="delete" round flat dense @click="confirmDelete(props.row)"
                           v-if="auth.checkPermissions('category_delete')">
                      <q-tooltip>Delete</q-tooltip>
                    </q-btn>
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
    </section>

    <!--    Add Form-->
    <section v-if="view === 'add' || view === 'edit' || view === 'view'">
      <q-card-section>
        <div class="text-h6 text-app-color-primary">{{ capitalize(view) }} a category</div>
      </q-card-section>
      <q-separator inset color="white"></q-separator>

      <q-form
        @submit="onSubmit"
        @reset="onReset">

        <div class="row">
          <div class="col-12 col-md-6">
            <q-card-section>
              <q-btn flat color="amber" label="Back" icon="arrow_back" @click="view = 'list'"/>
            </q-card-section>

            <div class="q-pa-md q-gutter-md">

              <q-input
                dark
                standout
                color="dark"
                v-model="name"
                label="Category name *"
                hint="A descriptive name for style of torrents"
                required
                maxlength="20"
                lazy-rules
                :disable="view === 'view'"
                :rules="[ val => val && val.length > 0 || 'Please type something']"
              />

              <q-file v-if="view !== 'view'" dark standout v-model="image" label="Category image *"
                      accept="image/*" class="q-mb-md" color="dark"
                      @update:model-value="val => getImageSrc(val)"
                      hint="Select an image for the category"
              />

            </div>
          </div>
          <div class="col-12 col-md-6">
            <q-card dark class="q-ma-md" v-if="imageBase64 || image_path">
              <q-img :src="imageBase64 ? imageBase64.base64 : `${getMediaBackend()}/${image_path}`"
                     :ratio="4/3"></q-img>
            </q-card>
            <div v-else class="row full-height items-center justify-center">
              <h3 class="text-h3">No Image</h3>
            </div>

          </div>
        </div>
        <div v-if="view !== 'view'" class="row">
          <div class="col q-mt-md">
            <div class="text-center">
              <q-btn label="Submit" type="submit" color="dark" text-color="amber"/>
              <q-btn v-if="view === 'add'" label="Reset" type="reset" color="dark" text-color="amber" flat
                     class="q-ml-sm"/>
            </div>
          </div>
        </div>
      </q-form>
    </section>

  </q-page>
</template>

<script>
import {useQuasar} from "quasar";
import {onMounted, ref} from "vue";
import {HTTP} from "src/http";
import {useRouter} from "vue-router";
import constants from "src/constants";
import {capitalize} from "src/utils";
import auth from "src/auth";

const columns = [
  {name: 'image', label: '', align: 'center', field: 'image'},
  {name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true},
  {name: 'action', align: 'center', label: 'Actions', field: 'action'}
]

export default {
  name: 'Category',
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const pagination = ref({
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    })
    const view = ref('list')
    const filter = ref('')
    const rows = ref([])
    const loading = ref(false)
    const id = ref(null)
    const name = ref(null)
    const image = ref(null)
    const imageBase64 = ref(null)
    const image_path = ref(null)

    const getImageSrc = (image) => {
      imageBase64.value = null
      const reader = new FileReader();
      reader.onload = function (e) {
        imageBase64.value = {
          base64: e.target.result,
          name: image.name
        }
      };
      reader.readAsDataURL(image)
    }

    const getMediaBackend = () => {
      return constants.STORAGE_BACKEND_URL
    }

    const onSubmit = () => {
      let categoryFormData = new FormData();
      categoryFormData.append('name', name.value);
      if(image.value) {
        categoryFormData.append('image', image.value);
      }
      if(image_path.value) {
        categoryFormData.append('image_path', image_path.value);
      }

      if (id.value) {
        // Update
        HTTP.put(`/category/${id.value}`, categoryFormData)
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
            console.log(error)
            $q.notify({
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: error.response && error.response.data ? error.response.data.error : 'An error has occurred'
            })
          })
      } else {
        // Add new
        HTTP.post('/category', categoryFormData)
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
            console.log(error)
            $q.notify({
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: error.response && error.response.data ? error.response.data.error : 'An error has occurred'
            })
          })
      }
    }

    const confirmDelete = (instance) => {
      $q.dialog({
        dark: true,
        title: 'Confirm delete category',
        message: `Would you like delete the category ${instance.name}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
        // Delete category
        HTTP.delete(`/category/${instance.id}`)
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
            console.log(error)
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

    const onReset = () => {
      id.value = null
      name.value = null
      image.value = null
      imageBase64.value = null
      image_path.value = null
    }

    const onRequest = () => {
      HTTP.post('/search/category', {})
        .then(response => {
          loading.value = true
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

    const editOrViewCategory = (instance) => {
      id.value = instance.id
      name.value = instance.name
      image_path.value = instance.image_path
      image.value = null
      imageBase64.value = null
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
      id,
      name,
      image,
      imageBase64,
      image_path,

      getImageSrc,
      getMediaBackend,
      onSubmit,
      onReset,
      onRequest,
      editOrViewCategory,
      confirmDelete,
      capitalize

    }
  }
}
</script>
