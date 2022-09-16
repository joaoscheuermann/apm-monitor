import http from 'http'
import { Server } from "socket.io"
import express from 'express'
import { EventEmitter } from 'stream'

export class WebSocketServer {
  public app = express()
  public server = http.createServer(this.app)
  public io = new Server(this.server)

  constructor (
    public channel: EventEmitter,
    public root?: string,
  ) {
    // Share static files
    this.app.use(express.static(root || 'public'))

    // Broadcasts the APM update to all connected users
    this.channel.on('apm:update', (payload: any) => {
      this.io.emit('apm:update', payload)
    })

    this.channel.on('server:stop', () => this.stop())
    this.channel.on('server:start', (port: any) => this.start(port))
  }

  start (port: string = '6969') {
    this.server.listen(port, () => {
      console.log(`Listening on http://localhost:${port} || http://192.168.0.1:${port}`)
    })

    this.channel.emit('server:started', { cwd: process.cwd(), argv: process.argv })
  }

  stop () {
    this.server.close()
    this.channel.emit('server:stoped')
  }
}

const port = process.argv[2]
const root = process.argv[3]

const channel = new EventEmitter()
const server = new WebSocketServer(channel, root)

process.on('message', ({ type, payload }) => {
  channel.emit(type, payload)
})

channel.on('server:started', (payload) => {
  if (!process.send) return

  process.send({
    type: 'server:started',
    payload: payload
  })
})

channel.on('server:stoped', () => {
  if (!process.send) return

  process.send({
    type: 'server:stoped',
    payload: null
  })
})

server.start(port)
