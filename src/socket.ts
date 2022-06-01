import { getFirestore } from 'firebase-admin/firestore'
import { WebSocketServer } from 'ws'
import GenericSocket, { socketParser } from './io/base.js'
import { getAdminApp } from './services/firebase.js'

const admin = getAdminApp()
const db = getFirestore(admin)

export default async function configureSocketServer(io: WebSocketServer) {
  io.on('connection', async (client, req) => {
    const url = (req.url || '/?').split('?')
    const path = url[0]
    const query = new URLSearchParams(url[1] || '')

    if (
      !socketParser({
        client,
        io,
        path,
        query,
      })
    ) {
      client.terminate()
    }
  })
}
