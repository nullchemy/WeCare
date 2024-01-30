import React, { Fragment } from 'react'
import '../styles/css/header.css'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <Fragment>
      <div className="header">
        <div className="header_container">
          <div className="header_wrapper">
            <div className="header_left">
              <h2>WeCare</h2>
            </div>
            <div className="header_right">
              <Link to="/auth" className="header_login_btn">
                login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Header
