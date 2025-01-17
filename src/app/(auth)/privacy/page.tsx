import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Privacy Policy | Mukwonago Police Reserves',
  description:
    'Privacy policy for the Mukwonago Police Reserves application, detailing how we collect, use, and protect your personal information.'
}

export default function PrivacyPolicy() {
  return (
    <div className='container mx-auto min-h-screen px-4 py-8 md:px-6 lg:px-10'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Privacy Policy</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Last updated: January 15, 2024
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          <section>
            <h2 className='mb-3 text-xl font-semibold'>Introduction</h2>
            <p>
              The Mukwonago Police Reserves Program (&quot;we,&quot;
              &quot;our,&quot; or &quot;us&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our website
              and services.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              Information We Collect
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium'>Personal Information</h3>
                <p>
                  We collect information that you provide directly to us,
                  including:
                </p>
                <ul className='mt-2 list-disc pl-6'>
                  <li>Name and contact information</li>
                  <li>Email address</li>
                  <li>Authentication credentials</li>
                  <li>Profile information</li>
                  <li>Training records and certifications</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className='text-lg font-medium'>
                  Automatically Collected Information
                </h3>
                <p>
                  When you use our website, we automatically collect certain
                  information, including:
                </p>
                <ul className='mt-2 list-disc pl-6'>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              How We Use Your Information
            </h2>
            <p>
              We use the collected information for various purposes, including:
            </p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Providing and maintaining our services</li>
              <li>Processing and managing your account</li>
              <li>Communicating with you about updates and changes</li>
              <li>Improving our website and user experience</li>
              <li>Ensuring the security of our services</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>Data Security</h2>
            <p>
              We implement robust security measures to protect your information,
              including:
            </p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Secure authentication through Supabase</li>
              <li>Bot protection and security monitoring with Arcjet</li>
              <li>Error monitoring and logging with Sentry</li>
              <li>Regular security audits and updates</li>
              <li>Encrypted data transmission and storage</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              Data Sharing and Disclosure
            </h2>
            <p>We may share your information with:</p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Law enforcement agencies when required by law</li>
              <li>Service providers who assist in our operations</li>
              <li>Third-party analytics and monitoring services</li>
            </ul>
            <p className='mt-2'>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              Your Rights and Choices
            </h2>
            <p>You have the right to:</p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Access and update your personal information</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
              <li>Manage your cookie preferences</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:{' '}
              <a
                href='mailto:reserves@mukwonagopolice.com'
                className='text-primary hover:underline'
              >
                reserves@mukwonagopolice.com
              </a>
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
