import React, { FC, FormEvent, RefObject } from 'react'
import { ReactComponent as Plus } from '../assets/svg/plus.svg'
import { ReactComponent as Send } from '../assets/svg/send.svg'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import formatTimestamp from '../utils/time'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { v4 as uuidv4 } from 'uuid'

interface ActiveChat {
  chat_id: string
  name: string
}

interface PlayareaProps {
  activechat: ActiveChat
  messages: {}[]
  typing: boolean
  myuserid: string
  handleSendMessage: (e: FormEvent) => void
  messageInput: string
  setMessageInput: (value: string) => void
  messContRef: RefObject<any>
}

const Playarea: FC<PlayareaProps> = ({
  activechat,
  messages,
  typing,
  myuserid,
  handleSendMessage,
  messageInput,
  setMessageInput,
  messContRef,
}) => {
  const myRef = React.createRef<SyntaxHighlighter>()
  return (
    <div className="playarea">
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
            <div className="active_chatee_left">
              <div className="active_chatee_profile">
                <img src={UserPlaceholder} alt="" />
              </div>
              <div className="active_chatee_meta">
                <h2>{activechat.name}</h2>
                <span className="active_chatee_ls">online</span>
              </div>
            </div>
          </div>
          <div className="pa_middle">
            <div className="messplay">
              {messages.map((chat: any) => {
                return chat.sender_id === myuserid ? (
                  <div
                    className="outgoing_message"
                    key={chat.message_id + uuidv4()}
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
                    <div className="in_mess_content">
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
