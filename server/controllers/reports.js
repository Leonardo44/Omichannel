const router = require('express').Router()

const avgMsgPerTicketPerInterface = require('./reports/accounts/avgMsgPerTicketsPerInterface');
const cantTicketPerInterface = require('./reports/accounts/cantTicketsPerInterface');
const cantTicketsPerClient = require('./reports/accounts/cantTicketsPerClient');
const avgTicketsDurationPerInterface = require('./reports/accounts/avgTicketDurationPerInterface');

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

/**
 * Reportes por AGENTES
 */
router.post('/agents/cant_tickets_interface',cantTicketsPerInterfacePerAgent);

module.exports = router;