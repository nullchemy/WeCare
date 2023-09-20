import React, { useEffect, useState } from 'react'
import '../styles/css/chat.css'
import io from 'socket.io-client'
import { ReactComponent as Searchlens } from '../assets/svg/lens.svg'
import { ReactComponent as AngleDown } from '../assets/svg/angle-down.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'

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
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    newSocket.on('response', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.response])
    })
    newSocket.emit('client_message', { message: 'start' })

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect()
      }
    }
  }, [])

  return (
    <div className="chat">
      <div className="chat_container">
        <div className="chatAppbar">
          <div className="chatbar_left">
            <h1>
              WeCare: Mental Health Chatbot for Suicide Detection, and Support
            </h1>
          </div>
          <div className="chatbar_right"></div>
        </div>
        <div className="chatWrapper">
          <div className="leftSidebar">
            <div className="lsbar_search">
              <form className="lsdbar_searchform">
                <div className="lsdbar_form_group">
                  <input
                    type="text"
                    className="lsdbar_search_input"
                    placeholder="Search"
                  />
                </div>
                <button type="submit" className="lsdbar_search_button">
                  <Searchlens className="lsdbar_search_Ic" />
                </button>
              </form>
            </div>
            <div className="lsdbar_categories">
              <div className="lsdbar_cat_item">
                <div className="lsbar_it_title">
                  <span>Friends</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
                <div className="lsdbar_cat_cont">
                  <div className="wecare_it_user">
                    <div className="wecare_lsdbar_profile">
                      <img
                        src={UserPlaceholder}
                        alt=""
                        className="wecare_user_profile_sidebar"
                      />
                    </div>
                    <div className="lsdbar_user_profile_texts">
                      <h2 className="lsdbar_user_name">Dennis kibet</h2>
                      <span className="lsdbar_last_mess">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Velit, consequatur?
                      </span>
                    </div>
                    <div className="lsdbar_user_profile_meta">
                      <span className="lsdbar_lst_time">now</span>
                    </div>
                  </div>
                  <div className="wecare_it_user">
                    <div className="wecare_lsdbar_profile">
                      <img
                        src={UserPlaceholder}
                        alt=""
                        className="wecare_user_profile_sidebar"
                      />
                    </div>
                    <div className="lsdbar_user_profile_texts">
                      <h2 className="lsdbar_user_name">Dennis kibet</h2>
                      <span className="lsdbar_last_mess">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Velit, consequatur?
                      </span>
                    </div>
                    <div className="lsdbar_user_profile_meta">
                      <span className="lsdbar_lst_time">now</span>
                    </div>
                  </div>
                  <div className="wecare_it_user">
                    <div className="wecare_lsdbar_profile">
                      <img
                        src={UserPlaceholder}
                        alt=""
                        className="wecare_user_profile_sidebar"
                      />
                    </div>
                    <div className="lsdbar_user_profile_texts">
                      <h2 className="lsdbar_user_name">Dennis kibet</h2>
                      <span className="lsdbar_last_mess">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Velit, consequatur?
                      </span>
                    </div>
                    <div className="lsdbar_user_profile_meta">
                      <span className="lsdbar_lst_time">now</span>
                    </div>
                  </div>
                  <div className="wecare_it_user">
                    <div className="wecare_lsdbar_profile">
                      <img
                        src={UserPlaceholder}
                        alt=""
                        className="wecare_user_profile_sidebar"
                      />
                    </div>
                    <div className="lsdbar_user_profile_texts">
                      <h2 className="lsdbar_user_name">Dennis kibet</h2>
                      <span className="lsdbar_last_mess">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Velit, consequatur?
                      </span>
                    </div>
                    <div className="lsdbar_user_profile_meta">
                      <span className="lsdbar_lst_time">now</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lsdbar_cat_item">
                <div className="lsbar_it_title">
                  <span>Groups</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
              </div>
              <div className="lsdbar_cat_item">
                <div className="lsbar_it_title">
                  <span>Communities</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
              </div>
              <div className="lsdbar_cat_item">
                <div className="lsbar_it_title">
                  <span>bots</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
              </div>
            </div>
          </div>
          <div className="playarea">
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
          <div className="rightSidebar"></div>
        </div>
      </div>
    </div>
  )
}

export default Test
