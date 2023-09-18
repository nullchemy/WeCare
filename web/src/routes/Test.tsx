import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import api from '../api/axios'

const Test: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const [socket, setSocket] = useState<any>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (socket) {
      socket.emit('client_message', { message: messageInput })
      setMessageInput('')
    }
  }

  useEffect(() => {
    const newSocket = io('http://localhost:6000')
    setSocket(newSocket)

    newSocket.on('response', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.response])
    })

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect()
      }
    }
  }, [])

  return (
    <div>
      <h1>Test Page</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default Test
