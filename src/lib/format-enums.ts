/**
 * Formats enum values into human-readable text
 * Example: "community_event" -> "Community Event"
 */
export function formatEnumValue(value: string): string {
  // Handle empty or null values
  if (!value) {
    return ''
  }

  // Split by underscore and capitalize each word
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Maps specific enum values to custom display text
 */
const enumDisplayMap: Record<string, string> = {
  // User roles
  admin: 'Administrator',
  member: 'Member',
  guest: 'Guest',

  // User positions
  candidate: 'Candidate',
  officer: 'Officer',
  reserve: 'Reserve',
  staff: 'Staff',

  // User status
  active: 'Active',
  inactive: 'Inactive',
  denied: 'Denied',

  // Application status
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',

  // Equipment condition
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  'damaged/broken': 'Damaged/Broken',

  // Prior experience
  none: 'None',
  less_than_1_year: 'Less than 1 Year',
  '1_to_3_years': '1-3 Years',
  more_than_3_years: 'More than 3 Years',

  // Availability
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  both: 'Both',
  flexible: 'Flexible',

  // Equipment category and general
  uniform: 'Uniform',
  gear: 'Gear',
  communication: 'Communication',
  safety: 'Safety',
  other: 'Other', // Used for both equipment category and event types

  // Completion status
  completed: 'Completed',
  incomplete: 'Incomplete',
  excused: 'Excused',
  unexcused: 'Unexcused',

  // Event types
  school_event: 'School Event',
  community_event: 'Community Event',
  training_event: 'Training Event',

  // Training types
  firearms: 'Firearms',
  defensive_tactics: 'Defensive Tactics',
  emergency_vehicle_operations: 'Emergency Vehicle Operations',
  first_aid: 'First Aid',
  legal_updates: 'Legal Updates'
}

/**
 * Formats enum values with custom mappings
 * Falls back to basic formatting if no custom mapping exists
 */
export function formatEnumValueWithMapping(value: string): string {
  // Handle empty or null values
  if (!value) {
    return ''
  }

  // Check for custom mapping
  const customDisplay = enumDisplayMap[value.toLowerCase()]
  if (customDisplay) {
    return customDisplay
  }

  // Fall back to basic formatting
  return formatEnumValue(value)
}
