import React, { Fragment } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Landing from '../components/Landing'

const Home = () => {
  return (
    <Fragment>
      <div className="Home">
        <Header />
        <Landing />
        <Footer />
      </div>
    </Fragment>
  )
}

export default Home
