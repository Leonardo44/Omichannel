export const colors = {
  'primary': {
    'back': 'blue darken-4',
    'text': 'blue--text text--darken-4'
  },
  'secondary': {
    'back': 'blue',
    'text': 'blue--text'
  },
  'accent': {
    'back': 'deep-orange',
    'text': 'deep-orange--text text--accent-3'
  }
}

export const menu = [
  {
    title: 'Por cuentas',
    icon: 'supervised_user_circle',
    items: [
      {title: 'Promedio de Mensajes por Ticket por Interfaz', icon: 'settings', action: 'accounts_avg_msg_tickets'},
      {title: 'Promedio de Tiempo de respuesta por interfaz', icon: 'settings', action: 'accounts_avg_response_interface'},
      {title: 'Promedio de Duración de Tickets por Interfaz', icon: 'settings', action: 'acccounts_avg_tickets_time_interface'},
      {title: 'Tickets por Cliente', icon: 'settings', action: 'accounts_client_tickets'},
      {title: 'Tickets por Interfaz', icon: 'settings', action: 'accounts_tickets_interface'},
      {title: 'Top 10 Agentes', icon: 'settings', action: 'accounts_top_agents'},
      {title: 'Top 10 Clientes', icon: 'settings', action: 'accounts_top_clients'}
    ]
  },
  {
    title: 'Por agentes',
    icon: 'person_pin',
    items: [
      {title: 'Tickets por Interfaz', icon: 'user', action: 'agents_cantTicketsPerInterface'},
      {title: 'Promedio de Mensajes por Ticket', icon: 'user', action: 'agents_avgMsgTickets'},
      {title: 'Promedio de Duración de Tickets por Interfaz', icon: 'user', action: 'agents_avgTicketsTimePerInterface'},
      {title: 'Promedio de Tiempo de Respuesta de Tickets por Interfaz', icon: 'user', action: 'agents_avgResponseTimePerInterface'}
    ]
  }
]

export const intervalOptions = [
  {text: '1 Día', value: 'D:1'},
  {text: '1 Hora', value: 'H:1'},
  {text: '30 Minutos', value: 'M:30'}
]
