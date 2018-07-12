const router = require('express').Router()

const avgMsgPerTicketPerInterface = require('./reports/accounts/avgMsgPerTicketsPerInterface');
const cantTicketPerInterface = require('./reports/accounts/cantTicketsPerInterface');
const cantTicketsPerClient = require('./reports/accounts/cantTicketsPerClient');
const avgTicketsDurationPerInterface = require('./reports/accounts/avgTicketDurationPerInterface');
const topClients = require('./reports/accounts/topClients');
const topAgents = require('./reports/accounts/topAgents');
const avgResponseInterface = require('./reports/accounts/avgResponseInterface');

const cantTicketsPerInterfacePerAgent = require('./reports/agents/cantTicketsPerInterfacePerAgent');
const avgMsgTicketsPerInterfacePerAgent = require('./reports/agents/avgMsgPerTicketsPerInterface');
const avgTicketsDurationPerInterfacePerAgent = require('./reports/agents/avgTicketDurationPerInterface');
const avgResponseInterfacePerAgent = require('./reports/agents/avgResponseInterface');
/**
 * Reportes por CUENTAS
 */

// Promedio de mensajes por tickets por interfaz
router.post('/avg_msg_tickets', avgMsgPerTicketPerInterface);

// Cantidad de tickets por interfaz
router.post('/tickets_interface', cantTicketPerInterface);

// Cantidad de Tickets por Cliente
router.post('/tickets_client', cantTicketsPerClient);

// Promedio de duracion de ticket por interfaz
router.post('/avg_time_ticket_interface', avgTicketsDurationPerInterface);

// Top 10 clientes
router.post('/top_clients', topClients);

// Top 10 agents por duración de tickets y cantidad
router.post('/top_agents', topAgents);

// Promedio de tiempo de respuesta por interfaz
router.post('/avg_response_interface', avgResponseInterface);

/**
 * Reportes por AGENTES
 */

// Cantidad de tickets por interfaz
router.post('/agents/cant_tickets_interface',cantTicketsPerInterfacePerAgent);

// Promedio de mensajes por ticket por interfaz
router.post('/agents/avg_msg_tickets', avgMsgTicketsPerInterfacePerAgent)

// Promedio de duracion de ticket por interfaz
router.post('/agents/avg_time_ticket_interface', avgTicketsDurationPerInterfacePerAgent)

// Promedio de tiempo de respuesta por interfaz
router.post('/agents/avg_response_interface', avgResponseInterfacePerAgent)
module.exports = router;