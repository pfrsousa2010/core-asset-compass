-- Corrigir função create_asset_notification para lidar com ativos deletados
CREATE OR REPLACE FUNCTION public.create_asset_notification(
  asset_id UUID,
  action TEXT, -- 'created', 'updated', 'deleted'
  actor_name TEXT,
  asset_name TEXT DEFAULT NULL,
  asset_code TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  asset_record RECORD;
  admin_users RECORD;
  final_asset_name TEXT;
  final_asset_code TEXT;
BEGIN
  -- Para deleção, usar os parâmetros fornecidos (já que o ativo não existe mais)
  IF action = 'deleted' THEN
    final_asset_name := asset_name;
    final_asset_code := asset_code;
  ELSE
    -- Para criação e atualização, buscar informações do ativo
    SELECT name, code INTO asset_record
    FROM public.assets
    WHERE id = asset_id;
    
    IF NOT FOUND THEN
      RETURN;
    END IF;
    
    final_asset_name := asset_record.name;
    final_asset_code := asset_record.code;
  END IF;
  
  -- Buscar todos os usuários admin da mesma empresa
  FOR admin_users IN
    SELECT p.id, p.name
    FROM public.profiles p
    WHERE p.company_id = public.get_user_company_id()
      AND p.role = 'admin'
      AND p.is_active = TRUE
      AND p.id != auth.uid() -- Não notificar o próprio usuário
  LOOP
    -- Inserir notificação
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      admin_users.id,
      CASE 
        WHEN action = 'created' THEN 'Novo ativo adicionado'
        WHEN action = 'updated' THEN 'Ativo atualizado'
        WHEN action = 'deleted' THEN 'Ativo removido'
        ELSE 'Ativo modificado'
      END,
      CASE 
        WHEN action = 'created' THEN format('%s adicionou o ativo "%s" (%s)', actor_name, final_asset_name, final_asset_code)
        WHEN action = 'updated' THEN format('%s atualizou o ativo "%s" (%s)', actor_name, final_asset_name, final_asset_code)
        WHEN action = 'deleted' THEN format('%s removeu o ativo "%s" (%s)', actor_name, final_asset_name, final_asset_code)
        ELSE format('%s modificou o ativo "%s" (%s)', actor_name, final_asset_name, final_asset_code)
      END,
      'asset_' || action,
      jsonb_build_object(
        'asset_id', asset_id,
        'asset_name', final_asset_name,
        'asset_code', final_asset_code,
        'actor_name', actor_name,
        'action', action
      )
    );
  END LOOP;
END;
$$;

-- Corrigir trigger para notificar quando ativo é criado
CREATE OR REPLACE FUNCTION public.notify_asset_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.create_asset_notification(
    NEW.id,
    'created',
    (SELECT name FROM public.profiles WHERE id = auth.uid()),
    NEW.name,
    NEW.code
  );
  RETURN NEW;
END;
$$;

-- Corrigir trigger para notificar quando ativo é atualizado
CREATE OR REPLACE FUNCTION public.notify_asset_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.create_asset_notification(
    NEW.id,
    'updated',
    (SELECT name FROM public.profiles WHERE id = auth.uid()),
    NEW.name,
    NEW.code
  );
  RETURN NEW;
END;
$$;

-- Corrigir trigger para notificar quando ativo é deletado
CREATE OR REPLACE FUNCTION public.notify_asset_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.create_asset_notification(
    OLD.id,
    'deleted',
    (SELECT name FROM public.profiles WHERE id = auth.uid()),
    OLD.name,
    OLD.code
  );
  RETURN OLD;
END;
$$; 