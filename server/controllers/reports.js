const router = require('express').Router()

const avgMsgPerTicketPerInterface = require('./reports/accounts/avgMsgPerTicketsPerInterface');
const cantTicketPerInterface = require('./reports/accounts/cantTicketsPerInterface');
const cantTicketsPerClient = require('./reports/accounts/cantTicketsPerClient');
const avgTicketsDurationPerInterface = require('./reports/accounts/avgTicketDurationPerInterface');
const topClients = require('./reports/accounts/topClients');
const topAgents = require('./reports/accounts/topAgents');

const cantTicketsPerInterfacePerAgent = require('./reports/agents/cantTicketsPerInterfacePerAgent');

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

/**
 * Reportes por AGENTES
 */
router.post('/agents/cant_tickets_interface',cantTicketsPerInterfacePerAgent);

module.exports = router;