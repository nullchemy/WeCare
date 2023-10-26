import Cookies from 'js-cookie'

const saveConfirmMail = (email: string) => {
  Cookies.set('em', email, { expires: 7 })
}

const getConfirmEmail = () => {
  return {
    email: Cookies.get('em'),
  }
}

const savesession = (sessionid: object) => {
  Cookies.set('auth', JSON.stringify(sessionid), { expires: 7 })
}

const getsession = () => {
  return {
    authToken: Cookies.get('auth'),
  }
}

const destroysession = () => {
  Cookies.remove('auth')
}

const session = {
  saveem: saveConfirmMail,
  getem: getConfirmEmail,
  save: savesession,
  get: getsession,
  destroy: destroysession,
}

export default session
