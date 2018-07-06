const router = require('express').Router()
const Account = require('../models/account')


/**
 * Agents API
 */

// GET agents (All)
router.get('/', (req, res) => {
    Account.find(function(error, agents) {
        if (error) {
        console.error(error)
        }
        res.send({
            agents: agents
        })
    }).sort({ _id: -1 })
})

// GET Account (One)
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