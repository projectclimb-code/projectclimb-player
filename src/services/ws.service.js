export class WebSocketService {
  constructor() {
    this.sockets = new Map() // key: connectionId, value: { socket, listeners }
  }

  connect(url, connectionId = 'default') {
    if (this.sockets.has(connectionId)) return // already connected

    const socket = new WebSocket(url)
    const listeners = new Set()

    socket.onopen = () => {
      console.log(`[WS:${connectionId}] Connected to`, url)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        listeners.forEach((cb) => cb(data))
      } catch (err) {
        console.error(`[WS:${connectionId}] Invalid message`, err)
      }
    }

    socket.onclose = () => {
      console.log(`[WS:${connectionId}] Disconnected`)
      this.sockets.delete(connectionId)
    }

    socket.onerror = (err) => {
      console.error(`[WS:${connectionId}] Error:`, err)
    }

    this.sockets.set(connectionId, { socket, listeners })
  }

  subscribe(callback, connectionId = 'default') {
    const connection = this.sockets.get(connectionId)
    if (!connection) {
      console.warn(`[WS] Connection ${connectionId} not found`)
      return () => {}
    }

    connection.listeners.add(callback)

    return () => {
      connection.listeners.delete(callback)
    }
  }

  send(data, connectionId = 'default') {
    const connection = this.sockets.get(connectionId)
    if (connection?.socket?.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(data))
    } else {
      console.warn(`[WS:${connectionId}] Tried to send message but socket not open`)
    }
  }

  disconnect(connectionId = 'default') {
    const connection = this.sockets.get(connectionId)
    if (connection) {
      connection.socket.close()
      this.sockets.delete(connectionId)
    }
  }

  disconnectAll() {
    this.sockets.forEach((connection) => connection.socket.close())
    this.sockets.clear()
  }
}

export const websocketService = new WebSocketService()
