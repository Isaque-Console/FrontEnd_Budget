const express = require("express")
const server = express()
const routes = require("./routes")
const path = require("path")

// OBS: o .use serve para habilitar configuracoes nesse servidor

// Definir o EJS como o mecanismo de exibição para o nosso aplicativo Express
server.set('view engine', 'ejs')

// mudar a localizacao da pasta views
server.set('views', path.join(__dirname, 'views'))

// habilitar arquivos statics
server.use(express.static("public"))

// habilitar o req.body
server.use(express.urlencoded({ extended: true }))

// routes
server.use(routes)

// fazer a maquina ouvir uma porta para rodar essa aplicacao
const port = 3001
server.listen(port, () => {
    console.log(`O servidor está rodando na porta ${port}`)
})

