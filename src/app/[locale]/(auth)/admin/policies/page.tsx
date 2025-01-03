import { getAllPolicies } from '@/actions/policy'
import { PoliciesClient } from '@/components/admin/policies/PoliciesClient'

export default async function AdminPoliciesPage() {
  const policies = await getAllPolicies()
  return <PoliciesClient policies={policies} />
}
