import React, { useEffect, useRef, useState } from 'react'
import '../styles/css/chat.css'
import io from 'socket.io-client'
import { ReactComponent as Searchlens } from '../assets/svg/lens.svg'
import { ReactComponent as AngleDown } from '../assets/svg/angle-down.svg'
import { ReactComponent as Plus } from '../assets/svg/plus.svg'
import { ReactComponent as Send } from '../assets/svg/send.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import PrevChats from '../data/previous_chats.json'
import ChatList from '../data/chat_list.json'

const Test: React.FC = () => {
  const [chatlist, setChatList] = useState<Array<any>>([])
  const [messages, setMessages] = useState<{}[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [socket, setSocket] = useState<any>(null)
  const messContRef = useRef<HTMLDivElement | null>(null)
  const myuserid = 'mod456'

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(messageInput)
    // add message to the arr
    setMessages([
      ...messages,
      {
        timestamp: 'now',
        userid: myuserid,
        sendername: 'Dennis Kibet',
        level: 'user',
        message: messageInput,
      },
    ])
    messContRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (socket) {
      socket.emit('client_message', { message: messageInput })
      setMessageInput('')
    }
    setMessageInput('')
  }

  useEffect(() => {
    messContRef.current?.scrollIntoView()
    setChatList(ChatList.chats)

    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    newSocket.emit('client_message', { message: 'start' })

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect()
      }
    }
  }, [])
  useEffect(() => {
    if (socket) {
      socket.on('response', (data: any) => {
        console.log(data.response)
        setMessages((prevMessages) => [...prevMessages, data.response])
        messContRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      socket.on('info', (data: any) => {
        console.log(data.response)
        setInfo(data.response)
        messContRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [socket])

  console.log(messages)
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
              <div className="lsdbar_cat_item lsdbar_item_cat_active">
                <div className="lsbar_it_title">
                  <span>Friends & Family</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
                <div className="lsdbar_cat_cont">
                  {chatlist.map((chat) => {
                    return (
                      <div className="wecare_it_user">
                        <div className="wecare_lsdbar_profile">
                          <img
                            src={
                              chat.profile_url === ''
                                ? UserPlaceholder
                                : chat.profile_url
                            }
                            alt=""
                            className="wecare_user_profile_sidebar"
                          />
                        </div>
                        <div className="lsdbar_user_profile_texts">
                          <h2 className="lsdbar_user_name">{chat.name}</h2>
                          <span className="lsdbar_last_mess">
                            {chat.last_message}
                          </span>
                        </div>
                        <div className="lsdbar_user_profile_meta">
                          <span className="lsdbar_lst_time">
                            {chat.last_seen}
                          </span>
                        </div>
                      </div>
                    )
                  })}
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
            <div className="pa_top"></div>
            <div className="pa_middle">
              <div className="messplay">
                {/* {PrevChats.chats.map((chat) => {
                  return chat.userid === myuserid ? (
                    <div className="outgoing_message">
                      <div className="out_mess_content">
                        <div className="out_mess_meta">
                          <span className="out_mess_time">now</span>
                        </div>
                        <div className="outgoing_cont_message">
                          <span className="out_th_content">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Ex consequatur dolor, neque dolorem error
                            blanditiis quia dolorum, saepe pariatur impedit
                            debitis. Nihil atque modi placeat, minima fugiat
                            aspernatur, neque et culpa esse, at quisquam soluta?
                          </span>
                        </div>
                      </div>
                      <div className="out_mess_sender_profile">
                        <img src={UserPlaceholder} alt="" />
                      </div>
                    </div>
                  ) : (
                    <div className="incoming_message">
                      <div className="in_mess_sender_profile">
                        <img src={UserPlaceholder} alt="" />
                      </div>
                      <div className="in_mess_content">
                        <div className="inc_mess_meta">
                          <span className="inc_sender_name">Benn kaiser</span>
                          <span className="inc_mess_misc">moderator</span>
                          <span className="inc_mess_time">now</span>
                        </div>
                        <div className="incoming_cont_message">
                          <span className="inc_th_content">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Ex consequatur dolor, neque dolorem error
                            blanditiis quia dolorum, saepe pariatur impedit
                            debitis. Nihil atque modi placeat, minima fugiat
                            aspernatur, neque et culpa esse, at quisquam soluta?
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })} */}
                {info !== '' ? <span>info</span> : null}
                {messages.map((chat: any) => {
                  return chat.userid === myuserid ? (
                    <div className="outgoing_message">
                      <div className="out_mess_content">
                        <div className="out_mess_meta">
                          <span className="out_mess_time">
                            {chat.timestamp}
                          </span>
                        </div>
                        <div className="outgoing_cont_message">
                          <span className="out_th_content">{chat.message}</span>
                        </div>
                      </div>
                      <div className="out_mess_sender_profile">
                        <img src={UserPlaceholder} alt="" />
                      </div>
                    </div>
                  ) : (
                    <div className="incoming_message">
                      <div className="in_mess_sender_profile">
                        <img src={UserPlaceholder} alt="" />
                      </div>
                      <div className="in_mess_content">
                        <div className="inc_mess_meta">
                          <span className="inc_sender_name">
                            {chat.sendername}
                          </span>
                          <span className="inc_mess_misc">{chat.level}</span>
                          <span className="inc_mess_time">
                            {chat.timestamp}
                          </span>
                        </div>
                        <div className="incoming_cont_message">
                          <span className="inc_th_content">{chat.message}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messContRef} />
              </div>
              <div>
                {/* {messages.map((message, index) => (
                  <div key={index}>{message}</div>
                ))} */}
              </div>
            </div>
            <div className="pa_bottom">
              <div className="pa_chat_wrapper">
                <div className="pa_widgets">
                  <Plus className="pa_plus_Ic" />
                </div>
                <div className="pa_chat_form">
                  <form onSubmit={handleSendMessage} className="pa_form_chat">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="pa_chat_input"
                    ></textarea>
                    <button type="submit" className="pa_chat_submit_btn">
                      <Send className="pa_send_Ic" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="rightSidebar"></div>
        </div>
      </div>
    </div>
  )
}

export default Test
