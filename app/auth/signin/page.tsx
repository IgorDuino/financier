import { SignIn } from '@/components/auth/sign-in'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Financer',
  description: 'Sign in to your Financer account',
}

export default function SignInPage() {
  return (
    <div className="container mx-auto">
      <SignIn />
    </div>
  )
} 