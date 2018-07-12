const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const dbContextTest = require('./connection').test; 

const app = express()

require('dotenv').config()

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const mongodb_conn_module = require('./mongodbConnModule')
const db = mongodb_conn_module.connect()

/**
 * Check Connection
 */
dbContextTest();

/**
 * Controllers
 */
const AccountController = require('../controllers/account')
const AgentController = require('../controllers/agent')
const ReportsController = require('../controllers/reports')
const OrganizationController = require('../controllers/organization')

app.use('/accounts', AccountController)
app.use('/agents', AgentController)
app.use('/reports', ReportsController)
app.use('/organizations', OrganizationController)

app.listen(process.env.APP_PORT || 8081, process.env.APP_HOST || 'localhost');
