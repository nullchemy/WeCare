import React, { Fragment } from 'react'
import '../styles/css/home.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Landing from '../components/Landing'

const Home = () => {
  return (
    <Fragment>
      <div className="home">
        <Header />
        <Landing />
        <Footer />
      </div>
    </Fragment>
  )
}

export default Home
