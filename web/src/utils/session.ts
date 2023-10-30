import Cookies from 'js-cookie'

const saveConfirmMail = (email: string) => {
  Cookies.set('em', email, { expires: 7 })
}

const getConfirmEmail = () => {
  return {
    email: Cookies.get('em'),
  }
}

const savesession = (session: string) => {
  Cookies.set('auth', session, { expires: 7 })
}

const getsession = (cookie: string) => {
  return {
    auth: Cookies.get(cookie),
  }
}

const destroysession = (cookie: string) => {
  Cookies.remove(cookie)
}

const session = {
  saveem: saveConfirmMail,
  getem: getConfirmEmail,
  save: savesession,
  get: getsession,
  destroy: destroysession,
}

export default session
