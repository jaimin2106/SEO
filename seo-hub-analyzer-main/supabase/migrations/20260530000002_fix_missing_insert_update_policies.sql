-- ADD missing UPDATE policy for scan_jobs
DROP POLICY IF EXISTS "Users can update their own scan jobs" ON public.scan_jobs;
CREATE POLICY "Users can update their own scan jobs"
  ON public.scan_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- ADD missing INSERT policy for report_data
DROP POLICY IF EXISTS "Users can insert their own report data" ON public.report_data;
CREATE POLICY "Users can insert their own report data"
  ON public.report_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_id AND r.user_id = auth.uid()
    )
  );

-- ADD missing UPDATE policy for report_data
DROP POLICY IF EXISTS "Users can update their own report data" ON public.report_data;
CREATE POLICY "Users can update their own report data"
  ON public.report_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_id AND r.user_id = auth.uid()
    )
  );
