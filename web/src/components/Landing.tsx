import React from 'react'
import '../styles/css/landing.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { particles_options } from '../data/particles_options'
import {
  Container,
  IOptions,
  RecursivePartial,
} from '@tsparticles/engine/types/export-types'

const Landing = () => {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = async (container?: Container) => {
    console.log(container)
  }
  return (
    <div className="landing">
      <div className="landing_container">
        <div className="landing_wrapper">
          <div className="landing_relative">
            <div className="landing_particles">
              {init && (
                <Particles
                  id="tsparticles"
                  particlesLoaded={particlesLoaded}
                  options={
                    particles_options as unknown as RecursivePartial<IOptions>
                  }
                />
              )}
            </div>
            <div className="landing_center_wrap">
              <h1 className="landing_eye_catch_txt">
                WeCare <br />
                <span className="landing_rolling_keywords">
                  <span className="landing_keyword">Mental Health</span>
                  <span className="landing_keyword">&amp;</span>
                  <span className="landing_keyword">Suicidal Detection</span>
                </span>
                chat-app
              </h1>
              <p className="landing_intro_explainer">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo a
                nesciunt voluptatem aut in aspernatur ipsum natus, neque amet
                nemo eos iure mollitia saepe fugiat.
              </p>
              <Link className="landing_cta_btn" to="/chat">
                get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
