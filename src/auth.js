import {LocalStorage} from 'quasar'

import {HTTP} from './http'
import constants from "./constants";

const auth = {
  currentUser: undefined,
  //TODO: Store this in the access_token and use it from there
  challenge: undefined,
  accessToken: undefined,
  payload: undefined,

  login(username, password) {
    return HTTP.post(constants.AUTH_URL, { username: username, password: password }).then(response => {
      LocalStorage.set('currentUser', username);
      LocalStorage.set('challenge', password);
      LocalStorage.set('accessToken', response.data.access_token);
      LocalStorage.set('payload', JSON.parse(atob(LocalStorage.getItem('accessToken').split('.')[1])));
      HTTP.defaults.headers.common.Authorization = 'Bearer ' + LocalStorage.getItem('accessToken')
      return username
    }).catch(error => {
      if(error && error.response) {
        console.log(error.response.data.error)
        // Lets try to improve error messages to present them to the user
        switch(error.response.status) {
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

  }
}

export default auth
