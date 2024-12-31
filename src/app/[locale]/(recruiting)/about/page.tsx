import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Badge, Building2, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-16 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            About Our Police Reserves
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            The Village of Mukwonago Police Reserves is a vital part of our law enforcement
            community, supporting the Police Department in maintaining public safety and community
            service.
          </p>
        </div>
      </div>

      {/* Department Info */}
      <div className="bg-white py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-8">
              <Building2 className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Our Department
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                The Mukwonago Police Department serves a population of over 8,000 residents across
                approximately 8.2 square miles. Our department consists of dedicated full-time
                officers, supported by our reserve officers who help maintain 24/7 police
                protection.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Located at 627 S Rochester Street, our department is committed to providing
                professional law enforcement services to our community.
              </p>
            </Card>

            <Card className="p-8">
              <Badge className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Reserve Program
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Our Police Reserves program offers a unique opportunity for community members to
                serve alongside full-time officers. Reserve officers assist with:
              </p>
              <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Patrol duties</li>
                <li>Special events and crowd control</li>
                <li>Traffic control and direction</li>
                <li>Community outreach programs</li>
                <li>Emergency response support</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Requirements & Expectations
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <Clock className="mb-4 size-8 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Time Commitment
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reserve officers are expected to serve a minimum number of hours monthly and attend
                regular training sessions to maintain their skills and certifications.
              </p>
            </Card>

            <Card className="p-6">
              <Shield className="mb-4 size-8 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Qualifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Candidates must be at least 18 years old, pass a background check, complete required
                training, and demonstrate good moral character and judgment.
              </p>
            </Card>

            <Card className="p-6">
              <Users className="mb-4 size-8 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Team Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reserve officers work closely with full-time officers and must maintain professional
                standards while representing the department.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-20">
        <Card className="rounded-2xl bg-blue-700 p-12 text-center dark:bg-blue-800">
          <h2 className="mb-4 text-3xl font-bold text-white">Join Our Team</h2>
          <p className="mx-auto mb-8 max-w-2xl text-blue-100">
            If you're interested in serving your community and gaining valuable law enforcement
            experience, we encourage you to apply to our Police Reserves program.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              variant="secondary"
              className="rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100"
            >
              <Link href="/application">
                Apply Now
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100"
            >
              <Link href="tel:2623632400">Contact Us</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
