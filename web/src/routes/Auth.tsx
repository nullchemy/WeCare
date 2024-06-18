import React, { Fragment, useEffect, useState } from 'react'
import '../styles/css/auth.css'
import api from '../api/axios'
import session from '../utils/session'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../state/hooks'
import { setIsLogged } from '../state/actions/loggedAction'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import ImageUpload from '../utils/ImageUpload'
import { toast } from 'react-toastify'

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
  const [loading, setLoading] = useState(false)
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
        toast('Passwords do not match.', { type: 'warning' })
        toast('Passwords do not match.', { type: 'warning' })
        return
      }
      // Add your registration logic here
      setLoading(true)
      setLoading(true)
      const res: any = await api('POST', 'auth/register', formData)
      setLoading(false)
      if (res) {
        if (res.status === 201) {
          toast(res.data.message, { type: 'success' })
          //set logged in state
          session.save(JSON.stringify(res.data))
          dispatch(setIsLogged(true))
          setTimeout(() => {
            setUploadImage(true)
          }, 1000)
        } else {
          toast(res.data.message, { type: 'error' })
        }
      } else {
        toast('Something wrong happened! Please retry', { type: 'error' })
        toast('Something wrong happened! Please retry', { type: 'error' })
      }
    } else {
      // Handle login Logic
      try {
        setLoading(true)
        const res: any = await api('POST', 'auth/login', formData)
        console.log(res)
        setLoading(false)
        if (res.status === 200) {
          toast(res.data.message, { type: 'success' })
          let from = location.state?.from?.pathname || '/chat'
          console.log(res.data)
          //set logged in state
          session.save(JSON.stringify(res.data))
          dispatch(setIsLogged(true))
          //redirect user to chatpage
          return navigate(from, { replace: true })
        } else {
          toast(res.data.message, { type: 'error' })
        }
      } catch (error) {
        toast('Something wrong happened! Please retry', { type: 'error' })
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
              <form onSubmit={handleSubmit}>
                {!isRegistering && (
                  <div className="form_group">
                    <input
                      type="text"
                      name="email_or_user_id"
                      placeholder="Email or User ID"
                      value={formData.email_or_user_id}
                      onChange={handleFormChange}
                    />
                  </div>
                )}
                {isRegistering && (
                  <div className="form_group">
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                    />
                  </div>
                )}
                {isRegistering && (
                  <div className="form_group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                )}
                <div className="form_group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleFormChange}
                  />
                </div>
                {isRegistering && (
                  <div className="form_group">
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      value={formData.confirm_password}
                      onChange={handleFormChange}
                    />
                  </div>
                )}
                <button type="submit">
                  {loading ? (
                    <div className="dot-flashing"></div>
                  ) : isRegistering ? (
                    'Register'
                  ) : (
                    'Login'
                  )}
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
