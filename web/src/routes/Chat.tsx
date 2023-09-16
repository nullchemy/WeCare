import React, { Fragment } from 'react'
import { io } from 'socket.io-client'

const Chat = () => {
  const socket = io('https://server-domain.com')
  // client-side
  socket.on('connect', () => {
    console.log(socket.id)
  })

  socket.on('disconnect', () => {
    console.log(socket.id) // undefined
  })
  return (
    <Fragment>
      <div className="Chat">Chat</div>
    </Fragment>
  )
}

export default Chat
