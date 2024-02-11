import React, { Fragment, useState } from 'react'
import '../styles/css/auth.css'
import api from '../api/axios'
import session from '../utils/session'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../state/hooks'
import { setIsLogged } from '../state/actions/loggedAction'

const Auth = () => {
  const [isRegistering, setRegistering] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    email_or_user_id: '',
    password: '',
    confirm_password: '',
  })
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  let location = useLocation()
  const dispatch = useAppDispatch()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Client-side validation can be added here

    if (isRegistering) {
      // Handle registration
      if (formData.password !== formData.confirm_password) {
        setErr('Passwords do not match.')
        return
      }
      // Add your registration logic here
      const res: any = await api('POST', 'auth/register', formData)
      if (res.data.status) {
        setErr('')
      } else {
        setErr(res.data.message)
      }
    } else {
      // Handle login Logic
      const res: any = await api('POST', 'auth/login', formData)
      if (res.data.status) {
        setErr('')
        let from = location.state?.from?.pathname || '/chat'
        console.log(res.data)
        //set logged in state
        session.save(JSON.stringify(res.data))
        dispatch(setIsLogged(true))
        //redirect user to chatpage
        return navigate(from, { replace: true })
      } else {
        setErr(res.data.message)
      }
    }
  }
  return (
    <Fragment>
      <div className="auth">
        <div className="auth-form">
          <h2>{isRegistering ? 'Register' : 'Login'}</h2>
          <p className="error_info">{err}</p>
          <form onSubmit={handleSubmit}>
            {!isRegistering && (
              <input
                type="text"
                name="email_or_user_id"
                placeholder="Email or User ID"
                value={formData.email_or_user_id}
                onChange={handleFormChange}
              />
            )}
            {isRegistering && (
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
              />
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleFormChange}
            />
            {isRegistering && (
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleFormChange}
              />
            )}
            <button type="submit">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => setRegistering(!isRegistering)}>
                Login here.
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <span onClick={() => setRegistering(!isRegistering)}>
                Register here.
              </span>
            </p>
          )}
        </div>
      </div>
    </Fragment>
  )
}

export default Auth
