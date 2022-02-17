<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'40%'}" dark>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">
                Register
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md" v-on:submit.prevent="register()">
              <q-input dark standout v-model.trim="newUser.username" label="Username" ref="usernameRef"
                       color="dark" required autofocus maxlength="30" lazy-rules
                       :rules="[ val => val.length >= 5 || 'Please use minimum 3 characters']"/>

              <q-input dark standout type="password" v-model="newUser.password" label="Password" ref="passwordRef"
                       color="dark" required maxlength="15" lazy-rules
                       :rules="[ val => val.length >= 6 || 'Please use minimum 6 characters']"/>

              <q-input dark standout type="password" v-model="newUser.repeatpassword" label="Repeat Password"
                       ref="repeatPasswordRef"
                       color="dark" required maxlength="15" lazy-rules
                       :rules="[ val => val.length >= 6 || 'Please use minimum 6 characters',
                       val => val === newUser.password || 'Passwords not equals']"/>

              <q-input dark standout type="email" v-model="newUser.email" label="Email"
                       color="dark" required maxlength="30"/>

              <div>
                <q-btn type="submit" :loading="registering" label="Register" color="dark" text-color="amber"/>
                <p class="float-right">
                  If you have an account, go to
                  <router-link to="/login" class="text-app-color-primary">Login</router-link>
                </p>
              </div>
            </q-form>

            <DialogComponent :active="error" :title="'Attention'" :message="errorMessage"
                             @onHide="error=false"></DialogComponent>

          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {HTTP} from "src/http";
import DialogComponent from "components/DialogComponent";
import {Notify} from "quasar";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'Register',
  components: {
    DialogComponent
  },
  data() {
    return {
      newUser: {
        username: '',
        password: '',
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
      if (this.newUser.password !== this.newUser.repeatpassword) {  // Restricciones
        this.error = true
        this.errorMessage = "Passwords are not the same"
      } else {
        this.registering = true
        return HTTP.post('/register', this.newUser).then(username => {
          this.$router.push({path: '/'})
          Notify.create({
            color: 'green-4',
            textColor: 'white',
            icon: 'done',
            message: 'User created'
          })
        }).catch(error => {
          this.error = true
          this.errorMessage = error.message
        }).finally(() => {
          this.registering = false
        })
      }
    }
  }
})
</script>
