
-- Permitir que usuários autenticados sem empresa possam criar uma nova empresa
CREATE POLICY "Users without company can create one" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );
