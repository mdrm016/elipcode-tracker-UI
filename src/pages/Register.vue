<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'40%'}">
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">
                Register
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form
              class="q-gutter-md"
              v-on:submit.prevent="register()"
            >
              <q-input
                v-model.trim="newUser.username"
                label="Username"
                color="dark"
                required
                autofocus
              />

              <q-input
                type="password"
                v-model="newUser.password"
                label="Password"
                color="dark"
                required
              />

              <q-input
                type="password"
                v-model="newUser.repeatpassword"
                label="Repeat Password"
                color="dark"
                required
              />

              <q-input
                type="email"
                v-model="newUser.email"
                label="Email"
                color="dark"
                required
              />

              <div>
                <q-btn type="submit" :loading="registering" label="Register" color="dark" text-color="amber"/>
                <p class="float-right">
                  If you have an account, go to <router-link to="/login" class="text-app-color-primary">Login</router-link>
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
import {HTTP} from "src/http";

export default {
  name: 'Register',
  data() {
    return {
      newUser: {
        username: '',
        repeat: '',
        repeatpassword: '',
        email: ''
      },
      registering: false,
      error: false,
      errorMessage: null
    }
  },
  methods: {
    register() {
      // Restricciones
      if(this.newUser.password !== this.newUser.repeatpassword) {
        this.error = true
        this.errorMessage = "Passwords are not the same"
        return
      }
      this.registering = true
      return HTTP.post('/register', this.newUser).then(username => {
        this.$router.push({path: '/'})
        this.username = username
      }).catch(error => {
        this.error = true
        this.errorMessage = error.message
      }).finally(() => {
        this.registering = false
      })
    }
  }
}
</script>
