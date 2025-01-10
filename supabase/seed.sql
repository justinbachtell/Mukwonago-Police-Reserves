-- First, create users in auth.users
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password)
VALUES
('d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'john.smith@mpd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"John","last_name":"Smith"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'sarah.jones@mpd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Sarah","last_name":"Jones"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', 'mike.wilson@mpd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Mike","last_name":"Wilson"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'lisa.brown@mpd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Lisa","last_name":"Brown"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'david.miller@mpd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"David","last_name":"Miller"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q');

-- Then create identities for these users
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
('d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', '{"sub":"d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2","email":"john.smith@mpd.org"}', 'email', 'john.smith@mpd.org', NOW(), NOW(), NOW()),
('f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', '{"sub":"f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d","email":"sarah.jones@mpd.org"}', 'email', 'sarah.jones@mpd.org', NOW(), NOW(), NOW()),
('a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', '{"sub":"a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d","email":"mike.wilson@mpd.org"}', 'email', 'mike.wilson@mpd.org', NOW(), NOW(), NOW()),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '{"sub":"b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e","email":"lisa.brown@mpd.org"}', 'email', 'lisa.brown@mpd.org', NOW(), NOW(), NOW()),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '{"sub":"c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f","email":"david.miller@mpd.org"}', 'email', 'david.miller@mpd.org', NOW(), NOW(), NOW());

-- Now update the users with additional information
UPDATE public."user" SET
  phone = '262-555-0101',
  position = 'officer',
  radio_number = 'R101',
  role = 'admin',
  driver_license = 'S1234567',
  driver_license_state = 'WI',
  state = 'WI',
  street_address = '123 Main St',
  callsign = 'R-1',
  city = 'Mukwonago',
  status = 'active',
  zip_code = '53149'
WHERE id = 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2';

UPDATE public."user" SET
  phone = '262-555-0102',
  position = 'reserve',
  radio_number = 'R102',
  role = 'member',
  driver_license = 'J9876543',
  driver_license_state = 'WI',
  state = 'WI',
  street_address = '456 Oak Ave',
  callsign = 'R-2',
  city = 'Mukwonago',
  status = 'active',
  zip_code = '53149'
WHERE id = 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d';

UPDATE public."user" SET
  phone = '262-555-0103',
  position = 'reserve',
  radio_number = 'R103',
  role = 'member',
  driver_license = 'W5432109',
  driver_license_state = 'WI',
  state = 'WI',
  street_address = '789 Pine St',
  callsign = 'R-3',
  city = 'Mukwonago',
  status = 'active',
  zip_code = '53149'
WHERE id = 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d';

UPDATE public."user" SET
  phone = '262-555-0104',
  position = 'candidate',
  role = 'guest',
  driver_license = 'B7654321',
  driver_license_state = 'WI',
  state = 'WI',
  street_address = '321 Elm St',
  city = 'Mukwonago',
  status = 'active',
  zip_code = '53149'
WHERE id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

UPDATE public."user" SET
  phone = '262-555-0105',
  position = 'staff',
  radio_number = 'R104',
  role = 'admin',
  driver_license = 'M8765432',
  driver_license_state = 'WI',
  state = 'WI',
  street_address = '654 Maple Dr',
  callsign = 'R-4',
  city = 'Mukwonago',
  status = 'active',
  zip_code = '53149'
WHERE id = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f';

-- Seed Emergency Contacts
INSERT INTO public.emergency_contact (first_name, last_name, phone, relationship, email, street_address, city, state, zip_code, user_id, is_current) VALUES
('Mary', 'Smith', '262-555-1001', 'Spouse', 'mary.smith@email.com', '123 Main St', 'Mukwonago', 'WI', '53149', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', true),
('James', 'Jones', '262-555-1002', 'Spouse', 'james.jones@email.com', '456 Oak Ave', 'Mukwonago', 'WI', '53149', 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', true),
('Emma', 'Wilson', '262-555-1003', 'Spouse', 'emma.wilson@email.com', '789 Pine St', 'Mukwonago', 'WI', '53149', 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', true),
('Robert', 'Brown', '262-555-1004', 'Father', 'robert.brown@email.com', '321 Elm St', 'Mukwonago', 'WI', '53149', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', true),
('Susan', 'Miller', '262-555-1005', 'Spouse', 'susan.miller@email.com', '654 Maple Dr', 'Mukwonago', 'WI', '53149', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', true);

-- Seed Uniform Sizes
INSERT INTO public.uniform_sizes (user_id, shirt_size, pant_size, shoe_size, notes, is_current) VALUES
('d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'L', '34x32', '10.5', 'Prefers tactical pants', true),
('f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'M', '30x30', '8', 'Needs high-visibility vest', true),
('a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', 'XL', '36x34', '12', 'Requires extra length in sleeves', true),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'S', '28x30', '7', 'New recruit - initial sizing', true),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'L', '34x30', '11', 'Standard issue sizes', true);

-- Seed Equipment
INSERT INTO public.equipment (name, description, serial_number, is_assigned, is_obsolete, notes, created_at, updated_at) VALUES
('Motorola Radio XTS3000', 'Police radio with shoulder mic', 'XTS3000-001', true, false, 'Annual maintenance completed', NOW(), NOW()),
('Body Camera Axon3', 'Standard issue body camera', 'AXON3-001', true, false, 'New battery installed', NOW(), NOW()),
('Tactical Vest Level IIIA', 'Bulletproof vest with police markings', 'VEST-001', true, false, 'Expires 2025', NOW(), NOW()),
('Flashlight Streamlight', 'Rechargeable LED flashlight', 'SL-001', true, false, 'Includes belt holder', NOW(), NOW()),
('Traffic Wand', 'LED light traffic control wand', 'TW-001', false, false, 'Stored in equipment room', NOW(), NOW());

-- Seed Assigned Equipment
INSERT INTO public.assigned_equipment (equipment_id, user_id, condition, notes, expected_return_date) VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'good', 'Daily use', NULL),
(2, 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'good', 'Checked monthly', NULL),
(3, 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', 'fair', 'Due for replacement next year', NULL),
(4, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'new', 'Newly issued', NULL),
(5, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'good', 'Regular maintenance', NULL);

-- Seed Events
INSERT INTO public.events (event_name, event_type, event_location, event_date, event_start_time, event_end_time, notes) VALUES
('Mukwonago High School Football Game', 'school_event', 'Mukwonago High School', '2024-09-15 18:00:00+00', '2024-09-15 18:00:00+00', '2024-09-15 22:00:00+00', 'Traffic control and security'),
('Maxwell Street Days', 'community_event', 'Downtown Mukwonago', '2024-07-04 10:00:00+00', '2024-07-04 10:00:00+00', '2024-07-04 20:00:00+00', 'Crowd control and community presence'),
('Fall Fest', 'fair', 'Field Park', '2024-10-01 11:00:00+00', '2024-10-01 11:00:00+00', '2024-10-01 19:00:00+00', 'Parking management and security'),
('Emergency Response Training', 'other', 'Police Department', '2024-06-15 09:00:00+00', '2024-06-15 09:00:00+00', '2024-06-15 17:00:00+00', 'Joint training with full-time officers'),
('Holiday Parade', 'community_event', 'Main Street', '2024-12-01 17:00:00+00', '2024-12-01 17:00:00+00', '2024-12-01 21:00:00+00', 'Traffic control and parade security');

-- Seed Event Assignments
INSERT INTO public.event_assignments (event_id, user_id, completion_status, completion_notes) VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'completed', 'Managed north entrance'),
(2, 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'completed', 'Patrolled vendor area'),
(3, 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', NULL, 'Assigned to main entrance'),
(4, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NULL, 'Training participant'),
(5, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', NULL, 'Route coordination');

-- Seed Training
INSERT INTO public.training (name, description, training_location, training_type, training_instructor, training_date, training_start_time, training_end_time) VALUES
('Traffic Control Basics', 'Basic traffic direction and control', 'Police Training Room', 'Traffic Control', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', '2024-05-01 09:00:00+00', '2024-05-01 09:00:00+00', '2024-05-01 13:00:00+00'),
('Radio Communications', 'Proper radio usage and codes', 'Communications Center', 'Communications', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '2024-05-15 13:00:00+00', '2024-05-15 13:00:00+00', '2024-05-15 17:00:00+00'),
('Emergency Response', 'Basic emergency response procedures', 'Training Center', 'Emergency Response', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', '2024-06-01 08:00:00+00', '2024-06-01 08:00:00+00', '2024-06-01 16:00:00+00'),
('Crowd Management', 'Crowd control techniques', 'Field Training Area', 'Crowd Control', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '2024-06-15 09:00:00+00', '2024-06-15 09:00:00+00', '2024-06-15 15:00:00+00'),
('First Aid/CPR', 'Basic first aid and CPR certification', 'Medical Training Room', 'Medical', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', '2024-07-01 10:00:00+00', '2024-07-01 10:00:00+00', '2024-07-01 18:00:00+00');

-- Seed Training Assignments
INSERT INTO public.training_assignments (training_id, user_id, completion_status, completion_notes) VALUES
(1, 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', 'completed', 'Passed practical assessment'),
(2, 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', 'completed', 'Excellent radio etiquette'),
(3, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'incomplete', 'Needs additional practice'),
(4, 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d', NULL, 'Scheduled attendance'),
(5, 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d', NULL, 'Renewal required');

-- Seed Policies
INSERT INTO public.policies (name, description, policy_type, policy_number, policy_url, effective_date) VALUES
('Use of Equipment', 'Guidelines for handling and maintaining equipment', 'Equipment', 'POL-001', '/policies/equipment-use.pdf', '2024-01-01 00:00:00+00'),
('Code of Conduct', 'Standards of behavior and professional conduct', 'Conduct', 'POL-002', '/policies/code-of-conduct.pdf', '2024-01-01 00:00:00+00'),
('Training Requirements', 'Annual training and certification requirements', 'Training', 'POL-003', '/policies/training-req.pdf', '2024-01-01 00:00:00+00'),
('Uniform Standards', 'Proper wear and maintenance of uniforms', 'Uniform', 'POL-004', '/policies/uniform-standards.pdf', '2024-01-01 00:00:00+00'),
('Event Procedures', 'Protocols for managing community events', 'Events', 'POL-005', '/policies/event-procedures.pdf', '2024-01-01 00:00:00+00');

-- Seed Policy Completion
INSERT INTO public.policy_completion (policy_id, user_id) VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2'),
(2, 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d'),
(3, 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d'),
(4, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
(5, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f');

-- Seed Applications
INSERT INTO public.application (first_name, last_name, email, phone, street_address, city, state, zip_code, driver_license, availability, prior_experience, position, status, user_id) VALUES
('Thomas', 'Anderson', 'thomas.anderson@email.com', '262-555-2001', '789 New St', 'Mukwonago', 'WI', '53149', 'A9876543', 'weekends', 'none', 'candidate', 'pending', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
('Emily', 'Parker', 'emily.parker@email.com', '262-555-2002', '456 Park Rd', 'Mukwonago', 'WI', '53149', 'P7654321', 'flexible', 'less_than_1_year', 'reserve', 'approved', 'f3b7c8d9-e0f1-4a2b-8c3d-9e0f1a2b3c4d'),
('Michael', 'Taylor', 'michael.taylor@email.com', '262-555-2003', '123 Lake Dr', 'Mukwonago', 'WI', '53149', 'T5432109', 'weekdays', 'none', 'candidate', 'pending', 'a1b2c3d4-e5f6-4a2b-8c3d-9e0f1a2b3c4d'),
('Jessica', 'White', 'jessica.white@email.com', '262-555-2004', '321 River Rd', 'Mukwonago', 'WI', '53149', 'W1234567', 'both', '1_to_3_years', 'reserve', 'approved', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2'),
('Robert', 'Green', 'robert.green@email.com', '262-555-2005', '654 Forest Ave', 'Mukwonago', 'WI', '53149', 'G7890123', 'weekends', 'more_than_3_years', 'officer', 'approved', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'); 