-- 1. Create users first (they're referenced by many other tables)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password)
VALUES
('d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'admin@mukwonagopd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Admin","last_name":"User"}', true, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', 'chief@mukwonagopd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Eric","last_name":"Reynolds"}', true, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q'),
('f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', 'captain@mukwonagopd.org', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Daniel","last_name":"Thompson"}', false, '$2a$10$Q7RNHN.tJ/WjKfzh6ELF8.HtZkmB.TpCTsVj5eMD/Zp/B9jfrKm.q');

-- 2. Create public.user records
INSERT INTO public."user" (id, email, first_name, last_name, phone, position, radio_number, role, driver_license, driver_license_state, state, street_address, callsign, city, status, zip_code)
VALUES
('d0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'admin@mukwonagopd.org', 'Admin', 'User', '262-363-6435', 'officer', 'R100', 'admin', 'REDACTED', 'WI', 'WI', '627 S Rochester St', 'ADMIN-1', 'Mukwonago', 'active', '53149'),
('e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', 'chief@mukwonagopd.org', 'Eric', 'Reynolds', '262-363-6436', 'admin', 'C100', 'admin', 'REDACTED', 'WI', 'WI', '627 S Rochester St', 'CHIEF-1', 'Mukwonago', 'active', '53149'),
('f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', 'captain@mukwonagopd.org', 'Daniel', 'Thompson', '262-363-6437', 'officer', 'C101', 'admin', 'REDACTED', 'WI', 'WI', '627 S Rochester St', 'CAPT-1', 'Mukwonago', 'active', '53149');

-- 3. Create emergency contacts (references users)
INSERT INTO public.emergency_contact (id, first_name, last_name, phone, relationship, email, street_address, city, state, zip_code, user_id, is_current, created_at, updated_at)
VALUES
(2, 'Margaret', 'Reynolds', '262-555-0201', 'Spouse', 'mreynolds@email.com', '627 S Rochester St', 'Mukwonago', 'WI', '53149', 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', true, NOW(), NOW()),
(3, 'William', 'Thompson', '262-555-0202', 'Spouse', 'wthompson@email.com', '627 S Rochester St', 'Mukwonago', 'WI', '53149', 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', true, NOW(), NOW());

-- 4. Create uniform sizes (references users)
INSERT INTO public.uniform_sizes (id, shirt_size, pant_size, shoe_size, notes, user_id, is_current, created_at, updated_at)
VALUES
(1, 'L', '34x32', '10.5', 'Standard issue uniform', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', true, NOW(), NOW()),
(2, 'XL', '36x32', '11', 'Class A and B uniforms issued', 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', true, NOW(), NOW()),
(3, 'L', '34x30', '10', 'Tactical uniform required', 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', true, NOW(), NOW());

-- 5. Create equipment (explicitly setting id for references)
INSERT INTO public.equipment (id, name, description, serial_number, is_assigned, is_obsolete, notes, created_at, updated_at)
VALUES
(1, 'Motorola APX 8000', 'Digital Police Radio', 'APX8000-2024-001', true, false, 'Department standard issue radio', NOW(), NOW()),
(2, 'Axon Body 3', 'Body-Worn Camera', 'AB3-2024-001', true, false, 'Latest model body camera', NOW(), NOW()),
(3, 'Point Blank Vision', 'Level IIIA Tactical Vest', 'PBV-2024-001', true, false, 'Expires 2029', NOW(), NOW()),
(4, 'Streamlight Stinger 2020', 'LED Duty Flashlight', 'SL2020-001', true, false, 'Includes charging base', NOW(), NOW()),
(5, 'Panasonic Toughbook', 'MDT Laptop', 'CF-33-2024-001', true, false, 'Squad car computer', NOW(), NOW());

-- 6. Create assigned equipment (now references existing equipment ids)
INSERT INTO public.assigned_equipment (equipment_id, user_id, condition, notes, checked_out_at, created_at, updated_at)
VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'good', 'Daily use', NOW(), NOW(), NOW()),
(2, 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', 'good', 'Checked monthly', NOW(), NOW(), NOW()),
(3, 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', 'new', 'Recently issued', NOW(), NOW(), NOW());

-- 7. Create events (explicitly setting id)
INSERT INTO public.events (id, event_name, event_type, event_location, event_date, event_start_time, event_end_time, notes, created_at, updated_at)
VALUES
(1, 'Maxwell Street Days', 'community_event', 'Downtown Mukwonago', '2024-07-03 14:00:00+00', '2024-07-03 14:00:00+00', '2024-07-03 22:00:00+00', 'Annual community fair - requires full staffing', NOW(), NOW()),
(2, 'MHS Homecoming Parade', 'school_event', 'Rochester Street to MHS', '2024-09-20 16:30:00+00', '2024-09-20 16:30:00+00', '2024-09-20 18:00:00+00', 'Traffic control along parade route', NOW(), NOW()),
(3, 'National Night Out', 'community_event', 'Field Park', '2024-08-06 17:00:00+00', '2024-08-06 17:00:00+00', '2024-08-06 21:00:00+00', 'Community police awareness event', NOW(), NOW());

-- 8. Create event assignments (references events and users)
INSERT INTO public.event_assignments (event_id, user_id, completion_status, completion_notes, created_at, updated_at)
VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'completed', 'Primary traffic control', NOW(), NOW()),
(1, 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', 'completed', 'Event supervisor', NOW(), NOW()),
(2, 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', NULL, 'Command post operations', NOW(), NOW());

-- 9. Create training (explicitly setting id)
INSERT INTO public.training (id, name, description, training_location, training_type, training_instructor, training_date, training_start_time, training_end_time, created_at, updated_at)
VALUES
(1, 'Emergency Vehicle Operations', 'EVOC certification course', 'WCTC Training Center', 'Vehicle Operations', 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', '2024-05-15 08:00:00+00', '2024-05-15 08:00:00+00', '2024-05-15 16:00:00+00', NOW(), NOW()),
(2, 'Active Shooter Response', 'ALERT protocol training', 'Mukwonago High School', 'Tactical', 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', '2024-06-01 07:00:00+00', '2024-06-01 07:00:00+00', '2024-06-01 15:00:00+00', NOW(), NOW()),
(3, 'Crisis Intervention', 'Mental health response training', 'MPD Training Room', 'Crisis Management', 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', '2024-06-15 09:00:00+00', '2024-06-15 09:00:00+00', '2024-06-15 17:00:00+00', NOW(), NOW()),
(4, 'Firearms Qualification', 'Quarterly firearms qualification', 'MPD Range', 'Firearms', 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', '2024-07-01 08:00:00+00', '2024-07-01 08:00:00+00', '2024-07-01 17:00:00+00', NOW(), NOW());

-- 10. Create training assignments (references training and users)
INSERT INTO public.training_assignments (training_id, user_id, completion_status, completion_notes, created_at, updated_at)
VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'completed', 'Passed all evaluations', NOW(), NOW()),
(2, 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', 'completed', 'Lead instructor certification', NOW(), NOW()),
(3, 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', 'incomplete', 'Scheduled for next session', NOW(), NOW()),
(4, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', 'incomplete', 'Quarterly qualification scheduled', NOW(), NOW());

-- 11. Create policies (explicitly setting id)
INSERT INTO public.policies (id, name, description, policy_type, policy_number, policy_url, effective_date, created_at, updated_at)
VALUES
(1, 'Use of Force', 'Comprehensive guidelines on use of force continuum', 'Operations', 'POL-101', '/policies/use-of-force.pdf', '2024-01-01 00:00:00+00', NOW(), NOW()),
(2, 'Vehicle Pursuit Policy', 'Procedures for vehicle pursuits and interventions', 'Operations', 'POL-102', '/policies/vehicle-pursuit.pdf', '2024-01-01 00:00:00+00', NOW(), NOW()),
(3, 'Body Worn Camera Policy', 'Requirements for BWC usage and data management', 'Equipment', 'POL-103', '/policies/bwc.pdf', '2024-01-01 00:00:00+00', NOW(), NOW());

-- 12. Create policy completions (references policies and users)
INSERT INTO public.policy_completion (policy_id, user_id, created_at, updated_at)
VALUES
(1, 'd0d54aa8-9e75-4d7e-89a9-7b7c6226e8d2', NOW(), NOW()),
(2, 'e5f6a7b8-c9d0-4e1f-a23b-4c5d6e7f8a9b', NOW(), NOW()),
(3, 'f6a7b8c9-d0e1-4f2f-b34c-5d6e7f8a9b0c', NOW(), NOW()); 