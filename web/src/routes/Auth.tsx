import React, { Fragment, useEffect, useState } from 'react'
import '../styles/css/auth.css'
import api from '../api/axios'
import session from '../utils/session'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../state/hooks'
import { setIsLogged } from '../state/actions/loggedAction'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import ImageUpload from '../utils/ImageUpload'

const Auth = () => {
  const [isRegistering, setRegistering] = useState(false)
  const [uploadImage, setUploadImage] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    email_or_user_id: '',
    password: '',
    confirm_password: '',
  })
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
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
      if (res) {
        if (res.status === 201) {
          setErr(res.data.message)
          //set logged in state
          session.save(JSON.stringify(res.data))
          dispatch(setIsLogged(true))
          setTimeout(() => {
            setUploadImage(true)
          }, 1000)
        } else {
          setErr(res.data.message)
        }
      } else {
        setErr('Something wrong happened!')
      }
    } else {
      // Handle login Logic
      const res: any = await api('POST', 'auth/login', formData)
      if (res && res.data.status) {
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

  useEffect(() => {
    const uploadfile = async () => {
      setUploading(true)
      const live_profile_url = await ImageUpload(profilePic)
      if (live_profile_url) {
        // set Profile Picture and update database
        const res = await api('PUT', 'updateprofile', { url: live_profile_url })
        console.log(res)
        if (res.status === 200) {
          // save profile pic as cookie
          const auth: any = session.get('auth')
          const meta = auth
            ? { ...JSON.parse(auth), profile_url: live_profile_url }
            : { profile_url: live_profile_url }
          session.save(JSON.stringify(meta))
          setProfilePicUrl(live_profile_url)
          setUploading(false)
        }
      } else {
        setUploading(false)
      }
    }

    uploadfile()
  }, [profilePic])

  console.log(uploading)
  console.log(profilePic)

  return (
    <Fragment>
      <div className="auth">
        <div className="auth-form">
          {!uploadImage ? (
            <div className="auth_details">
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
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                  />
                )}
                {isRegistering && (
                  <input
                    type="email"
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
          ) : (
            <div className="image_upload">
              <h1 className="image_upload_title">set profile picture</h1>
              <div
                className={
                  uploading
                    ? 'profie_picture_wrapper moving-border'
                    : 'profie_picture_wrapper'
                }
              >
                <div
                  className={
                    uploading ? 'profie_picture noborder' : 'profie_picture'
                  }
                >
                  <img
                    className={
                      profilePicUrl !== ''
                        ? 'the_profile_picture m_t_unset'
                        : 'the_profile_picture'
                    }
                    src={profilePicUrl !== '' ? profilePicUrl : UserPlaceholder}
                    alt=""
                  />
                  <input
                    className="profile_picture_file_field"
                    type="file"
                    name="profile_picture"
                    onChange={(e) => {
                      setProfilePic(e.target.files?.[0] || null)
                    }}
                  />
                </div>
              </div>
              <Link to="/chat" className="profile_skip">
                {profilePicUrl === '' ? 'skip' : 'go to chat'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

export default Auth
