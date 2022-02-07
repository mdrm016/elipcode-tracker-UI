<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'30%'}">
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
              <q-input
                v-model.trim="username"
                label="Username"
                color="dark"
                required
                autofocus
              />

              <q-input
                type="password"
                v-model="password"
                label="Password"
                color="dark"
                required
              />

              <div>
                <q-btn type="submit" :loading="loginIn" label="Login" color="dark" text-color="amber"/>
                <p class="float-right">
                  If you don't have an account, go to <router-link to="/register" class="text-app-color-primary">Register</router-link>
                </p>
              </div>
            </q-form>

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

          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import auth from '../auth'
import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: 'Login',
  data() {
    return {
      username: '', //ref('Pratik'),
      password: '', //ref('12345')
      error: false,
      errorMessage: null,
      loginIn: false
    }
  },
  methods: {
    login () {
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
