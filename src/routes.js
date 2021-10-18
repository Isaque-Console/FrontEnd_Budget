const express = require('express')
const routes = express.Router()

// nomeia as rotas; envia variaveis para o html por meio do EJS
routes.get('/', (req, res) => res.render("index"))
routes.post('/', (req, res) => {console.log(req.body)})
routes.get('/NewTransaction', (req, res) => res.render("NewTransaction"))

module.exports = routes;
