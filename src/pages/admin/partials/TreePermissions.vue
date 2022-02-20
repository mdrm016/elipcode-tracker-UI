<template>
  <div class="q-pa-md row q-col-gutter-sm">
    <q-tree class="col"
            :nodes="nodes"
            v-model:selected="selected"
            v-model:ticked="ticked"
            v-model:expanded="expanded"
            node-key="label"
            :tick-strategy="strategy"
            default-expand-all
            dark
            color="amber"
            dense
    />

  </div>
</template>

<script>
import {onMounted, ref, watch} from 'vue'

export default {
  name: 'TreePermissions',
  props: {
    nodes: {
      type: Array,
      default: () => [],
      required: true
    },
    strategy: {
      type: String,
      default: 'leaf'
    }
  },
  emits: ["selected"],
  setup(props, context) {

    const selected = ref([])
    const ticked = ref([])
    const expanded = ref([])
    const tickStrategy = ref('strict')

    watch(() => [...ticked.value], (currentValue, oldValue) => {
      context.emit('selected', currentValue);
    }, {deep: true})

    const clearTicked = () => {
      ticked.value = []
    }

    const setTickedComponent = (tickedArr) => {
      ticked.value = tickedArr
    }

    onMounted(() => {
      let qtree = document.getElementsByClassName('q-tree')[0]
      qtree.classList.add('row')
      let qtreeNode = qtree.getElementsByClassName('q-tree__node--parent')
      Array.from(qtreeNode).forEach(value => {
        value.classList.add('q-ma-xs')
      })
    })

    return {
      selected,
      ticked,
      expanded,
      tickStrategy,

      clearTicked,
      setTickedComponent

    }
  }
}
</script>

