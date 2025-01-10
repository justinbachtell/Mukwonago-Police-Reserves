-- User table policies
CREATE POLICY "Users can view their own profile"
  ON public."user"
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public."user"
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON public."user"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Application table policies
CREATE POLICY "Users can view their own applications"
  ON public.application
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON public.application
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.application
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Emergency contact policies
CREATE POLICY "Users can view their own emergency contacts"
  ON public.emergency_contact
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency contacts"
  ON public.emergency_contact
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON public.emergency_contact
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Uniform sizes policies
CREATE POLICY "Users can view their own uniform sizes"
  ON public.uniform_sizes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uniform sizes"
  ON public.uniform_sizes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uniform sizes"
  ON public.uniform_sizes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Event assignments policies
CREATE POLICY "Users can view their own event assignments"
  ON public.event_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Training assignments policies
CREATE POLICY "Users can view their own training assignments"
  ON public.training_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy completion policies
CREATE POLICY "Users can view their own policy completions"
  ON public.policy_completion
  FOR SELECT
  USING (auth.uid() = user_id);

-- Assigned equipment policies
CREATE POLICY "Users can view their own assigned equipment"
  ON public.assigned_equipment
  FOR SELECT
  USING (auth.uid() = user_id);

-- Public read access policies
CREATE POLICY "Public read access for events"
  ON public.events
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public read access for policies"
  ON public.policies
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public read access for training"
  ON public.training
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Admin policies
CREATE POLICY "Admin full access to all tables"
  ON public."user"
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to applications"
  ON public.application
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to equipment"
  ON public.equipment
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to assigned equipment"
  ON public.assigned_equipment
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to emergency contacts"
  ON public.emergency_contact
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to events"
  ON public.events
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to event assignments"
  ON public.event_assignments
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to policies"
  ON public.policies
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to policy completion"
  ON public.policy_completion
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to training"
  ON public.training
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to training assignments"
  ON public.training_assignments
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to uniform sizes"
  ON public.uniform_sizes
  USING (auth.jwt() ->> 'role' = 'admin'); 