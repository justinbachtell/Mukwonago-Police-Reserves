-- Create custom types (enums)
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.availability AS ENUM ('weekdays', 'weekends', 'both', 'flexible');
CREATE TYPE public.completion_status AS ENUM ('completed', 'incomplete', 'excused', 'unexcused');
CREATE TYPE public.equipment_category AS ENUM ('uniform', 'gear', 'communication', 'safety', 'other');
CREATE TYPE public.equipment_condition AS ENUM ('new', 'good', 'fair', 'poor', 'damaged/broken');
CREATE TYPE public.event_type AS ENUM ('school_event', 'community_event', 'fair', 'other');
CREATE TYPE public.position AS ENUM ('candidate', 'officer', 'reserve', 'admin', 'staff');
CREATE TYPE public.prior_experience AS ENUM ('none', 'less_than_1_year', '1_to_3_years', 'more_than_3_years');
CREATE TYPE public.role AS ENUM ('admin', 'member', 'guest');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'denied');

-- Create user table
CREATE TABLE public."user" (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  "position" public.position NOT NULL DEFAULT 'reserve',
  radio_number TEXT,
  "role" public.role NOT NULL DEFAULT 'guest',
  driver_license TEXT,
  driver_license_state TEXT,
  state TEXT,
  street_address TEXT,
  callsign TEXT,
  city TEXT,
  status public.user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  zip_code TEXT
);

-- Create application table
CREATE TABLE public.application (
  id SERIAL PRIMARY KEY,
  availability public.availability NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  driver_license TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  "position" public.position NOT NULL DEFAULT 'reserve',
  prior_experience public.prior_experience NOT NULL,
  resume TEXT,
  state TEXT NOT NULL,
  status public.application_status NOT NULL DEFAULT 'pending',
  street_address TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public."user"(id),
  zip_code TEXT NOT NULL
);

-- Create equipment table
CREATE TABLE public.equipment (
  id SERIAL PRIMARY KEY,
  assigned_to UUID REFERENCES public."user"(id),
  created_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  is_assigned BOOLEAN NOT NULL DEFAULT false,
  is_obsolete BOOLEAN NOT NULL DEFAULT false,
  name TEXT NOT NULL,
  notes TEXT,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  serial_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create assigned_equipment table
CREATE TABLE public.assigned_equipment (
  id SERIAL PRIMARY KEY,
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  condition public.equipment_condition NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  equipment_id INTEGER NOT NULL REFERENCES public.equipment(id),
  expected_return_date TIMESTAMP,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public."user"(id)
);

-- Create emergency_contact table
CREATE TABLE public.emergency_contact (
  id SERIAL PRIMARY KEY,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  first_name TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT true,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  state TEXT,
  street_address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public."user"(id),
  zip_code TEXT
);

-- Create events table
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type public.event_type NOT NULL DEFAULT 'community_event',
  event_location TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_end_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event_assignments table
CREATE TABLE public.event_assignments (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.events(id),
  user_id UUID NOT NULL REFERENCES public."user"(id),
  completion_status public.completion_status,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_assignment_event_user UNIQUE (event_id, user_id)
);

-- Create policies table
CREATE TABLE public.policies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_url TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create policy_completion table
CREATE TABLE public.policy_completion (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER NOT NULL REFERENCES public.policies(id),
  user_id UUID NOT NULL REFERENCES public."user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create training table
CREATE TABLE public.training (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  training_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  training_location TEXT NOT NULL,
  training_type TEXT NOT NULL,
  training_instructor UUID NOT NULL REFERENCES public."user"(id),
  training_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  training_end_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create training_assignments table
CREATE TABLE public.training_assignments (
  id SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES public.training(id),
  user_id UUID NOT NULL REFERENCES public."user"(id),
  completion_status public.completion_status,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT training_assignment_training_user UNIQUE (training_id, user_id)
);

-- Create uniform_sizes table
CREATE TABLE public.uniform_sizes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  pant_size VARCHAR(10) NOT NULL,
  shirt_size VARCHAR(10) NOT NULL,
  shoe_size VARCHAR(10) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public."user"(id)
);

-- Enable RLS on all tables
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uniform_sizes ENABLE ROW LEVEL SECURITY; 