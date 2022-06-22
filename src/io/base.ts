import { RawData, WebSocket, WebSocketServer } from 'ws'

export default abstract class GenericSocket {
  private conn: WebSocket
  private io: WebSocketServer

  constructor(conn: WebSocket, io: WebSocketServer) {
    this.conn = conn
    this.io = io

    conn.on('message', this.receive)
  }

  get isOpen(): boolean {
    return this.conn.readyState === WebSocket.OPEN
  }

  abstract receive(msg: RawData, isBinary: boolean): void

  terminate(): void {
    this.conn.terminate()
  }
}

interface SocketParserOptions {
  client: WebSocket
  io: WebSocketServer
  path: string
  query: URLSearchParams
}

export const socketParser = ({ client }: SocketParserOptions) => {
  client.terminate()

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

  return false
}
