
-- Primeiro, vamos criar as tabelas necessárias para o sistema multi-tenant

-- Enum para os papéis dos usuários
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'viewer');

-- Enum para os planos das empresas
CREATE TYPE public.company_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- Enum para status dos ativos
CREATE TYPE public.asset_status AS ENUM ('ativo', 'manutenção', 'baixado');

-- Tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plan company_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perfis de usuários (conectada ao auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ativos
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT,
  status asset_status NOT NULL DEFAULT 'ativo',
  acquisition_date DATE,
  value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by_user_id UUID REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  UNIQUE(code, company_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Função para obter o company_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Função para verificar se o usuário tem um papel específico
CREATE OR REPLACE FUNCTION public.user_has_role(_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$$;

-- Políticas RLS para companies
CREATE POLICY "Users can view their own company" 
  ON public.companies 
  FOR SELECT 
  USING (id = public.get_user_company_id());

CREATE POLICY "Admins can update their company" 
  ON public.companies 
  FOR UPDATE 
  USING (id = public.get_user_company_id() AND public.user_has_role('admin'));

-- Políticas RLS para profiles
CREATE POLICY "Users can view profiles from their company" 
  ON public.profiles 
  FOR SELECT 
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Admins can insert new users in their company" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (company_id = public.get_user_company_id() AND public.user_has_role('admin'));

CREATE POLICY "Admins can update users in their company" 
  ON public.profiles 
  FOR UPDATE 
  USING (company_id = public.get_user_company_id() AND public.user_has_role('admin'));

CREATE POLICY "Admins can delete users in their company" 
  ON public.profiles 
  FOR DELETE 
  USING (company_id = public.get_user_company_id() AND public.user_has_role('admin'));

-- Políticas RLS para assets
CREATE POLICY "Users can view assets from their company" 
  ON public.assets 
  FOR SELECT 
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Editors and admins can insert assets" 
  ON public.assets 
  FOR INSERT 
  WITH CHECK (
    company_id = public.get_user_company_id() AND 
    (public.user_has_role('admin') OR public.user_has_role('editor'))
  );

CREATE POLICY "Editors and admins can update assets" 
  ON public.assets 
  FOR UPDATE 
  USING (
    company_id = public.get_user_company_id() AND 
    (public.user_has_role('admin') OR public.user_has_role('editor'))
  );

CREATE POLICY "Admins can delete assets" 
  ON public.assets 
  FOR DELETE 
  USING (
    company_id = public.get_user_company_id() AND 
    public.user_has_role('admin')
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by_user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se é o primeiro usuário (não há empresas), criar empresa e usuário admin
  IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
    -- Criar primeira empresa
    INSERT INTO public.companies (name, plan)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'), 'free')
    RETURNING id INTO NEW.raw_user_meta_data;
    
    -- Criar perfil como admin
    INSERT INTO public.profiles (id, email, name, role, company_id)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      'admin',
      (SELECT id FROM public.companies ORDER BY created_at DESC LIMIT 1)
    );
  ELSE
    -- Para novos usuários, criar como viewer (admin deve alterar depois)
    INSERT INTO public.profiles (id, email, name, role, company_id)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      'viewer',
      COALESCE(
        (NEW.raw_user_meta_data->>'company_id')::UUID,
        (SELECT id FROM public.companies ORDER BY created_at DESC LIMIT 1)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir empresa de exemplo para desenvolvimento
INSERT INTO public.companies (name, plan) 
VALUES ('Empresa Demo', 'premium');
