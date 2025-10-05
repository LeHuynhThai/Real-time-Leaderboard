import React from 'react'
import './MessageBubble.css'

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-bubble ${isOwn ? 'message-bubble--own' : 'message-bubble--other'}`}>
      <div className="message-bubble__content">
        <div>{message.content}</div>
        <div className="message-bubble__time">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}


