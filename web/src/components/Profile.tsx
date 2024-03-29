import React, { FC } from 'react'
import '../styles/css/profile.css'
import UploadImage from './UploadImage'
import { ReactComponent as Pen } from '../assets/svg/pen.svg'
import { Link } from 'react-router-dom'
import Footer from './Footer'

interface ProfTypes {
  profilePicUrl: string
  setProfilePicUrl: React.Dispatch<React.SetStateAction<string>>
  model: string
  setModel: (value: string) => void
}

const Profile: FC<ProfTypes> = ({
  profilePicUrl,
  setProfilePicUrl,
  model,
  setModel,
}) => {
  return (
    <div className="user_profile">
      <UploadImage
        profilePicUrl={profilePicUrl}
        setProfilePicUrl={setProfilePicUrl}
      />
      <div className="user_profile_container">
        <div className="user_profile_wrapper">
          <div className="user_profile_name">
            <form className="user_profile_name_form">
              <input
                className="user_profile_update_name"
                type="text"
                value="kibet"
              />
              <Pen className="user_profile_name_edit" />
            </form>
          </div>
          <div className="user_profile_model_selection">
            <h3>Model: </h3>
            <form className="user_profile_model_form">
              <select
                name="model"
                id="model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value)
                }}
              >
                <option value="electra">ELECTRA</option>
                <option value="bert">BERT</option>
                <option value="cnn">CNN</option>
              </select>
            </form>
          </div>
          <div className="user_profile_information">
            <h2 className="user_profile_information_title">Info</h2>
            <p className="user_profile_info_generative">
              Predictions from the suicidal model may sometimes be inaccurate
            </p>
            <Link to="/about" className="user_profile_lnk">
              Read More
            </Link>
          </div>
        </div>
      </div>
      <div className="user_profile_footer">
        <Footer />
      </div>
    </div>
  )
}

export default Profile
