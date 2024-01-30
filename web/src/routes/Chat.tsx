import React, { useEffect, useRef, useState } from 'react'
import '../styles/css/chat.css'
import io from 'socket.io-client'
import { ReactComponent as Searchlens } from '../assets/svg/lens.svg'
import { ReactComponent as AngleDown } from '../assets/svg/angle-down.svg'
import { ReactComponent as Plus } from '../assets/svg/plus.svg'
import { ReactComponent as Send } from '../assets/svg/send.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import ChatList from '../data/chat_list.json'
import api from '../api/axios'

const Test: React.FC = () => {
  const [chatlist, setChatList] = useState<Array<any>>([])
  const [activechat, setActiveChat] = useState<string>('')
  const [lsdbarActive, setlsdbarActive] = useState('chat')
  const [newchatdrawer, setNewchatdrawer] = useState(false)
  const [messages, setMessages] = useState<{}[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [typing, setTyping] = useState<boolean>(false)
  const [socket, setSocket] = useState<any>(null)
  const [newBot, setNewBot] = useState<boolean>(false)
  const messContRef = useRef<HTMLDivElement | null>(null)
  const myuserid = 'mod456'

  const handleSendMessage = async (e: React.FormEvent) => {
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
      socket.on('typing', (data: any) => {
        console.log(data.response)
        setTyping(data.response)
        messContRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [socket])

  const handleNewChatDrawer = async () => {
    setNewchatdrawer(true)
    // fetch users available for chatting
    const res = await api('GET', '/allusers', {})
    console.log(res.data)
  }

  const fetchPrevChats = async (chatid: string) => {
    const res = await api('GET', 'prevchats', { chatid: chatid })
    console.log(res.data)
  }

  return (
    <div className="chat">
      {newBot ? (
        <div
          className="chatmodalpop"
          onClick={() => {
            setNewBot(false)
          }}
        >
          <div className="chatmodalinnercont_wrapper">
            <div
              className="chatmodalinnercont"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <form className="newbot_form">
                <div className="newbot_form_group">
                  <label htmlFor="bot name" className="new_form_label">
                    name your bot <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input type="text" className="newbot_form_input" />
                </div>
                <button className="newbot_name_submit_form">
                  <span>create</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="chat_container">
        <div className="chatAppbar">
          <div className="chatbar_left">
            <h1 title="Mental Health Chatbot for Suicide Detection, and Support">
              WeCare
            </h1>
          </div>
          <div className="chatbar_right"></div>
        </div>
        <div className="chatWrapper">
          <div
            className={
              newchatdrawer ? 'newChatDrawer lsdractive' : 'newChatDrawer'
            }
          >
            <button
              className="newChatDrawerCloseIc"
              onClick={() => {
                setNewchatdrawer(false)
              }}
            >
              Close
            </button>
          </div>
          <div
            className={newchatdrawer ? 'leftSidebar' : 'leftSidebar lsdractive'}
          >
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
              <div
                className={
                  lsdbarActive === 'chat'
                    ? 'lsdbar_cat_item lsdbar_item_cat_active'
                    : 'lsdbar_cat_item'
                }
              >
                <div
                  className="lsbar_it_title"
                  onClick={() => {
                    setlsdbarActive('chat')
                  }}
                >
                  <span>Friends & Family</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
                {lsdbarActive === 'chat' ? (
                  <div className="lsdbar_cat_cont">
                    {chatlist.map(
                      (chat: {
                        chat_id: string
                        name: string
                        last_message: string
                        unread_messages: number
                        profile_url: string
                        last_seen: string
                        timestamp: string
                      }) => {
                        return (
                          <div
                            className="wecare_it_user"
                            onClick={() => {
                              setActiveChat(chat.chat_id)
                              fetchPrevChats(chat.chat_id)
                            }}
                          >
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
                              <span
                                className="lsdbar_last_mess"
                                title={chat.last_message}
                              >
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
                      }
                    )}
                    <span
                      className="lsdbar_new_chat"
                      onClick={() => {
                        handleNewChatDrawer()
                      }}
                    >
                      <Plus className="pa_plus_Ic" />
                      <span>new chat</span>
                    </span>
                  </div>
                ) : null}
              </div>
              <div
                className={
                  lsdbarActive === 'bot'
                    ? 'lsdbar_cat_item lsdbar_item_cat_active'
                    : 'lsdbar_cat_item'
                }
              >
                <div
                  className="lsbar_it_title"
                  onClick={() => {
                    setlsdbarActive('bot')
                  }}
                >
                  <span>chatbots</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
                {lsdbarActive === 'bot' ? (
                  <div className="lsdbar_cat_cont">
                    <span
                      className="lsdbar_new_chat"
                      onClick={() => {
                        setNewBot(true)
                      }}
                    >
                      <Plus className="pa_plus_Ic" />
                      <span>new bot chat</span>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="playarea">
            {activechat === '' ? (
              <div className="playarea_placeholder">
                <div className="playarea_place_center">
                  <h1>Start a new Conversation</h1>
                </div>
                <div className="playarea_place_bottom">
                  <p>messages are end-to-end encrypted</p>
                </div>
              </div>
            ) : (
              <div className="playarea_active">
                <div className="pa_top">
                  <div className="active_chatee_left">
                    <div className="active_chatee_profile">
                      <img src={UserPlaceholder} alt="" />
                    </div>
                    <div className="active_chatee_meta">
                      <h2>Alice Johnson</h2>
                      <span className="active_chatee_ls">online</span>
                    </div>
                  </div>
                </div>
                <div className="pa_middle">
                  <div className="messplay">
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
                              <span className="out_th_content">
                                {chat.message}
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
                              <span className="inc_sender_name">
                                {chat.sendername}
                              </span>
                              <span className="inc_mess_misc">
                                {chat.level}
                              </span>
                              <span className="inc_mess_time">
                                {chat.timestamp}
                              </span>
                            </div>
                            <div className="incoming_cont_message">
                              <span className="inc_th_content">
                                {chat.message}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {info !== '' ? <span>info</span> : null}
                    {typing ? (
                      <div className="incoming_message">
                        <div className="in_mess_sender_profile">
                          <img src={UserPlaceholder} alt="" />
                        </div>
                        <div className="in_mess_content">
                          <div className="typing">
                            <span className="circle bouncing"></span>
                            <span className="circle bouncing"></span>
                            <span className="circle bouncing"></span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div ref={messContRef} />
                  </div>
                  <div>
                    {/* {messages.map((message, index) => (
                  <div key={index}>{message}</div>
                ))} */}
                  </div>
                  <span className="messplay_sec_info">
                    Messages are end-to-end encrypted. No one outside this chat,
                    not even WeCare, can read or listen to them. Click to learn
                    more
                  </span>
                </div>
                <div className="pa_bottom">
                  <div className="pa_chat_wrapper">
                    <div className="pa_widgets">
                      <Plus className="pa_plus_Ic" />
                    </div>
                    <div className="pa_chat_form">
                      <form
                        onSubmit={handleSendMessage}
                        className="pa_form_chat"
                      >
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
            )}
          </div>
          <div className="rightSidebar"></div>
        </div>
      </div>
    </div>
  )
}

export default Test
