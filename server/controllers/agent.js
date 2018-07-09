const router = require('express').Router()
const Agent = require('../models/agent')


/**
 * Agents API
 */

// GET agents (All)
router.get('/', (req, res) => {
    let fieldAux = {};
    if (req.query.fields !== undefined){
        req.query.fields.forEach($f => fieldAux[$f] = true);
    }

    Agent.find(function(error, agents) {
        if (error) {
            console.error(error)
        }
        res.send({
            agents: agents
        })
    }).sort({ _id: -1 }).select(fieldAux)
})

// GET Agent (One)
router.get('/:id', (req, res) => {
    var db = req.db
    Post.findById(req.params.id, function(error, post) {
        if (error) {
            console.error(error)
        }
        res.send(post)
    })
})

module.exports = router;