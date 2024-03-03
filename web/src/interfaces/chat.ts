export interface Auth {
  message: string
  meta: {
    email: string
    full_name: string
    user_id: string
    profile_url: string
  }
  status: boolean
  token: string
}

export interface ActiveChat {
  chat_id: string
  name: string
  type: string
}

export interface Bot {
  botname: string
  bot_id: string
}

export interface StartedChats {
  chat_id: string
  name: string
  last_message: string
  unread_messages: number
  profile_url: string
  last_seen: string
  timestamp: string
}

export interface Messages {}

export interface StateTypes {
  auth: Auth
  activechat: ActiveChat
  lsdbarActive: string
  newchatdrawer: boolean
  messages: {}[]
  messageInput: string
  typing: boolean
  socket: any
  newbot: boolean
  botname: string
  bots: []
  regusers: []
  startedchats: StartedChats[]
  messContRef: any
  myuserid: string
}
