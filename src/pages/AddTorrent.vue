<template>
  <q-page>

    <div class="q-pa-md">

      <div class="column items-center">
        <q-card class="form-size-responsive" dark>
          <q-card-section>
            <div class="text-h6 text-app-color-primary">Upload a torrent</div>
          </q-card-section>

          <q-separator color="grey-5" inset/>

          <q-card-section>
            <div class="text-subtitle1">
              When you create the torrent, don't leave the tracker URL section blank, if you don't know what to put, add
              the following:
              <b class="text-subtitle2 text-app-color-primary">{{ announce }}</b>
            </div>

            <div class="text-subtitle2">
              Once the torrent is uploaded, re-download it and re-seed the files.
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
                <div class="col">
<!--                  Name -->
                  <q-input dark standout v-model="name" label="Torrent name *" color="dark"
                           lazy-rules class="q-mb-md"
                           :rules="[ val => val && val.length > 0 || 'Please type something']"
                  >
                    <template v-slot:hint>
                      Use descriptive names
                    </template>
                  </q-input>

                  <!--Categories-->
                  <q-select dark standout bottom-slots v-model="categoriesSelected[index]"
                            :options="getCategoryList()" option-label="name" v-for="(item, index) in categoriesSelected"
                            :key="index" :label="'Category' + (index === 0 ? ' *':'')" class="q-mb-md" color="dark">
                    <template v-slot:append v-if="categoriesSelected[index] != null">
                      <q-icon name="close" @click.stop="deleteCategory(categoriesSelected[index])" class="cursor-pointer"/>
                    </template>
                    <template v-slot:after>
                      <q-img v-if="item && item.image_path" :src="`${getMediaBackend()}/${item.image_path}`"
                             class="rounded-borders" style="min-width: 100px; height: 75px;"/>
                    </template>
                    <template v-slot:hint>
                      <p v-if="index === 0">Select <b>principal</b> category</p>
                      <p v-else><b>Optional.</b> Select a subcategory</p>
                    </template>
                  </q-select>

                  <!--Torrent Images-->
                  <q-file name="cover_images" v-model="torrentImages" accept="image/*"
                          dark color="dark" standout multiple use-chips append label="Select Torrent Images"
                          bottom-slots @update:model-value="val => getImageSrc(val)"
                  >
                    <template v-slot:hint>
                      First image will be the <b>principal</b> cover
                    </template>
                  </q-file>

                  <!--Images preview-->
                  <masonry-wall class="q-mt-md q-mb-md" v-if="switchMansonry" :items="torrentImagesBase64" :ssr-columns="1"
                                :column-width="150" :gap="10">
                    <template #default="{ item }">
                      <q-img :src="`${item.base64}`">
                        <div class="absolute-bottom text-caption text-center">
                          {{ item.name }}
                        </div>
                        <q-icon class="absolute all-pointer-events" size="32px"
                                name="close" color="red" style="top: 8px; right: 8px"
                                @click="deleteImage(item)">
                          <q-tooltip>
                            Delete
                          </q-tooltip>
                        </q-icon>
                      </q-img>
                    </template>
                  </masonry-wall>

                  <!--URL-->
                  <q-input dark standout type="url" v-model="url" label="Url"
                           color="dark" class="q-mb-md" bottom-slots
                  >
                    <template v-slot:hint>
                      <b>Optional.</b> Link for more information
                    </template>
                  </q-input>

                  <!--Description-->
                  <q-input dark standout v-model="description" label="Description"
                           type="textarea" class="q-mb-md" bottom-slots color="dark"
                  >
                    <template v-slot:hint>
                      HTML/BB code is <b>not</b> alowed
                    </template>
                  </q-input>

                  <!--Torrent File-->
                  <q-file dark standout v-model="torrent_file" label="Torrent file *"
                          accept="application/x-bittorrent" class="q-mb-md" color="dark"
                  />

                </div>

              </div>
              <div class="row">
                <div class="col text-center">
                  <q-toggle dark v-model="accept"
                            label="I accept responsibility for the publication of this torrent and the files contains"/>
                  <div class="text-center">
                    <q-btn label="Submit" type="submit" color="dark" text-color="amber" :disable="!accept"
                           :loading="loading"/>
                    <q-btn label="Reset" type="reset" flat class="q-ml-sm" color="dark" text-color="amber"/>
                  </div>
                </div>
              </div>

            </q-form>
          </q-card-section>

        </q-card>
      </div>
    </div>

  </q-page>

</template>

<script>
import {useQuasar} from 'quasar'
import {onMounted, ref, watch} from 'vue'
import {HTTP} from "src/http";
import {useRouter} from "vue-router";
import MasonryWall from "@yeger/vue-masonry-wall";
import {getMediaBackend} from "src/utils";

export default {
  components: {
    MasonryWall
  },
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
    const loading = ref(false)
    const switchMansonry = ref(true)

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

    const insertCategory = () => {  //Limmited to 5 categories
      if (categoriesSelected.value.length < categories.value.length &&
        categoriesSelected.value.at(-1) != null && categoriesSelected.value.length <= 4) {
        categoriesSelected.value.push(null)
      }
    }

    onMounted(() => {
      get_announce()
    })

    watch(() => [...categoriesSelected.value], (currentValue, oldValue) => {
      insertCategory()
    }, {deep: true})

    watch(() => [...torrentImagesBase64.value], (currentValue, oldValue) => {
      switchMansonry.value = false
      setTimeout(() => switchMansonry.value = true)
    }, {deep: true})

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
      loading,
      switchMansonry,

      getMediaBackend,

      onSubmit() {
        if (accept.value !== true) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'You need to accept the license and terms first'
          })
        } else {
          // Processing data
          let categories = categoriesSelected.value.filter(x => x != null) // Delete nulls

          let torrentFormData = new FormData();
          torrentFormData.append('name', name.value);
          torrentFormData.append('categories', JSON.stringify(categories));
          torrentFormData.append('url', url.value);
          torrentFormData.append('description', description.value);
          torrentFormData.append('torrent_file', torrent_file.value);
          torrentImages.value.forEach(value => {
            torrentFormData.append('torrent_images[]', value);
          })

          loading.value = true
          HTTP.post('/torrents', torrentFormData)
            .then(response => {
              // return to page view
              router.push({path: '/torrentview', query: {id: response.data.id}})
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
                message: error.response.data ? error.response.data.error : 'An error has occurred'
              })
            }).finally(() => {
            loading.value = false
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
      deleteImage(image) {
        let idx = torrentImages.value.findIndex(x => x.name === image.name)
        torrentImages.value.splice(idx, 1)
        torrentImagesBase64.value.splice(idx, 1)
      }
    }
  }
}
</script>


