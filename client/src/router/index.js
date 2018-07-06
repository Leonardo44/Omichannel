import Vue from 'vue'
import Router from 'vue-router'

import Hello from '@/components/Hello'
import addpost from '@/components/AddPost'
import editpost from '@/components/EditPost'

/**
 * Report Components
 */
import avgmsgtickets from '@/components/reports/AvgMsgTickets.vue'
import ticketsinterface from '@/components/reports/TicketsInterface.vue'
import clienttickets from '@/components/reports/ClientTickets.vue'
import avgticketstimeinterface from '@/components/reports/AvgTicketsTimeInterface.vue'
// -----------------------------------------------------------------------------

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Hello,
      props: true
    },
    {
      path: '/reports/accounts/tickets_interface',
      name: 'reports_tickets_interface',
      component: ticketsinterface,
      props: true
    },
    {
      path: '/reports/accounts/avg_msg_tickets',
      name: 'reports_avg_msg_tickets',
      component: avgmsgtickets,
      props: true
    },
    {
      path: '/reports/accounts/client_tickets',
      name: 'reports_client_tickets',
      component: clienttickets,
      props: true
    },
    {
      path: '/reports/accounts/avg_tickets_time_interface',
      name: 'avg_tickets_time_interface',
      component: avgticketstimeinterface,
      props: true
    },
    {
      path: '/posts/add',
      name: 'addpost',
      component: addpost
    },
    {
      path: '/posts/:id/edit',
      name: 'editpost',
      component: editpost
    }
  ]
})
