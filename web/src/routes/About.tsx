import React from 'react'
import '../styles/css/about.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ReactComponent as Send } from '../assets/svg/arrow-up-right-from-square.svg'

const About = () => {
  return (
    <div className="about">
      <Header />
      <div className="about_container">
        <div className="about_wrapper">
          <h2 className="about_header_title">About WeCare</h2>
          <p className="about_paragraphs">
            Created by{' '}
            <a
              href="https://github.com/DennisRono"
              rel="noopener noreferrer"
              target="_blank"
            >
              Dennis Kibet <Send className="sendicon" />
            </a>
          </p>
          <p className="about_paragraphs">
            This project aims to automate{' '}
            <strong>depression and suicidal intent detection</strong> using
            machine learning algorithms specifically the{' '}
            <strong>Transformer ELECTRA algorithm.</strong>
          </p>
          <h3 className="abt_sub_title">
            Suicidal and Depression Detection in Kenya
          </h3>
          <p className="about_paragraphs">
            Like many countries, Kenya faces a concerning issue regarding
            suicide and depression detection. The World Health Organization
            (WHO) reported in 2016 that suicide is a significant public health
            concern, with an estimated 4.6 suicides per 100,000 population.
            Efforts are being made to improve detection and intervention.
            According to Dr. Rachna Patel, a mental health expert, "Early
            recognition of warning signs and accessible mental health services
            are crucial in preventing suicides" (Patel, 2019). In Kenya,
            organizations such as the Kenyan Mental Health Taskforce have been
            advocating for improved mental health services and awareness. Their
            report, published in 2015, emphasizes the need to integrate mental
            health services into the primary healthcare system and increase
            mental health literacy in communities. Additionally, initiatives
            like the Africa Mental Health Research and Training Foundation
            (AMHRTF) work towards enhancing mental health research and training
            in the country to aid in early detection and effective intervention
            (AMHRTF, n.d.). Collaborative efforts from both governmental and
            non-governmental sectors are essential to address this critical
            issue and create a supportive environment for those affected by
            depression and suicidal thoughts.
          </p>
          <h3 className="abt_sub_title">Model Selection</h3>
          <table className="abt_table">
            <thead>
              <tr>
                <th>
                  <strong>Best Models</strong>
                </th>
                <th>
                  <strong>Accuracy</strong>
                </th>
                <th>
                  <strong>Recall</strong>
                </th>
                <th>
                  <strong>Precision</strong>
                </th>
                <th>
                  <strong>F1 Score</strong>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Logistic Regression </td>
                <td>0.9111</td>
                <td>0.8870</td>
                <td>0.8832</td>
                <td>0.8851</td>
              </tr>
              <tr>
                <td>Convolutional Neural Network (CNN)</td>
                <td>0.9285</td>
                <td>0.9013</td>
                <td>0.9125</td>
                <td>0.9069</td>
              </tr>
              <tr>
                <td>Long Short-Term Memory Network (LSTM)</td>
                <td>0.9260</td>
                <td>0.8649</td>
                <td>0.9386</td>
                <td>0.9003</td>
              </tr>
              <tr>
                <td>BERT</td>
                <td>0.9757</td>
                <td>0.9669</td>
                <td>0.9701</td>
                <td>0.9685</td>
              </tr>
              <tr>
                <td>ELECTRA</td>
                <td>0.9792</td>
                <td>0.9788</td>
                <td>0.9677</td>
                <td>0.9732</td>
              </tr>
            </tbody>
          </table>
          <p className="about_paragraphs">
            The baseline model is <strong>ELECTRA</strong>, it is selected as it
            has the highest F1 score of 0.9732
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About
