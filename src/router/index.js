import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import constants from "../constants"
import auth from "src/auth";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const excludePaths = [
  constants.AUTH_URL,
  "/register"
]

export default route(function (/* { store, ssrContext } */) {

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach((to, from, next) => {
    let allowedToEnter = true
    to.matched.some((record) => {

      let userIsAuth = auth.isAuth()

      // get the meta object
      if ('meta' in record) {
        let meta = record.meta

        // check if user needs to be logged in to access this page
        if ('requiresAuth' in meta) {
          let requiresAuth = meta.requiresAuth
          if(requiresAuth && !userIsAuth) {
            allowedToEnter = false
            next(constants.AUTH_URL)
          }
        }

        //check if user has correct rol to access this page
        if ('roles' in meta) {
          let roles = meta.roles
          let userRol = auth.getRol()
          if(!roles.includes(userRol)) {
            allowedToEnter = false
            next("/not_allowed")
          }
        }
      } else {
        // Check auth user
        if(!userIsAuth) {
          allowedToEnter = false
          next(constants.AUTH_URL)
        }
      }

    })

    // Check if allow continue
    if(allowedToEnter) {
      next()
    }

  })

  return Router;
});
