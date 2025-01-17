import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service | Mukwonago Police Reserves',
  description:
    'Terms of Service for the Mukwonago Police Reserves application, outlining the rules, guidelines, and legal terms for using our services.'
}

export default function TermsOfService() {
  return (
    <div className='container mx-auto min-h-screen px-4 py-8 md:px-6 lg:px-10'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Terms of Service</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Last updated: January 15, 2024
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Mukwonago Police Reserves website and
              services (&quot;Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you disagree with any
              part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>2. Eligibility</h2>
            <p>To use the Service, you must:</p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Be at least 18 years old</li>
              <li>Be a legal resident of the United States</li>
              <li>Have no felony convictions</li>
              <li>
                Meet all requirements specified in the application process
              </li>
              <li>Complete all required background checks and screenings</li>
              <li>
                Maintain compliance with all police reserve program requirements
              </li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              3. Account Registration and Security
            </h2>
            <div className='space-y-4'>
              <p>
                When creating an account, you must provide accurate and complete
                information. You are responsible for:
              </p>
              <ul className='list-disc pl-6'>
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>Immediately notifying us of any unauthorized use</li>
                <li>Ensuring your contact information is up to date</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>4. Code of Conduct</h2>
            <p>As a user of the Service, you agree not to:</p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Violate any laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Share confidential police or department information</li>
              <li>Post inappropriate, false, or misleading content</li>
              <li>Interfere with the security features of the Service</li>
              <li>Use the Service for unauthorized commercial purposes</li>
              <li>Share access to your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              5. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by the Village of Mukwonago Police Department and are
              protected by international copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              6. Training and Certification
            </h2>
            <div className='space-y-4'>
              <p>Users must:</p>
              <ul className='list-disc pl-6'>
                <li>Complete all required training programs</li>
                <li>Maintain current certifications</li>
                <li>Document all training activities accurately</li>
                <li>Participate in ongoing professional development</li>
                <li>Meet minimum service hour requirements</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              7. Service Modifications
            </h2>
            <p>
              We reserve the right to modify or discontinue the Service at any
              time, with or without notice. We shall not be liable to you or any
              third party for any modification, suspension, or discontinuance of
              the Service.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              8. Data Usage and Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. By
              using the Service, you consent to our collection and use of
              information as detailed in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason,
              including:
            </p>
            <ul className='mt-2 list-disc pl-6'>
              <li>Violation of these Terms</li>
              <li>Failure to meet program requirements</li>
              <li>Conduct unbecoming of a police reserve officer</li>
              <li>Criminal activity or investigations</li>
              <li>Extended periods of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>
              10. Limitation of Liability
            </h2>
            <p>
              The Village of Mukwonago Police Department shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages resulting from your use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Wisconsin, without regard to its conflict
              of law provisions.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>12. Changes to Terms</h2>
            <p>
              We reserve the right to update or change these Terms at any time.
              We will notify you of any changes by posting the new Terms on this
              page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-xl font-semibold'>13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{' '}
              <a
                href='mailto:reserves@mukwonagopolice.com'
                className='text-primary hover:underline'
              >
                reserves@mukwonagopolice.com
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
