'use client'

import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { Button } from './button'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface PDFViewerProps {
  url: string
  className?: string
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1.5)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    setLoading(false)
  }

  return (
    <div className='h-[calc(90vh-8rem)]'>
      <div className='flex items-center justify-center gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setScale(s => Math.max(s - 0.2, 0.8))}
        >
          <ZoomOut className='mr-2 size-4' />
          Zoom Out
        </Button>
        <span className='text-sm font-medium'>{Math.round(scale * 100)}%</span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setScale(s => Math.min(s + 0.2, 3))}
        >
          <ZoomIn className='mr-2 size-4' />
          Zoom In
        </Button>
      </div>

      <div className='h-[calc(100%-8rem)] overflow-y-auto'>
        {loading && (
          <div className='flex items-center justify-center p-4'>
            <Loader2 className='size-6 animate-spin' />
          </div>
        )}
        <div className='flex justify-center'>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className='py-4'
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer
              renderAnnotationLayer
              loading={null}
              scale={scale}
              className='mb-4 shadow-lg'
            />
          </Document>
        </div>
      </div>

      <div className='flex items-center justify-center gap-4 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className='size-4' />
        </Button>
        <span className='text-sm font-medium'>
          Page {pageNumber} of {numPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPageNumber(page => Math.min(page + 1, numPages))}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  )
}
