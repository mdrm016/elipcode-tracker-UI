<template>
  <q-header elevated>
    <q-toolbar class="bg-black text-amber-14">

      <q-btn stretch flat label="Elipcode Tracker" to="/"/>

      <q-separator dark vertical/>

      <q-btn stretch flat label="Admin Panel" to="/admin_panel"/>

      <q-separator dark vertical/>

      <q-btn-dropdown stretch flat label="Torrents">
        <q-list>
          <q-item clickable v-close-popup tabindex="0" to="/addtorrent">
            <q-item-section avatar>
              <q-avatar icon="cloud_upload" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Add torrent</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/torrentlist">
            <q-item-section avatar>
              <q-avatar icon="list" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Torrent List</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/torrentbrowse">
            <q-item-section avatar>
              <q-avatar icon="search" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Browse</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

      </q-btn-dropdown>

      <q-separator dark vertical/>

      <q-btn stretch flat label="Forum" to="/forum"/>

      <q-separator dark vertical/>

      <div class="q-ml-md q-mr-md navbar-item">
        <div class="text-body2 text-white text-center text-weight-light">UL: {{formatBytes(userStatistics.uploaded)}}</div>
        <div class="text-body2 text-white text-center text-weight-light">DL: {{formatBytes(userStatistics.downloaded)}}</div>
      </div>

<!--      <q-separator dark vertical/>-->

      <div class="q-ml-md q-mr-md navbar-item">
        <div class="text-body2 text-white text-center text-weight-light navbar-option" @click="redirectTo('/profile')">
          <q-icon name="north" color="green" size="sm" style="font-weight: bold"/> {{userStatistics.downloads}}
          &nbsp;
          <q-icon name="south" color="red" size="sm" style="font-weight: bold"/> {{userStatistics.uploads}}
        </div>
      </div>

      <div class="q-ml-md q-mr-md navbar-item">
        <div class="text-body2 text-white text-center text-weight-light navbar-option">
          Ratio: {{ userStatistics.downloaded !== 0 ? (userStatistics.uploaded/userStatistics.downloaded) : '&infin;' }}
        </div>
        <div class="text-body2 text-white text-center text-weight-light navbar-option">Bonus: {{userStatistics.seed_bonus}}</div>
      </div>

      <q-space/>

      <q-btn-dropdown stretch flat :label="username" style="background: none">
        <q-list color="dark">

          <q-item clickable v-close-popup tabindex="0" to="/profile">
            <q-item-section avatar>
              <q-avatar icon="account_circle" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Profile</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/messages">
            <q-item-section avatar>
              <q-avatar icon="message" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Messages</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/mytorrents">
            <q-item-section avatar>
              <q-avatar icon="folder_open" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">My Torrents</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset spaced/>

          <q-item clickable v-close-popup tabindex="0" @click.prevent="logout">
            <q-item-section avatar>
              <q-avatar icon="exit_to_app" color="dark" text-color="amber"/>
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
              <q-avatar icon="done" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">Rules</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/perfil">
            <q-item-section avatar>
              <q-avatar icon="info" color="dark" text-color="amber"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="menu-item-style">FAQ</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup tabindex="0" to="/perfil">
            <q-item-section avatar>
              <q-avatar icon="textsms" color="dark" text-color="amber"/>
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
</template>

<script>
import {LocalStorage, useQuasar} from "quasar";
import auth from "src/auth";
import {useRouter} from "vue-router";
import {HTTP} from "src/http";
import {onMounted, ref} from "vue";
import {formatBytes} from "src/utils";

export default {
  name: 'NavbarComponent',
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const userStatistics = ref({})

    const logout = () => {
      auth.logout()
        // .then(response => {
        //   this.$router.push({path: '/login'})
        // })
        // .catch(error => {
        //   console.log(error)
        //   this.error = true
        //   this.errorMessage = error
        // })
      router.push({path: '/login'})
    }

    const redirectTo = (path) => {
      router.push(path)
    }

    const onRequest = () => {
      HTTP.get('/user/statistics').then(response => {
        userStatistics.value = response.data
        // console.log(userStatistics.value)
      })
    }

    onMounted(() => {
      onRequest()
    })

    return {
      username: LocalStorage.getItem('currentUser'),
      userStatistics,

      logout,
      redirectTo,
      formatBytes
    }
  }
}
</script>

<style>
.q-menu {
  background: #141414;
}

.navbar-option:hover {
  color: #ffc107 !important;
  cursor: pointer;
}

@media screen and (max-width: 1060px) {
  .navbar-item {
    display: none !important;
  }
}
</style>
