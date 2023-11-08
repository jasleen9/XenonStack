import { login_page, register_page } from "./components/auth.js"
import {admin_dashboard} from "./components/admin/admin_dashboard.js"
import { admin_common } from "./components/common.js";
import { add_theatre } from "./components/admin/add_theatre.js";
import { edit_theatre } from "./components/admin/edit_theatre.js";
import { add_show } from "./components/admin/add_show.js";
import { edit_show } from "./components/admin/edit_show.js";
import { user_bookings } from "./components/user/user_booking_page.js";
import { user_dashboard } from "./components/user/user_dashboard.js";
import { book_show } from "./components/user/book_show.js";
import { user_common } from "./components/common.js";


const routes = [
  {
    path: '/',
    //redirect: '/login' // Redirect to login page by default
  },
  {
    path: '/admin',
    component: admin_common,
    children: [
      { name: 'admin_home', path: '', component: admin_dashboard },
      { name: 'add_theatre', path: 'add_theatre', component: add_theatre },
      { name: 'edit_theatre', path: 'edit_theatre/:id', component: edit_theatre }, /* :id is theatre id */
      { name: 'add_show', path: 'theatre/:id/add_show', component: add_show }, /* :id is theatre id */
      { name: 'edit_show', path: 'edit_show/:id', component: edit_show }, /* :id is show id */
      
    ]
  },
  {
    path: '/user',
    component: user_common,
    children: [
      { name: 'user_home', path: '', component: user_dashboard },
      { name: 'user_bookings', path: 'bookings', component: user_bookings },
      { name: 'book_show', path: 'book_show/:id', component: book_show }, /* :id is show id */
    ]
  },
  { name: 'login', path: '/login', component: login_page },
  { name: 'register', path: '/register', component: register_page },
  { name: 'relogin', path: '/relogin', component: login_page },
  { name: 'logout', path: '/logout', component: login_page }
];



const router = new VueRouter({
    routes, // short for `routes: routes`
    linkActiveClass: "active",
    linkExactActiveClass: "exact-active",
  })
  

  router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem("token");
    const is_admin = sessionStorage.getItem("is_admin");
    console.log('app.js')
    if (!token) {
      // User is not authenticated (no token)
      if (to.name !== 'login' && to.name !== 'register') {
        next({ name: 'login' });
      } else {
        next();
      }
    } else {
      // User is authenticated (has token)
      if (is_admin === true) {
        // User is an admin
        console.log('app.js')
        if (to.name === 'login' || to.name === 'register') {
          next({ name: 'admin_home' });
        } else {
          next();
        }
      } else {
        // User is not an admin
        if (to.name === 'login' || to.name === 'register') {
          console('user home')
          next({ name: 'user_home' });
        } else {
          next();
        }
      }
    }
  });
  

/* vue app */
const app = new Vue({
    delimiters: ['${', '}'],
    data : {
        "message": "my first app"
    },
    router
  }).$mount('#vapp')