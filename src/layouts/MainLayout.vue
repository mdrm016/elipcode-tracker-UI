<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-black text-amber-14">
<!--        <q-btn-->
<!--          flat-->
<!--          dense-->
<!--          round-->
<!--          icon="menu"-->
<!--          aria-label="Menu"-->
<!--          @click="toggleLeftDrawer"-->
<!--        />-->

<!--        <q-toolbar-title style="flex: none"> Elipcode Tracker </q-toolbar-title>-->

<!--        <q-separator dark vertical inset />-->
        <q-btn stretch flat label="Elipcode Tracker" to="/" />

        <q-separator dark vertical />

        <q-btn-dropdown stretch flat label="Torrents">
          <q-list>
            <q-item clickable v-close-popup tabindex="0" to="/addtorrent">
              <q-item-section avatar>
                <q-avatar icon="cloud_upload" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Add torrent</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/torrentlist">
              <q-item-section avatar>
                <q-avatar icon="list" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Torrent List</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/search">
              <q-item-section avatar>
                <q-avatar icon="search" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Search</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

        </q-btn-dropdown>

        <q-separator dark vertical />

        <q-btn stretch flat label="Forum" to="/forum"/>

        <q-space />

        <q-btn-dropdown stretch flat :label="username" style="background: none">
          <q-list color="dark">

            <q-item clickable v-close-popup tabindex="0" to="/perfil">
              <q-item-section avatar>
                <q-avatar icon="account_circle" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/messages">
              <q-item-section avatar>
                <q-avatar icon="message" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Messages</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/mytorrents">
              <q-item-section avatar>
                <q-avatar icon="folder_open" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">My Torrents</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator inset spaced />

            <q-item clickable v-close-popup tabindex="0" @click.prevent="logout">
              <q-item-section avatar>
                <q-avatar icon="exit_to_app" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Exit</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

        </q-btn-dropdown>

        <q-btn-dropdown stretch flat label="Support" style="background: none">
          <q-list color="dark">

            <q-item clickable v-close-popup tabindex="0" to="/perfil">
              <q-item-section avatar>
                <q-avatar icon="done" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Rules</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/perfil">
              <q-item-section avatar>
                <q-avatar icon="info" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">FAQ</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup tabindex="0" to="/perfil">
              <q-item-section avatar>
                <q-avatar icon="textsms" color="dark" text-color="amber" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="menu-item-style">Helpdesk</q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </q-btn-dropdown>

<!--        <div>Quasar v{{ $q.version }}</div>-->
      </q-toolbar>
    </q-header>

<!--    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>-->
<!--      <q-list>-->
<!--        <q-item-label header> Essential Links </q-item-label>-->

<!--        <EssentialLink-->
<!--          v-for="link in essentialLinks"-->
<!--          :key="link.title"-->
<!--          v-bind="link"-->
<!--        />-->
<!--      </q-list>-->
<!--    </q-drawer>-->

    <q-page-container class="app-style bg-grey-10 text-white">
      <router-view />

      <q-dialog
        v-model="error">
        <q-card style="width: 300px">
          <q-card-section>
            <div class="text-h6">Attention</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{errorMessage}}
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="OK" text-color="amber" v-close-popup></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];

import { defineComponent, ref } from "vue";
import {LocalStorage} from 'quasar'
import auth from '../auth'

export default defineComponent({
  name: "MainLayout",

  components: {
    // EssentialLink,
  },
  data() {
    return {
      error: false,
      errorMessage: null,
    }
  },
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      username: LocalStorage.getItem('currentUser')
    };
  },
  methods: {
    logout() {
      auth.logout()
        .then(response => {
          console.log(response)
          this.$router.push({path: '/login'})
      })
      .catch(error => {
        console.log(error)
        this.error = true
        this.errorMessage = error
      })
    }
  }
});
</script>

<style>
.q-menu {
  background: #212121;
}
</style>
