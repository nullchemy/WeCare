import React, { Fragment } from 'react'
import '../styles/css/footer.css'

const Footer = () => {
  return (
    <Fragment>
      <div className="footer">
        <div className="footer_wrapper">
          <p>WeCare - denniskibet &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </Fragment>
  )
}

export default Footer
