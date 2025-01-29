import type { Metadata } from 'next'
import VerifyEmailForm from '@/components/forms/verifyEmailForm'

export const metadata: Metadata = {
  title: 'Verify Email | Mukwonago Police Reserves',
  description: 'Verify your email address to complete your registration'
}

export default function VerifyEmailPage() {
  return (
    <div className='container flex h-screen w-full flex-col items-center justify-center'>
      <VerifyEmailForm />
    </div>
  )
}
