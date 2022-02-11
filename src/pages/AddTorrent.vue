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
            <div class="col-12 col-sm-6 q-pl-sm">
              <q-input dark standout v-model="name" label="Torrent name *" color="dark"
                       lazy-rules class="q-mb-md"
                       :rules="[ val => val && val.length > 0 || 'Please type something']"
              >
                <template v-slot:hint>
                  Use descriptive names
                </template>
              </q-input>

              <q-select dark standout bottom-slots v-model="categoriesSelected[index]"
                        @update:model-value="val => insertCategory(val)"
                        :options="getCategoryList()" option-label="name" v-for="(item, index) in categoriesSelected"
                        :key="index" :label="'Category' + (index === 0 ? ' *':'')" class="q-mb-md">
                <template v-slot:append v-if="categoriesSelected[index] != null">
                  <q-icon name="close" @click.stop="deleteCategory(categoriesSelected[index])" class="cursor-pointer"/>
                </template>
                <template v-slot:after>
                  <q-avatar v-if="item && item.image_path">
                    <img src="https://cdn.quasar.dev/img/avatar5.jpg">
                  </q-avatar>
                </template>
                <template v-slot:hint>
                  <p v-if="index === 0">Select <b>principal</b> category</p>
                  <p v-else><b>Optional.</b> Select a category</p>
                </template>
              </q-select>

              <q-input dark standout type="url" v-model="url" label="Url"
                       color="dark" class="q-mb-md" bottom-slots
              >
                <template v-slot:hint>
                  <b>Optional.</b> Link for more information
                </template>
              </q-input>

              <q-input dark standout v-model="description" label="Description"
                       type="textarea" class="q-mb-md" bottom-slots
              >
                <template v-slot:hint>
                  HTML/BB code is <b>not</b> alowed
                </template>
              </q-input>

              <q-file @update:model-value="val => { torrent_file = val[0] }"
                      dark standout type="file" label="Torrent file *" hint=""
                      accept="application/x-bittorrent" class="q-mb-md"
              />

            </div>

            <div class="col-12 col-sm-6 q-pl-sm">
              <q-file name="cover_images" v-model="torrentImages" accept="image/*"
                      dark standout multiple use-chips append label="Select Torrent Images"
                      bottom-slots @update:model-value="val => getImageSrc(val)"
              >
                <template v-slot:hint>
                  First image will be the <b>principal</b> cover
                </template>
              </q-file>

              <!-- Image gallery -->
              <div class="row q-mt-sm">
                <div class="col-6 col-sm-4 q-pa-sm" v-for="(image, index) in torrentImagesBase64" :key="index">
                  <q-card>
                    <q-img :src="image.base64">
                      <div class="absolute-bottom text-subtitle2 text-center">
                        {{ image.name }}
                      </div>
                      <q-icon class="absolute all-pointer-events" size="32px"
                              name="close" color="red" style="top: 8px; right: 8px"
                              @click="deleteImge(image)">
                        <q-tooltip>
                          Delete
                        </q-tooltip>
                      </q-icon>
                    </q-img>
                  </q-card>
                </div>
              </div>

            </div>

          </div>
          <div class="row">
            <div class="col">
              <q-toggle dark v-model="accept" label="I accept responsibility for the publication of this file o files"/>
              <div class="text-center">
                <q-btn label="Submit" type="submit" color="dark" text-color="amber" :disable="!accept"/>
                <q-btn label="Reset" type="reset" flat class="q-ml-sm" color="dark" text-color="amber"/>
              </div>
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

    const name = ref(null)
    const url = ref(null)
    const description = ref(null)
    const torrent_file = ref(null)
    const accept = ref(false)
    const announce = ref('')
    const categories = ref([])
    const categoriesSelected = ref([null])
    const torrentImages = ref([])
    const torrentImagesBase64 = ref([])

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

      HTTP.get('/category')
        .then(response => {
          categories.value = response.data.items
        })
        .catch(error => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Categories not obtained'
          })
        })
    }

    onMounted(() => {
      get_announce()
    })

    return {
      announce,
      name,
      url,
      description,
      torrent_file,
      accept,
      categoriesSelected,
      torrentImages,
      torrentImagesBase64,

      onSubmit() {
        if (accept.value !== true) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'You need to accept the license and terms first'
          })
        } else {
          //TODO: validate before processing

          let torrentFormData = new FormData();
          torrentFormData.append('name', name.value);
          categoriesSelected.value.forEach(value => {
            torrentFormData.append('categories[]', value);
          })
          torrentFormData.append('url', url.value);
          torrentFormData.append('description', description.value);
          torrentFormData.append('torrent_file', torrent_file.value);
          torrentImages.value.forEach(value => {
            torrentFormData.append('torrent_images[]', value);
          })

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
        categoriesSelected.value = [null]
        torrentImages.value = []
        torrentImagesBase64.value = []
      },
      getCategoryList() {
        let selected = categoriesSelected.value.filter(x => x != null)
        selected = selected.map(x => x.name)
        return categories.value.filter(x => !selected.includes(x.name))
      },
      insertCategory() {
        if (categoriesSelected.value.length < categories.value.length) {
          categoriesSelected.value.push(null)
        }
      },
      deleteCategory(category) {
        categoriesSelected.value = categoriesSelected.value.filter(x => (x == null || x.name !== category.name))
      },
      getImageSrc(images) {
        torrentImagesBase64.value = []
        images.forEach(image => {
          const reader = new FileReader();
          reader.onload = function (e) {
            torrentImagesBase64.value.push({
              base64: e.target.result,
              name: image.name
            })
          };
          reader.readAsDataURL(image)
        })
      },
      deleteImge(image) {
        torrentImages.value = torrentImages.value.filter(x => x.name !== image.name)
        this.getImageSrc(torrentImages.value)
      }
    }
  }
}
</script>

