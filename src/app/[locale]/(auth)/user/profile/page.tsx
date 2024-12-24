import { getCurrentAssignedEquipment } from '@/actions/assignedEquipment';
import { getCurrentEmergencyContact } from '@/actions/emergencyContact';
import { getCurrentUniformSizes } from '@/actions/uniformSizes';
import { getCurrentUser } from '@/actions/user';
import { CompletedApplicationForm } from '@/components/forms/completedApplicationForm';
import { ProfileForm } from '@/components/forms/profileForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

  const [currentSizes, currentEmergencyContact, currentEquipment] = await Promise.all([
    getCurrentUniformSizes(user.id),
    getCurrentEmergencyContact(user.id),
    getCurrentAssignedEquipment(user.id),
  ]);

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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="mt-6">
                View Completed Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  Completed Application for
                  {' '}
                  {user.first_name}
                  {' '}
                  {user.last_name}
                </DialogTitle>
                <DialogDescription>
                  Submitted on
                  {' '}
                  {new Date(user.created_at).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <CompletedApplicationForm user={user} />
            </DialogContent>
          </Dialog>
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
