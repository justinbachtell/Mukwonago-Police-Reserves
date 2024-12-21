import { getCurrentUniformSizes } from '@/actions/uniformSizes';
import { getCurrentUser } from '@/actions/user';
import { ProfileForm } from '@/components/forms/profileForm';
import { UniformSizesForm } from '@/components/forms/uniformSizesForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  /* if (user.position !== 'reserve') {
    redirect('/user/dashboard');
  } */

  const currentSizes = await getCurrentUniformSizes(user.id);
  // const currentAssignedEquipment = await getAssignedEquipment(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Update your personal information and preferences.
        </p>
      </div>
      <ProfileForm user={user} />
      <UniformSizesForm user={user} currentSizes={currentSizes} />
    </div>
  );
}
