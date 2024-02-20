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
