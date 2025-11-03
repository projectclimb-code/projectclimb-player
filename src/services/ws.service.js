export class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = new Set()
  }

  connect(url) {
    if (this.socket) return // already connected

    this.socket = new WebSocket(url)
    this.socket.onopen = () => {
      console.log('[WS] Connected to', url)
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.listeners.forEach((cb) => cb(data))
      } catch (err) {
        console.error('[WS] Invalid message', err)
      }
    }

    this.socket.onclose = () => {
      console.log('[WS] Disconnected')
      this.socket = null
    }

    this.socket.onerror = (err) => {
      console.error('[WS] Error:', err)
    }
  }

  subscribe(callback) {
    this.listeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('[WS] Tried to send message but socket not open')
    }
  }

  /**
   * Close the connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

// Export a shared instance for use across the app
export const websocketService = new WebSocketService()
