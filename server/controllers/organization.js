const router = require('express').Router()
const Organization = require('../models/organization')


/**
 * Organizations API
 */

// GET Organizations (All)
router.get('/', (req, res) => {
    Organization.find(function(error, organizations) {
        if (error) {
        console.error(error)
        }
        res.send({
            organizations: organizations
        })
    }).sort({ _id: -1 })
})

// GET Organization (One)
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