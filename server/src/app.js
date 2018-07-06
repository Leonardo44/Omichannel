const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
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

// app.get('/config', (req, res) => res.send({

// }))

// --------------------------------------

// app.get('/posts', (req, res) => {
//   Post.find({}, 'title description', function(error, posts) {
//     if (error) {
//       console.error(error)
//     }
//     res.send({
//       posts: posts
//     })
//   }).sort({ _id: -1 })
// })

// app.post('/add_post', (req, res) => {
//   var db = req.db
//   var title = req.body.title
//   var description = req.body.description
//   var new_post = new Post({
//     title: title,
//     description: description
//   })

//   new_post.save(function(error) {
//     if (error) {
//       console.log(error)
//     }
//     res.send({
//       success: true
//     })
//   })
// })

// app.put('/posts/:id', (req, res) => {
//   var db = req.db
//   Post.findById(req.params.id, 'title description', function(error, post) {
//     if (error) {
//       console.error(error)
//     }

//     post.title = req.body.title
//     post.description = req.body.description
//     post.save(function(error) {
//       if (error) {
//         console.log(error)
//       }
//       res.send({
//         success: true
//       })
//     })
//   })
// })

// app.delete('/posts/:id', (req, res) => {
//   var db = req.db
//   Post.remove(
//     {
//       _id: req.params.id
//     },
//     function(err, post) {
//       if (err) res.send(err)
//       res.send({
//         success: true
//       })
//     }
//   )
// })

// app.get('/post/:id', (req, res) => {
//   var db = req.db
//   Post.findById(req.params.id, 'title description', function(error, post) {
//     if (error) {
//       console.error(error)
//     }
//     res.send(post)
//   })
// })

app.listen(process.env.PORT || 8081)
