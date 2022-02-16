<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'30%'}" dark>
          <q-card-section>
            <q-avatar size="103px" class="absolute-center shadow-10">
              <img src="profile.svg">
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">
                Log In
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form
              class="q-gutter-md"
              v-on:submit.prevent="login()"
            >
              <q-input dark standout v-model.trim="username" label="Username"
                       color="dark" required autofocus maxlength="30"/>

              <q-input dark standout type="password" v-model="password" label="Password"
                       color="dark" required maxlength="15"/>

              <div>
                <q-btn type="submit" :loading="loginIn" label="Login" color="dark" text-color="amber"/>
                <p class="float-right">
                  If you don't have an account, go to
                  <router-link to="/register" class="text-app-color-primary">Register</router-link>
                </p>
              </div>
            </q-form>

            <DialogComponent :active="error" :title="'Attention'" :message="errorMessage" @onHide="error=false"></DialogComponent>

          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import auth from '../auth'
import {defineComponent, ref} from 'vue'
import DialogComponent from "components/DialogComponent";

export default defineComponent({
  name: 'Login',
  components: {
    DialogComponent
  },
  data() {
    return {
      username: '',
      password: '',
      error: false,
      errorMessage: null,
      loginIn: false
    }
  },
  methods: {
    login() {
      this.loginIn = true
      auth.login(this.username, this.password).then(username => {
        this.$router.push({path: '/'})
        this.username = username
      }).catch(error => {
        this.error = true
        this.errorMessage = error.message
      }).finally(() => {
        this.loginIn = false
      })
    }
  }
})
</script>

<style>

</style>
