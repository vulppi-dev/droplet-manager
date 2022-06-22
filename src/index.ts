import 'colors'
import http from 'http'
import express from 'express'
import { WebSocketServer as WIO } from 'ws'

import routesConfig from './routes'
import socketConfig from './socket'

import './jobs'

// Configurando modo desenvolvedor
const devMode = process.env.NODE_ENV !== 'production'

// Capturador geral de erros
process.on('uncaughtException', function (err) {
  console.error('Server error!'.red)
  console.error(err)
})

if (devMode) {
  console.log('DEV_MODE', 'enable'.yellow)
}

// Carregando dados das variáveis de ambiente
const PORT = process.env.MANAGER_PORT

// Criando aplicação
const app = express()
const server = http.createServer(app)
const io = new WIO({ server })

Promise.resolve(devMode).then(async (dev) => {
  let port = PORT ? parseInt(PORT) : NaN

  if (dev) {
    port = 3001
  }

  // Habilitando serviços
  routesConfig(app)
  socketConfig(io)

  server.listen(port, () => {
    console.log('Server listen in port', port)
  })
})
