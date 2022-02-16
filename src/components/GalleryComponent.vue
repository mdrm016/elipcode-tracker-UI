<template>

  <div class="q-mt-lg">
    <masonry-wall v-if="switchMansonry" :items="images" :ssr-columns="1" :column-width="150" :gap="10">
      <template #default="{ item }">
        <q-img :src="`${getMediaBackend()}/${item.path}`">
<!--          <div class="absolute-bottom text-caption text-center">-->
<!--            {{ item.file_name }}-->
<!--          </div>-->
<!--          <q-icon class="absolute all-pointer-events" size="32px"-->
<!--                  name="close" color="red" style="top: 8px; right: 8px"-->
<!--                  @click="deleteImage(item)">-->
<!--            <q-tooltip>-->
<!--              Delete-->
<!--            </q-tooltip>-->
<!--          </q-icon>-->
        </q-img>
      </template>
    </masonry-wall>
  </div>

</template>

<script>
import MasonryWall from '@yeger/vue-masonry-wall'
import {ref, watch} from "vue";
import {getMediaBackend} from "src/utils";

export default {
  name: 'GalleryComponent',
  props: {
    images: {
      type: Array,
      required: true
    }
  },
  components: {
    MasonryWall
  },
  emits: ["delete"],
  setup(props, context) {

    const switchMansonry = ref(true)

    // const deleteImage = (image) => {
    //   context.emit('delete', image);
    // }

    watch(() => props.images, (currentValue, oldValue) => {
      switchMansonry.value = false
      setTimeout(() => switchMansonry.value = true)
    }, {deep: true})

    return {

      switchMansonry,
      getMediaBackend,

      // deleteImage,
    }
  }
}
</script>
