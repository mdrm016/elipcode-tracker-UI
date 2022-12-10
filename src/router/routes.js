const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "", component: () => import("pages/Index.vue"),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "addtorrent", component: () => import("pages/AddTorrent.vue"),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "torrentlist", component: () => import("pages/TorrentList.vue"),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "torrentview", component: () => import("pages/TorrentView.vue"),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "torrentbrowse", component: () => import("pages/TorrentBrowse.vue"),
        meta: {
          requiresAuth: true
        }
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/DefaultLayout.vue'),
    children: [
      {path: '', component: () => import('pages/Login.vue')}
    ]
  },
  {
    path: '/register',
    component: () => import('layouts/DefaultLayout.vue'),
    children: [
      {path: '', component: () => import('pages/Register.vue')}
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'admin_panel',
        component: () => import('layouts/AdminLayout.vue'),
        children: [
          {
            path: '', component: () => import('pages/admin/AdminDashboard.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'category', component: () => import('pages/admin/Category.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'roles_permissions', component: () => import('pages/admin/RolesPermissions.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'users', component: () => import('pages/admin/Users.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'forum', component: () => import('pages/admin/Forum.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'helpdesk', component: () => import('pages/admin/Helpdesk.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'torrents', component: () => import('pages/admin/Torrents.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
          {
            path: 'signup_invitations', component: () => import('pages/admin/SignUpInvitations.vue'),
            meta: {
              requiresAuth: true,
              roles: ['admin', 'moderator']
            }
          },
        ]
      }
    ]
  },
  {
    path: "/not_allowed",
    component: () => import("pages/NotAllowed.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
