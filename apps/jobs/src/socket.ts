import { getFirestore } from 'firebase-admin/firestore'
import { WebSocketServer } from 'ws'
// import GenericConnection from './connectors/conn.js'
// import DeviceConnection from './connectors/device.js'
// import ControllerConnection from './connectors/control.js'
import { getAdminApp } from './services/firebase.js'

const admin = getAdminApp()
const db = getFirestore(admin)

// const devices: Record<string, GenericConnection> = {}
// const controllers: Record<string, GenericConnection> = {}

export default async function configureSocketServer(io: WebSocketServer) {
  io.on('connection', async (client, req) => {
    const url = (req.url || '/?').split('?')
    const path = url[0]
    const query = new URLSearchParams(url[1] || '')

    // if (path == '/devices' && query.has('device')) {
    //   const did = query.get('device') as string

    //   console.debug('Device connected:', did.blue)
    //   const deviceDoc = await db.doc(`devices/${did}`).get()
    //   if (deviceDoc.exists) {
    //     console.debug('Device', did.blue, 'loading...')
    //     if (devices[did] && devices[did].open) {
    //       console.debug('Device', did.blue, 'has a old connection.')
    //       devices[did].terminate()
    //       delete devices[did]
    //     }

    //     devices[did] = new DeviceConnection(client, io, deviceDoc)
    //   } else {
    //     console.debug('Device', did.blue, 'not exists!')
    //     client.terminate()
    //   }
    // } else if (path == '/controllers' && query.has('token')) {
    //   const token = query.get('token') as string
    //   const uid = '1'
    //   console.debug('Controller connection:', 'something')

    //   controllers[uid] = new ControllerConnection(client, io)
    // } else {
      client.terminate()
    // }
  })
}
