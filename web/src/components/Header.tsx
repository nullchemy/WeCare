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
              <Link to="/" className="header_title_link">
                WeCare
              </Link>
            </div>
            <div className="header_right">
              <Link to="/about">About</Link>
              <a
                href="https://denniskibet.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Developer
              </a>
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
