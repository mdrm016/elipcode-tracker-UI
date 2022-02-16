<template>

  <q-drawer show-if-above v-model="drawer" class="bg-grey-navbar">
    <q-list dark separator>
      <q-item-label class="item-label-dark">
        Administration Panel
      </q-item-label>

      <AdminSidebarComponent
        v-for="link in navbarOptions"
        :key="link.title"
        v-bind="link"
      />
    </q-list>
  </q-drawer>

  <router-view/>
</template>

<script>
import {ref, watch} from 'vue'
import AdminSidebarComponent from "components/AdminSidebarComponent";
import {useRoute} from "vue-router";

const linksList = [
  {
    title: "Dashboard",
    caption: "General preview",
    icon: "dashboard",
    link: "/admin_panel",
    active: false
  },
  {
    title: "Category",
    caption: "Create, modify or delete a category",
    icon: "extension",
    link: "/admin_panel/category",
    active: false
  },
  {
    title: "Roles & Permissions",
    caption: "Edit roles and permissions",
    icon: "security",
    link: "/admin_panel/roles_permissions",
    active: false
  },
  {
    title: "Users",
    caption: "View and edit user configurations",
    icon: "people",
    link: "/admin_panel/users",
    active: false
  },
  {
    title: "Forum",
    caption: "Edit forums options",
    icon: "message",
    link: "/admin_panel/forum",
    active: false
  },
  {
    title: "HelpDesk",
    caption: "View and response user's messages",
    icon: "public",
    link: "/admin_panel/helpdesk",
    active: false
  },
  {
    title: "Torrents",
    caption: "Edit options of torrents",
    icon: "attach_file",
    link: "/admin_panel/torrents",
    active: false
  },
  {
    title: "Sign Up and invitations",
    caption: "Open Sign Up and generate link invitations",
    icon: "share",
    link: "/admin_panel/signup_invitations",
    active: false
  },
];

export default {
  name: 'AdminLayout',
  components: {
    AdminSidebarComponent
  },
  setup() {
    const route = useRoute()

    const drawer = ref(true)
    const navbarOptions = ref(linksList)

    watch(route, (to) => {
      navbarOptions.value.forEach(link => {
        link.active = link.link === to.path
      })
    }, {flush: 'pre', immediate: true, deep: true})

    return {
      drawer,
      navbarOptions
    }
  }
}
</script>
