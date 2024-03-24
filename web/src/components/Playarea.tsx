import React, { FC, FormEvent, RefObject, useEffect, useState } from 'react'
import { ReactComponent as Plus } from '../assets/svg/plus.svg'
import { ReactComponent as Send } from '../assets/svg/send.svg'
import { ReactComponent as Ellipsis } from '../assets/svg/ellipsis-vertical.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import formatTimestamp from '../utils/time'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { v4 as uuidv4 } from 'uuid'
import api from '../api/axios'
import { toast } from 'react-toastify'

interface ActiveChat {
  chat_id: string
  name: string
}

interface PlayareaProps {
  activechat: ActiveChat
  messages: {}[]
  setMessages: (value: {}[]) => void
  typing: boolean
  myuserid: string
  handleSendMessage: (e: FormEvent) => void
  messageInput: string
  setMessageInput: (value: string) => void
  messContRef: RefObject<any>
  viewRightSideBar: { active: boolean; width: number; message: string }
  setViewRightSideBar: (value: {
    active: boolean
    width: number
    message: string
  }) => void
  profilePicUrl: string
}

const Playarea: FC<PlayareaProps> = ({
  activechat,
  messages,
  setMessages,
  typing,
  myuserid,
  handleSendMessage,
  messageInput,
  setMessageInput,
  messContRef,
  viewRightSideBar,
  setViewRightSideBar,
  profilePicUrl,
}) => {
  const myRef = React.createRef<SyntaxHighlighter>()
  const [togglechateepop, setToggleChateePop] = useState<boolean>(false)
  useEffect(() => {
    messContRef.current?.scrollIntoView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    messContRef.current?.scrollIntoView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (messageInput !== '') {
        handleSendMessage(event)
      }
    }
  }
  const clearChat = async () => {
    const res = await api('POST', 'clearchat', { chatid: activechat.chat_id })
    if (res.status === 200) {
      toast('Chats cleared', { type: 'info' })
      setMessages([])
    } else {
      toast('Failed to clear Chats! retry', { type: 'error' })
    }
  }

  console.log(viewRightSideBar)

  return (
    <div
      className="playarea"
      style={viewRightSideBar.message !== '' ? { width: '0px' } : {}}
    >
      {activechat.chat_id === '' ? (
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
            <div
              className="active_chatee_left"
              onClick={() => {
                setViewRightSideBar({
                  active: !viewRightSideBar.active,
                  width: 23,
                  message: '',
                })
              }}
            >
              <div className="active_chatee_profile">
                {/* <img src={UserPlaceholder} alt="" /> */}
                {profilePicUrl !== '' ? (
                  <img src={profilePicUrl} alt="" />
                ) : (
                  <img
                    src={UserPlaceholder}
                    style={{ marginTop: '5px' }}
                    alt=""
                  />
                )}
              </div>
              <div className="active_chatee_meta">
                <h2>{activechat.name}</h2>
                <span className="active_chatee_ls">online</span>
              </div>
            </div>
            <div className="active_chatee_right">
              <Ellipsis
                className="three_vertical_dots"
                onClick={() => {
                  setToggleChateePop(!togglechateepop)
                }}
              />
            </div>
            <div
              className={
                togglechateepop
                  ? 'active_chatee_pop_up'
                  : 'active_chatee_pop_up hide'
              }
              onClick={() => {
                setToggleChateePop(!togglechateepop)
                clearChat()
              }}
            >
              <ul>
                <li>clear chat</li>
              </ul>
            </div>
          </div>
          <div className="pa_middle">
            <div className="messplay">
              {messages.map((chat: any) => {
                return chat.sender_id === myuserid ? (
                  <div
                    className="outgoing_message"
                    key={chat.message_id + uuidv4()}
                    onClick={() => {
                      setViewRightSideBar({
                        active: true,
                        width: 77,
                        message: chat.message,
                      })
                    }}
                  >
                    <div className="out_mess_content">
                      <div className="out_mess_meta">
                        <span className="out_mess_time">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                      </div>
                      <div className="outgoing_cont_message">
                        <span className="out_th_content">
                          <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                            className="r_blg_body__content"
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || ''
                                )
                                return match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    ref={myRef}
                                    children={String(children).replace(
                                      /\n$/,
                                      ''
                                    )}
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                  />
                                ) : (
                                  <code {...props} className={className}>
                                    {children}
                                  </code>
                                )
                              },
                              a: (props: any) => {
                                const isPhoneNumber = /^\d{10}$/.test(
                                  props.href
                                )
                                const target = props.href.startsWith('tel:')
                                  ? '_self'
                                  : '_blank'

                                if (isPhoneNumber) {
                                  return (
                                    <a
                                      href={`tel:${props.href}`}
                                      style={{
                                        textDecoration: 'unset',
                                        color: 'blue !important',
                                      }}
                                    >
                                      {props.children}
                                    </a>
                                  )
                                }

                                return (
                                  <a
                                    href={props.href}
                                    target={target}
                                    rel="noopener noreferrer"
                                  >
                                    {props.children}
                                  </a>
                                )
                              },
                            }}
                          >
                            {chat.message}
                          </ReactMarkdown>
                        </span>
                      </div>
                    </div>
                    <div className="out_mess_sender_profile">
                      <img src={UserPlaceholder} alt="" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="incoming_message"
                    key={chat.message_id + uuidv4()}
                  >
                    <div className="in_mess_sender_profile">
                      <img src={UserPlaceholder} alt="" />
                    </div>
                    <div
                      className={
                        chat.level === 'helpline_message'
                          ? 'in_mess_content helpline_message'
                          : 'in_mess_content'
                      }
                    >
                      <div className="inc_mess_meta">
                        <span className="inc_sender_name">
                          {activechat.name}
                        </span>
                        <span className="inc_mess_misc">{chat.level}</span>
                        <span className="inc_mess_time">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                      </div>
                      <div className="incoming_cont_message">
                        <span className="inc_th_content">
                          <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                            className="r_blg_body__content"
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || ''
                                )
                                return match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    ref={myRef}
                                    children={String(children).replace(
                                      /\n$/,
                                      ''
                                    )}
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                  />
                                ) : (
                                  <code {...props} className={className}>
                                    {children}
                                  </code>
                                )
                              },
                            }}
                          >
                            {chat.message}
                          </ReactMarkdown>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
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
            <div></div>
            <span className="messplay_sec_info">
              Messages are end-to-end encrypted. No one outside this chat, not
              even WeCare, can read or listen to them. Click to learn more
            </span>
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
                    onKeyDown={handleKeyDown}
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
  )
}

export default Playarea
