let CONSULTAS_BACKEND_URL
if (process.env.VUE_APP_BACKEND_URL)
  CONSULTAS_BACKEND_URL = process.env.VUE_APP_BACKEND_URL
else
  CONSULTAS_BACKEND_URL = 'http://localhost:5000/api'


export default {
  CONSULTAS_BACKEND_URL: CONSULTAS_BACKEND_URL,
  CONSULTAS_SUBPATH: process.env.VUE_APP_CONSULTAS_SUBPATH,
  AUTH_URL: '/login',
  LOGOUT_URL: '/logout'
}