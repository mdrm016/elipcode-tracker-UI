<template>
  <q-page padding>
    <!-- content -->

    <!--    Tabs-->
    <div class="q-pa-md">
      <div class="q-gutter-y-md">
        <q-card dark>
          <q-tabs
            v-model="tab"
            dense
            active-color="amber"
            indicator-color="amber"
            align="justify"
            narrow-indicator
            color="amber"
            text-color="dark"
          >
            <q-tab name="roles" label="Roles"/>
            <q-tab name="permissions" label="Permissions"/>
          </q-tabs>

          <q-separator/>

          <q-tab-panels v-model="tab" animated class="bg-grey-10">

            <!--Rol Panel-->
            <q-tab-panel name="roles">
              <RolTab></RolTab>
            </q-tab-panel>

            <!--Permissions Panles-->
            <q-tab-panel name="permissions">
              <PermissionTab></PermissionTab>
            </q-tab-panel>

          </q-tab-panels>
        </q-card>

      </div>
    </div>

  </q-page>
</template>

<script>
import {useQuasar} from "quasar";
import {ref} from "vue";
import RolTab from "pages/admin/partials/RolTab";
import PermissionTab from "pages/admin/partials/PermissionTab";

export default {
  name: 'RolesPermissions',
  components: {
    RolTab,
    PermissionTab
  },
  setup() {
    const $q = useQuasar()

    const tab = ref('roles')

    return {
      tab,

    }
  }
}
</script>
