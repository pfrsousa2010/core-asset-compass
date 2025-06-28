-- Criar tabela para armazenar tokens de push
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Criar tabela para armazenar notificações
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL, -- 'asset_created', 'asset_updated', 'asset_deleted', 'app_update'
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Políticas RLS para push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (user_id = auth.uid());

-- Políticas RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Função para criar notificação de ativo
CREATE OR REPLACE FUNCTION public.create_asset_notification(
  asset_id UUID,
  action TEXT, -- 'created', 'updated', 'deleted'
  actor_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  asset_record RECORD;
  admin_users RECORD;
BEGIN
  -- Buscar informações do ativo
  SELECT name, code INTO asset_record
  FROM public.assets
  WHERE id = asset_id;
  
  IF NOT FOUND THEN
    RETURN;
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
        WHEN action = 'created' THEN format('%s adicionou o ativo "%s" (%s)', actor_name, asset_record.name, asset_record.code)
        WHEN action = 'updated' THEN format('%s atualizou o ativo "%s" (%s)', actor_name, asset_record.name, asset_record.code)
        WHEN action = 'deleted' THEN format('%s removeu o ativo "%s" (%s)', actor_name, asset_record.name, asset_record.code)
        ELSE format('%s modificou o ativo "%s" (%s)', actor_name, asset_record.name, asset_record.code)
      END,
      'asset_' || action,
      jsonb_build_object(
        'asset_id', asset_id,
        'asset_name', asset_record.name,
        'asset_code', asset_record.code,
        'actor_name', actor_name,
        'action', action
      )
    );
  END LOOP;
END;
$$;

-- Função para criar notificação de atualização do app
CREATE OR REPLACE FUNCTION public.create_app_update_notification()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Buscar todos os usuários ativos
  FOR user_record IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.is_active = TRUE
  LOOP
    -- Inserir notificação
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      user_record.id,
      'Nova versão disponível',
      'Uma nova versão do Armazena está disponível. Atualize o app para obter as últimas funcionalidades.',
      'app_update',
      jsonb_build_object(
        'version', '1.1.0',
        'timestamp', NOW()
      )
    );
  END LOOP;
END;
$$;

-- Trigger para notificar quando ativo é criado
CREATE OR REPLACE FUNCTION public.notify_asset_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Não notificar se for importação CSV (verificar se há uma flag ou contexto específico)
  -- Por enquanto, vamos notificar sempre
  PERFORM public.create_asset_notification(
    NEW.id,
    'created',
    (SELECT name FROM public.profiles WHERE id = auth.uid())
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_asset_created
  AFTER INSERT ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_asset_created();

-- Trigger para notificar quando ativo é atualizado
CREATE OR REPLACE FUNCTION public.notify_asset_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.create_asset_notification(
    NEW.id,
    'updated',
    (SELECT name FROM public.profiles WHERE id = auth.uid())
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_asset_updated
  AFTER UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_asset_updated();

-- Trigger para notificar quando ativo é deletado
CREATE OR REPLACE FUNCTION public.notify_asset_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.create_asset_notification(
    OLD.id,
    'deleted',
    (SELECT name FROM public.profiles WHERE id = auth.uid())
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_notify_asset_deleted
  AFTER DELETE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_asset_deleted(); 