import React, { useEffect, useState } from 'react'
import UserPlaceholder from '../assets/images/icons8-user-80.png'
import ImageUpload from '../utils/ImageUpload'
import api from '../api/axios'
import '../styles/css/imageupload.css'

interface ImgUpload {
  profilePicUrl: string
  setProfilePicUrl: React.Dispatch<React.SetStateAction<string>>
}

const UploadImage = ({ profilePicUrl, setProfilePicUrl }: ImgUpload) => {
  const [uploading, setUploading] = useState(false)
  const [profilePic, setProfilePic] = useState<File | null>(null)

  useEffect(() => {
    const uploadfile = async () => {
      setUploading(true)
      const live_profile_url = await ImageUpload(profilePic)
      if (live_profile_url) {
        // set Profile Picture and update database
        const res = await api('PUT', 'updateprofile', {
          url: live_profile_url,
        })
        console.log(res)
        if (res.status === 200) {
          setProfilePicUrl(live_profile_url)
          setUploading(false)
        }
      } else {
        setUploading(false)
      }
    }

    uploadfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilePic])
  return (
    <div>
      {' '}
      <div
        className={
          uploading
            ? 'profie_picture_wrapper moving-border'
            : 'profie_picture_wrapper'
        }
      >
        <div
          className={uploading ? 'profie_picture noborder' : 'profie_picture'}
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
    </div>
  )
}

export default UploadImage
