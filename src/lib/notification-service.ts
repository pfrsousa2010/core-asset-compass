import { supabase } from '@/integrations/supabase/client';

// Função para enviar notificação de atualização do app
export async function sendAppUpdateNotification() {
  try {
    const { error } = await supabase.rpc('create_app_update_notification' as any);
    if (error) throw error;
    
    // Aqui você enviaria as notificações push para todos os usuários
    // Isso seria feito no backend com as chaves VAPID
    console.log('Notificação de atualização do app criada');
  } catch (error) {
    console.error('Erro ao enviar notificação de atualização:', error);
  }
}

// Função para marcar notificação como lida
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
}

// Função para marcar todas as notificações como lidas
export async function markAllNotificationsAsRead() {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    throw error;
  }
}

// Função para buscar notificações
export async function getNotifications(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
}

// Função para contar notificações não lidas
export async function getUnreadCount() {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
}
