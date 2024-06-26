import React, { FC, useEffect, useState } from 'react'
import '../styles/css/analysis.css'
import { ReactComponent as Arrow } from '../assets/svg/arrow-right.svg'
import api from '../api/axios'
import { toast } from 'react-toastify'
import BarChart from './BarChart'
import Loading from './Loading'

interface AnaProps {
  viewRightSideBar: {
    active: boolean
    width: number
    message: string
  }
  setViewRightSideBar: (value: {
    active: boolean
    width: number
    message: string
  }) => void
  model: string
  setModel: (value: string) => void
}
const Analysis: FC<AnaProps> = ({
  viewRightSideBar,
  setViewRightSideBar,
  model,
  setModel,
}) => {
  const [analsis, setAnalsis] = useState<null | {
    prediction: number
    actual_value: number
    meta_analysis: any[]
  }>(null)
  const [loading, setLoading] = useState(false)
  const fetchAnalysisData = async () => {
    setLoading(true)
    if (viewRightSideBar.message !== '') {
      const res = await api('POST', 'analysis', {
        message: viewRightSideBar.message,
        model: model,
      })
      setLoading(false)
      if (res.status === 200) {
        console.log(res.data)
        setAnalsis(res.data)
      } else {
        toast(res.data.message, { type: 'error' })
      }
    }
  }
  useEffect(() => {
    fetchAnalysisData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewRightSideBar, model])
  return (
    <div className="analysis">
      <Arrow
        className="an_arrow_back"
        onClick={() => {
          setViewRightSideBar({ active: false, width: 0, message: '' })
        }}
      />
      <div className="analysis_model">
        <h2>Model: </h2>
        <form className="analysis_model_form">
          <select
            name="model"
            id="model"
            value={model}
            onChange={(e) => {
              setModel(e.target.value)
            }}
          >
            <option value="electra">ELECTRA</option>
            <option value="bert">BERT</option>
            <option value="cnn">CNN</option>
          </select>
        </form>
      </div>
      <div className="analysis_container">
        <div className="analysis_wrapper">
          <div className="initial_message">
            <span>{viewRightSideBar.message}</span>
          </div>
          {loading ? (
            <div className="analysing_text">
              <Loading />
            </div>
          ) : (
            <div className="analysis_content">
              <div className="analysis_bar_chart">
                {analsis ? (
                  <BarChart
                    data={analsis.meta_analysis}
                    labels={['non-suicidal', 'suicidal']}
                  />
                ) : null}
              </div>
              <div className="analysis_textuals">
                <h1 className="analysis_prediction">
                  Prediction:{' '}
                  <strong>
                    {analsis?.prediction === 1 ? 'Suicidal' : 'non-suicidal'}
                  </strong>
                </h1>
                <h1 className="analysis_prediction">
                  Score: <strong>{analsis?.actual_value}</strong>
                </h1>
                <h1 className="analysis_prediction">
                  Score (%):{' '}
                  <strong>
                    {analsis?.actual_value
                      ? (analsis?.actual_value * 100).toFixed(2) + '%'
                      : null}
                  </strong>
                </h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analysis
