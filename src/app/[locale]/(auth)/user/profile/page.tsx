import { getCurrentAssignedEquipment } from '@/actions/assignedEquipment';
import { getCurrentEmergencyContact } from '@/actions/emergencyContact';
import { getCurrentUniformSizes } from '@/actions/uniformSizes';
import { getCurrentUser, getUserApplications } from '@/actions/user';
import { CompletedApplicationForm } from '@/components/forms/completedApplicationForm';
import { ProfileForm } from '@/components/forms/profileForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const [currentSizes, currentEmergencyContact, currentEquipment, applications] = await Promise.all([
    getCurrentUniformSizes(user.id),
    getCurrentEmergencyContact(user.id),
    getCurrentAssignedEquipment(user.id),
    getUserApplications(),
  ]);

  const latestApplication = applications[0];

  return (
    <div className="mx-auto px-4 py-8 lg:container">
      <div className="mb-8 flex flex-col justify-between md:flex-row">
        <div className="flex flex-col">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Update your personal information and preferences.
          </p>
        </div>
        <div className="flex flex-col">
          {latestApplication && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="mt-6">
                  View Completed Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
                <DialogHeader className="flex flex-col gap-2">
                  <DialogTitle>
                    Completed Application for
                    {' '}
                    {user.first_name}
                    {' '}
                    {user.last_name}
                  </DialogTitle>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="flex flex-col">
                      Submitted on
                      {' '}
                      {latestApplication?.created_at ? new Date(latestApplication.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex flex-row items-center gap-2">
                      Status:
                      {' '}
                      <Badge variant={
                        latestApplication?.status === 'approved'
                          ? 'success'
                          : latestApplication?.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                      >
                        {latestApplication?.status.charAt(0).toUpperCase() + latestApplication?.status.slice(1) || 'Not submitted'}
                      </Badge>
                    </span>
                  </div>
                </DialogHeader>
                <CompletedApplicationForm
                  user={user}
                  application={latestApplication}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <ProfileForm
        user={user}
        currentSizes={currentSizes}
        currentEmergencyContact={currentEmergencyContact}
        currentEquipment={currentEquipment}
      />
    </div>
  );
}
