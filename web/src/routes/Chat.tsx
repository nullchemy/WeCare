import React, { FormEvent, useEffect, useRef, useState } from 'react'
import '../styles/css/chat.css'
import io from 'socket.io-client'
import Cookies from 'js-cookie'
import { ReactComponent as Searchlens } from '../assets/svg/lens.svg'
import { ReactComponent as AngleDown } from '../assets/svg/angle-down.svg'
import { ReactComponent as Plus } from '../assets/svg/plus.svg'
import { ReactComponent as Arrow } from '../assets/svg/arrow-right.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import session from '../utils/session'
import { Auth, ActiveChat, Bot, StartedChats } from '../interfaces/chat'
import { v4 as uuidv4 } from 'uuid'
import Playarea from '../components/Playarea'
import UploadImage from '../components/UploadImage'
import { toast } from 'react-toastify'
import { setIsLogged } from '../state/actions/loggedAction'
import { useAppDispatch } from '../state/hooks'
import Analysis from '../components/Analysis'
import Profile from '../components/Profile'

const Chat: React.FC = () => {
  const [auth, setAuth] = useState<Auth>({
    message: '',
    meta: {
      email: '',
      full_name: '',
      user_id: '',
      profile_url: '',
    },
    status: false,
    token: '',
  })
  const [activechat, setActiveChat] = useState<ActiveChat>({
    chat_id: '',
    name: '',
    type: 'bot',
  })
  const [lsdbarActive, setlsdbarActive] = useState('bot')
  const [newchatdrawer, setNewchatdrawer] = useState(false)
  const [messages, setMessages] = useState<{}[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const [typing, setTyping] = useState<boolean>(false)
  const [socket, setSocket] = useState<any>(null)
  const [newBot, setNewBot] = useState<boolean>(false)
  const [botname, setBotName] = useState<string>('')
  const [bots, setBots] = useState<Array<Bot>>([])
  const [regusers, setRegUsers] = useState<{}[]>([])
  const [startedchats, setStartedChats] = useState<StartedChats[]>([])
  const messContRef = useRef<HTMLDivElement | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string>('')
  const [viewRightSideBar, setViewRightSideBar] = useState<{
    active: boolean
    width: number
    message: string
  }>({ active: false, width: 0, message: '' })
  const [model, setModel] = useState('electra')
  const myuserid = auth.meta.user_id ? auth.meta.user_id : ''
  const dispatch = useAppDispatch()

  const joinRoom = (room = [myuserid, activechat.chat_id].sort().join('|')) => {
    socket.emit('join_room', { full_name: activechat.name, room: room })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    // add message to the arr
    if (activechat.type === 'bot') {
      setMessages([
        ...messages,
        {
          timestamp: Date.now(),
          sender_id: myuserid,
          sendername: auth.meta.full_name ? auth.meta.full_name : '',
          level: 'user',
          message: messageInput,
        },
      ])
    } else {
      joinRoom()
    }
    messContRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (socket) {
      if (activechat.type === 'bot') {
        socket.emit('gemini_message', {
          chat_id: activechat.chat_id,
          message_id: '',
          sender_id: myuserid,
          receiver_id: activechat.chat_id,
          timestamp: '',
          message: messageInput,
          level: 'bot',
          model: model,
        })
      } else {
        socket.emit('chat_message', {
          chat_id: activechat.chat_id,
          message_id: '',
          full_name: activechat.name,
          sender_id: myuserid,
          receiver_id: activechat.chat_id,
          timestamp: '',
          message: messageInput,
          level: '',
          room: [myuserid, activechat.chat_id].sort().join('|'),
        })
      }
      setMessageInput('')
    }
    setMessageInput('')
  }

  const getUserBots = async () => {
    const res = await api('GET', 'mybots', {})
    if (res.status === 200) {
      setBots(res ? res.data.user_bots : [])
    }
  }

  useEffect(() => {
    messContRef.current?.scrollIntoView()
    const auth: any = session.get('auth')
    setAuth(JSON.parse(auth))
    const token = auth ? JSON.parse(auth)?.token ?? null : null
    const socketio_url =
      process.env.REACT_APP_SOCKETIO_URL || 'http://localhost:5000'
    const newSocket = io(socketio_url as string, {
      extraHeaders: {
        Authorization: token ? 'Bearer ' + token : 'Bearer undefined',
      },
    })
    setSocket(newSocket)

    // fetch User's Bots
    getUserBots()

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('response', (data: any) => {
        console.log(data)
        if (data && typeof data !== 'string' && data.level === 'chat') {
          // add chat to chatslist if active chat equals to user's id
          console.log(activechat.chat_id === data.chat_id)
          setMessages((prevMessages) => [...prevMessages, data])
          if (activechat.chat_id === data.chat_id) {
            console.log(data)
            console.log('it is active ')
          }
        } else {
          setMessages((prevMessages) => [...prevMessages, data.response])
        }
        messContRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      socket.on('typing', (data: any) => {
        setTyping(data.response)
        messContRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      socket.on('open_room', (data: any) => {
        console.log(data)

        // setting started message
        setStartedChats([
          ...startedchats,
          {
            chat_id: data.chat_id,
            name: data.full_name,
            last_message: data.message,
            unread_messages: 1,
            profile_url: '',
            last_seen: '',
            timestamp: data.timestamp,
          },
        ])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  const handleNewChatDrawer = async () => {
    setNewchatdrawer(true)
    // fetch users available for chatting
    const res = await api('GET', '/allusers', {})
    console.log(res.data)
  }

  const fetchPrevChats = async (chatid: string, context: string) => {
    const res = await api(
      'GET',
      `prevchats?chat_id=${chatid}&context=${context}`,
      { chat_id: chatid },
      { 'Content-Type': 'application/json' }
    )
    if (res.status === 200) {
      setMessages(res.data.chats)
    }
  }

  const submitNewBot = async (e: FormEvent) => {
    e.preventDefault()
    if (botname !== '') {
      const res = await api('POST', 'newbot', {
        botname: botname,
        bot_profile_pic: profilePicUrl,
      })
      setBotName('')
      setNewBot(false)
      console.log(res.data)
      getUserBots()
      // set active Chat and start new conversation
      setActiveChat({
        chat_id: '',
        name: '',
        type: 'bot',
      })
      socket.emit('client_message', { message: 'start' })
    } else {
      toast('Bot has to have a name!', { type: 'error' })
    }
  }

  const fetchRegisteredUsers = async () => {
    const res = await api('GET', 'getusers', {})
    setRegUsers(res.data)
  }

  useEffect(() => {
    const fetchActiveChatees = async () => {
      const res = await api('GET', 'getchats', {})
      if (res.status === 200) {
        console.log(res.data)
        setStartedChats(res.data.chats)
      }
    }
    if (lsdbarActive === 'chat') {
      fetchActiveChatees()
    }
  }, [lsdbarActive])

  // const updateStartedChats = async (user: any) => {
  //   const res = await api('PUT', 'updatestartedchats', user)
  //   // update active chat chatID
  //   if (res.status === 200) {
  //     const index = startedchats.findIndex(
  //       (chat) => chat.chat_id === activechat.chat_id
  //     )
  //     const updatedChats = [...startedchats]
  //     updatedChats[index] = {
  //       ...updatedChats[index],
  //       chat_id: res.data.chat_id,
  //     }
  //     setStartedChats(updatedChats)
  //     setActiveChat({ ...activechat, chat_id: res.data.chat_id })
  //   }
  // }

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
              <form
                className="newbot_form"
                onSubmit={(e) => {
                  submitNewBot(e)
                }}
              >
                <div className="newbot_form_group">
                  <UploadImage
                    profilePicUrl={profilePicUrl}
                    setProfilePicUrl={setProfilePicUrl}
                  />
                  <label htmlFor="bot name" className="new_form_label">
                    name your bot <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="newbot_form_input"
                    value={botname}
                    onChange={(e) => {
                      setBotName(e.target.value)
                    }}
                  />
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
            <div className="chat_profile_pic" title={auth.meta.full_name}>
              {auth.meta.profile_url ? (
                <img src={auth.meta.profile_url} alt="" />
              ) : (
                <img
                  src={UserPlaceholder}
                  style={{ marginTop: '5px' }}
                  alt=""
                />
              )}
            </div>
            <h1 title="Mental Health Chatbot for Suicide Detection, and Support">
              <Link to="/">WeCare</Link>
            </h1>
          </div>
          <div className="chatbar_right">
            <Link
              to="/"
              className="btn"
              onClick={() => {
                dispatch(setIsLogged(false))
                Cookies.remove('auth')
              }}
            >
              logout
            </Link>
          </div>
        </div>
        <div className="chatWrapper">
          <div
            className={
              newchatdrawer ? 'newChatDrawer lsdractive' : 'newChatDrawer'
            }
          >
            <Arrow
              className="newChatDrawerCloseIc"
              onClick={() => {
                setNewchatdrawer(false)
              }}
            />
            <br />
            {/* registered users available for chat list */}
            {regusers.map((user: any) => (
              <div
                className="wecare_it_user"
                key={user.user_id + uuidv4()}
                onClick={() => {
                  setMessages([])
                  setActiveChat({
                    chat_id: user.user_id,
                    name: user.full_name,
                    type: 'chat',
                  })
                  // updateStartedChats(user)
                  // setStartedChats([
                  //   ...startedchats,
                  //   {
                  //     chat_id: user.user_id,
                  //     name: user.full_name,
                  //     last_message: '',
                  //     unread_messages: 0,
                  //     profile_url: '',
                  //     last_seen: '',
                  //     timestamp: '',
                  //   },
                  // ])
                }}
                style={{ alignItems: 'center' }}
              >
                <div className="wecare_lsdbar_profile">
                  <img
                    src={UserPlaceholder}
                    alt=""
                    className="wecare_user_profile_sidebar"
                  />
                </div>
                <div className="lsdbar_user_profile_texts">
                  <h2 className="lsdbar_user_name">{user.full_name}</h2>
                </div>
                <div className="lsdbar_user_profile_meta">
                  <span className="lsdbar_lst_time">{}</span>
                </div>
              </div>
            ))}
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
                    {bots.map(
                      (bot: {
                        botname: string
                        bot_id: string
                        bot_profile_pic: string
                      }) => (
                        <div
                          className="wecare_it_user"
                          key={bot.bot_id + uuidv4()}
                          onClick={() => {
                            setMessages([])
                            setActiveChat({
                              chat_id: bot.bot_id,
                              name: bot.botname,
                              type: 'bot',
                            })
                            setProfilePicUrl(bot.bot_profile_pic)
                            fetchPrevChats(bot.bot_id, 'bot')
                          }}
                          style={{ alignItems: 'center' }}
                        >
                          <div className="wecare_lsdbar_profile">
                            <img
                              src={
                                bot.bot_profile_pic !== ''
                                  ? bot.bot_profile_pic
                                  : UserPlaceholder
                              }
                              alt=""
                              className="wecare_user_profile_sidebar"
                              style={
                                bot.bot_profile_pic !== ''
                                  ? { marginTop: '0px' }
                                  : {}
                              }
                            />
                          </div>
                          <div className="lsdbar_user_profile_texts">
                            <h2 className="lsdbar_user_name">{bot.botname}</h2>
                          </div>
                          <div className="lsdbar_user_profile_meta">
                            <span className="lsdbar_lst_time">{}</span>
                          </div>
                        </div>
                      )
                    )}
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
                  <span>Therapists & Help</span>
                  <AngleDown className="lsdbar_it_Ic" />
                </div>
                {lsdbarActive === 'chat' ? (
                  <div className="lsdbar_cat_cont">
                    {Array.from(
                      new Map(
                        startedchats.map((chat: any) => [chat.chat_id, chat])
                      ).values()
                    ).map(
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
                            key={chat.chat_id + uuidv4()}
                            onClick={() => {
                              setActiveChat({
                                chat_id: chat.chat_id,
                                name: chat.name,
                                type: 'chat',
                              })
                              fetchPrevChats(chat.chat_id, 'chat')
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
                        fetchRegisteredUsers()
                      }}
                    >
                      <Plus className="pa_plus_Ic" />
                      <span>new chat</span>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <Playarea
            activechat={activechat}
            messages={messages}
            setMessages={setMessages}
            typing={typing}
            myuserid={myuserid}
            handleSendMessage={handleSendMessage}
            messContRef={messContRef}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            viewRightSideBar={viewRightSideBar}
            setViewRightSideBar={setViewRightSideBar}
            profilePicUrl={profilePicUrl}
          />
          <div
            className="rightSidebar"
            style={
              viewRightSideBar.active
                ? { width: viewRightSideBar.width + '%' }
                : { display: 'none' }
            }
          >
            {viewRightSideBar.message !== '' ? (
              <Analysis
                viewRightSideBar={viewRightSideBar}
                setViewRightSideBar={setViewRightSideBar}
                model={model}
                setModel={setModel}
              />
            ) : (
              <Profile
                profilePicUrl={profilePicUrl}
                setProfilePicUrl={setProfilePicUrl}
                model={model}
                setModel={setModel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
