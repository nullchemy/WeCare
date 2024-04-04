import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import session from '../utils/session'

const BotReport = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [chatid, setChatId] = useState<string>('')

  const [pdfData, setPdfData] = useState<any>(null)

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const chat_id = queryParams.get('chat-id')
    setChatId(chat_id as string)
    const generatePdf = () => {
      if (chatid) {
        const auth: any = session.get('auth')
        const token = auth ? JSON.parse(auth)?.token ?? null : null
        fetch('http://localhost:5000/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? 'Bearer ' + token : undefined,
          } as HeadersInit,
          body: JSON.stringify({
            chat_id: chatid,
          }),
        })
          .then((response) => response.blob())
          .then((blob) => {
            // Convert blob to a URL
            const pdfUrl = URL.createObjectURL(blob)
            setPdfData(pdfUrl)
          })
          .catch((error) => {
            console.error('Error generating PDF:', error)
          })
      } else {
        console.log('Error generating Report')
      }
    }

    generatePdf()
  }, [chatid, location.search, navigate])
  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        marginTop: '-2px',
        marginLeft: '-2px',
      }}
    >
      {pdfData && (
        <iframe
          src={pdfData}
          title="Generated PDF"
          width="100%"
          height="100%"
        />
      )}
    </div>
  )
}

export default BotReport
