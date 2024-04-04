import { useCallback, useEffect, useState } from 'react'
import { useResizeObserver } from '@wojtekmaj/react-hooks'
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { ReactComponent as Arrow } from '../assets/svg/arrow-right.svg'

import '../styles/css/pdfreport.css'
import pdfreport from '../data/pdf/report.pdf'

import type { PDFDocumentProxy } from 'pdfjs-dist'
import Header from '../components/Header'
import Footer from '../components/Footer'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
}

const resizeObserverOptions = {}

const maxWidth = 1000

export default function Report() {
  const [numPages, setNumPages] = useState<number>()
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()
  const [isVisible, setIsVisible] = useState(false)

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries

    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useResizeObserver(containerRef, resizeObserverOptions, onResize)

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollThreshold = 200
      setIsVisible(scrollTop > scrollThreshold)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="report_pdf">
      <Header />
      <div className="report_pdf__container">
        <div className="report_pdf__container__document" ref={setContainerRef}>
          <Document
            file={pdfreport}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
              />
            ))}
          </Document>
        </div>
      </div>
      {isVisible && (
        <div
          className="report_pdf_scroll_to_top"
          onClick={() => {
            window.scrollTo(0, 0)
          }}
        >
          <Arrow className="report_pdf_scroll_to_top_ic" />
        </div>
      )}
      <Footer />
    </div>
  )
}
