import React, { useRef, useEffect } from 'react'
import Chart from 'chart.js/auto'

interface BarChartProps {
  data: number[]
  labels: string[]
}

const BarChart: React.FC<BarChartProps> = ({ data, labels }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Suicidal Analysis',
                data: data,
                backgroundColor: [
                  'rgba(99, 255, 182, 0.6)',
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(255, 205, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(201, 203, 207, 0.2)',
                ],
                borderColor: [
                  'rgba(99, 255, 182)',
                  'rgb(255, 99, 132)',
                  'rgb(255, 159, 64)',
                  'rgb(255, 205, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(54, 162, 235)',
                  'rgb(153, 102, 255)',
                  'rgb(201, 203, 207)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels])

  return <canvas className="dashlnchart" ref={canvasRef} />
}

export default BarChart
