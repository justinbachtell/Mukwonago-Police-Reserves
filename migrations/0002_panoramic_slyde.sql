-- First, update any existing policy_type values to match the enum values
UPDATE policies 
SET policy_type = 'other'
WHERE policy_type NOT IN (
  'introduction',
  'rules_and_job_descriptions',
  'personnel',
  'arrests_and_enforcement',
  'use_of_force',
  'patrol',
  'administrative',
  'police_records',
  'equipment',
  'investigations',
  'special_circumstances',
  'community_and_community_relations',
  'other'
);

-- Then alter the column type with an explicit cast
ALTER TABLE "policies" ALTER COLUMN "policy_type" TYPE policy_type USING policy_type::policy_type;