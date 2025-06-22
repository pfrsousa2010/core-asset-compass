
-- Adicionar novos campos na tabela assets
ALTER TABLE public.assets 
ADD COLUMN serial_number TEXT,
ADD COLUMN color TEXT,
ADD COLUMN manufacturer TEXT,
ADD COLUMN model TEXT,
ADD COLUMN capacity TEXT,
ADD COLUMN voltage TEXT,
ADD COLUMN origin TEXT CHECK (origin IN ('doação', 'compra')),
ADD COLUMN condition TEXT,
ADD COLUMN inalienable BOOLEAN DEFAULT FALSE,
ADD COLUMN holder TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN updated_by_user_name TEXT;

-- Atualizar a trigger function para incluir o nome do usuário que fez a alteração
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by_user_id = auth.uid();
  
  -- Buscar o nome do usuário que está fazendo a alteração
  SELECT name INTO NEW.updated_by_user_name 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para a tabela assets se não existir
DROP TRIGGER IF EXISTS handle_assets_updated_at ON public.assets;
CREATE TRIGGER handle_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar campo updated_by_user_name na tabela profiles também
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_by_user_name TEXT;

-- Criar trigger para a tabela profiles
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
