const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {path: "", component: () => import("pages/Index.vue")},
      {path: "addtorrent", component: () => import("pages/AddTorrent.vue")},
      {path: "torrentlist", component: () => import("pages/TorrentList.vue")},
      {path: "torrentview", component: () => import("pages/TorrentView.vue")},
      {path: "torrentbrowse", component: () => import("pages/TorrentBrowse.vue")},
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
    component: () => import('layouts/MainLayout.vue'),
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
          {path: '', component: () => import('pages/admin/AdminDashboard.vue')},
          {path: 'category', component: () => import('pages/admin/Category.vue')},
          {path: 'roles_permissions', component: () => import('pages/admin/RolesPermissions.vue')},
          {path: 'users', component: () => import('pages/admin/Users.vue')},
          {path: 'forum', component: () => import('pages/admin/Forum.vue')},
          {path: 'helpdesk', component: () => import('pages/admin/Helpdesk.vue')},
          {path: 'torrents', component: () => import('pages/admin/Torrents.vue')},
          {path: 'signup_invitations', component: () => import('pages/admin/SignUpInvitations.vue')},
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
