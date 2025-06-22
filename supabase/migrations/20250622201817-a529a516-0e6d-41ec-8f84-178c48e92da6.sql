
-- Adicionar campo is_active na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Corrigir a trigger function para não tentar preencher updated_at em profiles durante criação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Se é o primeiro usuário (não há empresas), criar empresa e usuário admin
  IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
    -- Criar primeira empresa
    INSERT INTO public.companies (name, plan)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'), 'free');
    
    -- Criar perfil como admin
    INSERT INTO public.profiles (id, email, name, role, company_id, is_active)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      'admin',
      (SELECT id FROM public.companies ORDER BY created_at DESC LIMIT 1),
      TRUE
    );
  ELSE
    -- Para novos usuários, criar como viewer (admin deve alterar depois)
    INSERT INTO public.profiles (id, email, name, role, company_id, is_active)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      'viewer',
      COALESCE(
        (NEW.raw_user_meta_data->>'company_id')::UUID,
        (SELECT id FROM public.companies ORDER BY created_at DESC LIMIT 1)
      ),
      TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar as políticas RLS para considerar is_active
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;
CREATE POLICY "Users can view profiles from their company" 
  ON public.profiles 
  FOR SELECT 
  USING (company_id = public.get_user_company_id() AND is_active = TRUE);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid() AND is_active = TRUE);

-- Atualizar função get_user_company_id para considerar is_active
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.profiles 
  WHERE id = auth.uid() AND is_active = TRUE;
$$;

-- Função para verificar se usuário está ativo
CREATE OR REPLACE FUNCTION public.user_is_active()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_active FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;
