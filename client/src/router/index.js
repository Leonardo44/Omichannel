import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'

/**
 * Componente de Reportes [Cuentas]
 */
import accountAvgMsgPerTicketsPerInterface from '@/components/reports/accounts/AvgMsgPerTicketsPerInterface.vue'
import accountAvgResponseTimePerInterface from '@/components/reports/accounts/AvgResponseTimePerInterface.vue'
import accountAvgTicketsTimePerInterface from '@/components/reports/accounts/AvgTicketsTimePerInterface.vue'
import accountCantTicketsPerClient from '@/components/reports/accounts/CantTicketsPerClient.vue'
import accountCantTicketsPerInterface from '@/components/reports/accounts/CantTicketsPerInterface.vue'
import accountTopAgents from '@/components/reports/accounts/TopAgents.vue'
import accountTopClients from '@/components/reports/accounts/TopClients.vue'

/**
 * Componentes de Reportes [Agentes]
 */
import agentCantTicketsPerInterface from '@/components/reports/agents/cantTicketsPerInterface.vue'
import agentAvgMsgTickets from '@/components/reports/agents/AvgMsgTickets.vue'
import agentAvgTicketsTimeInterface from '@/components/reports/agents/AvgTicketsTimeInterface.vue'
import agentAvgResponseInterface from '@/components/reports/agents/AvgResponseInterface.vue'
// -----------------------------------------------------------------------------

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/reports/accounts/tickets_interface',
      name: 'accounts_tickets_interface',
      component: accountCantTicketsPerInterface
    },
    {
      path: '/reports/accounts/avg_msg_tickets',
      name: 'accounts_avg_msg_tickets',
      component: accountAvgMsgPerTicketsPerInterface
    },
    {
      path: '/reports/accounts/client_tickets',
      name: 'accounts_client_tickets',
      component: accountCantTicketsPerClient
    },
    {
      path: '/reports/accounts/avg_tickets_time_interface',
      name: 'acccounts_avg_tickets_time_interface',
      component: accountAvgTicketsTimePerInterface
    },
    {
      path: '/reports/accounts/top_clients',
      name: 'accounts_top_clients',
      component: accountTopClients
    },
    {
      path: '/reports/accounts/top_agents',
      name: 'accounts_top_agents',
      component: accountTopAgents
    },
    {
      path: '/reports/accounts/avg_response_interface',
      name: 'accounts_avg_response_interface',
      component: accountAvgResponseTimePerInterface
    },
    {
      path: '/reports/agents/interface_tickets',
      name: 'agents_cantTicketsPerInterface',
      component: agentCantTicketsPerInterface
    },
    {
      path: '/reports/agents/avg_msg_tickets',
      name: 'agents_avgMsgTickets',
      component: agentAvgMsgTickets
    },
    {
      path: '/reports/agents/avg_tickets_time_interface',
      name: 'agents_avgTicketsTimePerInterface',
      component: agentAvgTicketsTimeInterface
    },
    {
      path: '/reports/agents/avg_response_interface',
      name: 'agents_avgResponseTimePerInterface',
      component: agentAvgResponseInterface
    }
  ]
})
