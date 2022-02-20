import {LocalStorage} from 'quasar'

import {HTTP} from './http'
import constants from "./constants";

const getUserData = () => {
  let access_token = LocalStorage.getItem('accessToken')
  if (!access_token)
    return undefined
  return JSON.parse(atob(access_token.split('.')[1]))
}

const auth = {
  login(username, password) {
    let userData = {username: username, password: password}
    return HTTP.post(constants.AUTH_URL, userData)
      .then(response => {
        LocalStorage.set('accessToken', response.data.access_token);
        HTTP.defaults.headers.common.Authorization = 'Bearer ' + LocalStorage.getItem('accessToken')
        // return username
      }).catch(error => {
        if (error && error.response) {
          // Lets try to improve error messages to present them to the user
          switch (error.response.status) {
            case 400:
              return Promise.reject({
                message: error.response.data ? error.response.data.error : 'Enter both data, username and password'
              })
            case 401:
              return Promise.reject({
                message: error.response.data ? error.response.data.error : 'Incorrect username and/or password'
              })
            default:
              return Promise.reject(error)
          }
        } else {
          return Promise.reject(error)
        }
      })
  },

  logout() {
    return HTTP.delete(constants.LOGOUT_URL)
      .then(response => {
        LocalStorage.clear()
        return Promise.resolve(response.data)
      })
      .catch(error => {
        return Promise.reject({
          message: error.response.data ? error.response.data.error : 'An error has occurred'
        })
      })
  },

  checkPermissions(permission) {
    let user_claims = getUserData()?.user_claims
    let permissions = user_claims?.permissions
    return permissions.includes(permission)
  },

  getRol() {
    let user_claims = getUserData()?.user_claims
    return user_claims?.rol
  },

  getUsername() {
    let user_data = getUserData()
    return user_data?.identity
  },

  isAuth() {
    return !!getUserData()
  }
}

export default auth
