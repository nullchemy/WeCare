import axios, { AxiosResponse } from 'axios'
import session from '../utils/session'

const backend = (): string => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/'
  } else {
    return 'https://nullchemy-api.onrender.com/'
  }
}

const api = async (
  method: string = 'GET',
  slug: string,
  data: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  try {
    const auth: any = session.get('auth')
    const token = auth ? JSON.parse(auth)?.token ?? null : null
    const config = {
      method: method,
      maxBodyLength: Infinity,
      url: backend() + '' + slug,
      headers: {
        ...headers,
        Authorization: token ? 'Bearer ' + token : undefined,
      },
      data: data,
    }
    const res = await axios(config)
    return res
  } catch (error: any) {
    // Handle error response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response)
      return error.response
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.log(error.request)
      return error.response
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)
    return error.response
  }
}

export default api
