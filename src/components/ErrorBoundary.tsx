'use client'

import * as Sentry from '@sentry/nextjs'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)

    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: 'ErrorBoundary catch'
      }
    })

    toast.error('Something went wrong. Please try again.')
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='p-4 text-center'>
            <h2 className='text-lg font-semibold text-red-600'>
              Something went wrong
            </h2>
            <button
              type='button'
              className='mt-2 text-blue-600 hover:underline'
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
