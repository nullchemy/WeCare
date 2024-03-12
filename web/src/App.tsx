import React, { Fragment } from 'react'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <Fragment>
      <div className="app">
        <ToastContainer />
        <Routes />
      </div>
    </Fragment>
  )
}

export default App
