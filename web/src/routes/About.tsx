import React from 'react'
import '../styles/css/about.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

const About = () => {
  return (
    <div className="about">
      <Header />
      <div className="about_container">
        <div className="about_wrapper">
          <h2 className="about_header_title">About WeCare</h2>
          <p className="about_paragraphs">
            Wecare is a chatbot application for suicidal detection and support.
          </p>
          <p className="about_paragraphs">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus autem
            impedit, quo harum et necessitatibus eaque aspernatur qui, quisquam
            reprehenderit nam. Minus, ratione. Inventore officiis, accusamus
            quas unde cumque voluptatibus!
          </p>
          <p className="about_paragraphs">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus autem
            impedit, quo harum et necessitatibus eaque aspernatur qui, quisquam
            reprehenderit nam. Minus, ratione. Inventore officiis, accusamus
            quas unde cumque voluptatibus!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About
