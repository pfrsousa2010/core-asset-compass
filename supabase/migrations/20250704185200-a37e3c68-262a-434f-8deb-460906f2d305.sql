
-- Create the missing function for app update notifications
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
