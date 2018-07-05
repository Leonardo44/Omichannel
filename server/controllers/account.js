const router = require('express').Router()
const Account = require('../models/account')


/**
 * Accounts API
 */

// GET Accounts (All)
router.get('/', (req, res) => {
    Account.find(function(error, accounts) {
        if (error) {
        console.error(error)
        }
        res.send({
            accounts: accounts
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