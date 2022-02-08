import axios from 'axios'
import constants from './constants'
import auth from "./auth";
import router from "./router";
import {LocalStorage} from "quasar";

export const HTTP = axios.create({
  baseURL: constants.CONSULTAS_BACKEND_URL,
  withCredentials: true
})

HTTP.interceptors.request.use(config => {
  let bearer = 'Bearer ' + LocalStorage.getItem('accessToken')
  config.headers = {
    // adding default header
    Authorization: bearer,
    // spread the request's headers
    ...config.headers,
  };
  return config;
});

//TODO: Need to manage better the re-auth when "Token has expired"
HTTP.interceptors.response.use(async function (response) {
  return response;
}, function (error) {
  if(error.response) {
    console.log(error.response)
    if(error.response.status === 401 && error.response.data && error.response.data.error === 'Token has expired') {
      console.log(error.response.data.error)
      auth.logout();
      router.push(constants.AUTH_URL);
    }
  }
  return Promise.reject(error);
});
