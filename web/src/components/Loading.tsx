import React from 'react'
import '../styles/css/loader.css'

const Loading = () => {
  return (
    <div>
      <div className="showcasecontloading">
        <div className="c-skeleton-square" />
        <div className="c-item__right">
          <div className="c-skeleton-line" />
          <div className="c-skeleton-line" />
          <div className="c-skeleton-line" />
          <div className="c-skeleton-line" />
        </div>
      </div>
    </div>
  )
}

export default Loading
