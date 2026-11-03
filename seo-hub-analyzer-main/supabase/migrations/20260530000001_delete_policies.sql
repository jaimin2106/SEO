-- DELETE policies for scan_jobs and report_data
DROP POLICY IF EXISTS "Users can delete their own scan jobs" ON public.scan_jobs;
CREATE POLICY "Users can delete their own scan jobs"
  ON public.scan_jobs FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own report data" ON public.report_data;
CREATE POLICY "Users can delete their own report data"
  ON public.report_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_id AND r.user_id = auth.uid()
    )
  );
