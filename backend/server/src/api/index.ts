import express from 'express'

import MessageResponse from '../interfaces/MessageResponse'
import emojis from './emojis'
import chatbot from '../utils/chatbot'

const router = express.Router()

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  })
})

router.use('/emojis', emojis)
router.use('/chatbot', chatbot)

export default router
