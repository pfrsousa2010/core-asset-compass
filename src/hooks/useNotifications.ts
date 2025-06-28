import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isSubscribed: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Buscar notificações
  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Buscar assinatura de push
  const { data: pushSubscription } = useQuery({
    queryKey: ['push-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Verificar se está inscrito
  useEffect(() => {
    setIsSubscribed(!!pushSubscription);
  }, [pushSubscription]);

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Solicitar permissão e registrar service worker
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Permissão negada",
        description: "As notificações foram bloqueadas. Habilite-as nas configurações do navegador.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [toast]);

  // Registrar service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Erro ao registrar service worker:', error);
      return null;
    }
  }, []);

  // Inscrever para notificações push
  const subscribeToPush = useCallback(async () => {
    if (!user) return;

    try {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      const registration = await registerServiceWorker();
      if (!registration) {
        toast({
          title: "Erro",
          description: "Não foi possível registrar o service worker.",
          variant: "destructive",
        });
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || ''),
      });

      // Salvar no banco de dados
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))
          )),
          auth: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))
          )),
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['push-subscription'] });
      
      toast({
        title: "Notificações ativadas",
        description: "Você receberá notificações sobre mudanças nos ativos.",
      });
    } catch (error) {
      console.error('Erro ao inscrever para notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      });
    }
  }, [user, requestNotificationPermission, registerServiceWorker, queryClient, toast]);

  // Cancelar inscrição
  const unsubscribeFromPush = useCallback(async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remover do banco de dados
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['push-subscription'] });
      
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações push.",
      });
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar as notificações.",
        variant: "destructive",
      });
    }
  }, [user, queryClient, toast]);

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificações marcadas como lidas",
      });
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    return markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    return markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  return {
    notifications,
    unreadCount,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    isSubscribed,
  };
}

// Função auxiliar para converter VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 