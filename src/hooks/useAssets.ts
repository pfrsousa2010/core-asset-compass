import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AssetStatus = Database['public']['Enums']['asset_status'];
type Asset = Database['public']['Tables']['assets']['Row'];

interface UseAssetsFilters {
  search: string;
  statusFilter: string;
  locationFilter: string;
  unityFilter?: string; // <--- Adicionado
}

interface UseAssetsReturn {
  assets: Asset[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  resetFilters: () => void;
  loadMore: () => void;
  locations: string[] | undefined;
  unities: string[] | undefined; // <--- Adicionado
}

const ITEMS_PER_PAGE = 20;

export function useAssets(filters: UseAssetsFilters): UseAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchAssets = useCallback(async (page: number) => {
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }
    if (filters.statusFilter !== 'all') {
      query = query.eq('status', filters.statusFilter as AssetStatus);
    }
    if (filters.locationFilter !== 'all') {
      query = query.eq('location', filters.locationFilter);
    }
    if (filters.unityFilter && filters.unityFilter !== 'all') {
      query = query.eq('unity', filters.unityFilter);
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    const { data, error } = await query.range(from, to);
    
    if (error) throw error;
    return data || [];
  }, [filters.search, filters.statusFilter, filters.locationFilter, filters.unityFilter]);

  const loadAssets = useCallback(async (page: number) => {
    const isFirstPage = page === 1;
    
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const newAssets = await fetchAssets(page);
      setAssets(prev => isFirstPage ? newAssets : [...prev, ...newAssets]);
      setHasMore(newAssets.length === ITEMS_PER_PAGE);
    } finally {
      if (isFirstPage) {
        setLoading(false);
        setLoadingMore(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [fetchAssets]);

  const resetFilters = useCallback(() => {
    setAssets([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoadingMore(false);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadAssets(nextPage);
  }, [hasMore, loadingMore, currentPage, loadAssets]);

  // Reset when filters change
  useEffect(() => {
    resetFilters();
  }, [filters.search, filters.statusFilter, filters.locationFilter, filters.unityFilter, resetFilters]);

  // Load assets when page changes
  useEffect(() => {
    loadAssets(currentPage);
  }, [currentPage, loadAssets]);

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['asset-locations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('assets')
        .select('location')
        .not('location', 'is', null);

      const uniqueLocations = [...new Set(data?.map(item => item.location).filter(Boolean))];
      return uniqueLocations;
    },
  });
  // Fetch unities
  const { data: unities } = useQuery({
    queryKey: ['asset-unities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('assets')
        .select('unity')
        .not('unity', 'is', null);
      const uniqueUnities = [...new Set(data?.map(item => item.unity).filter(Boolean))];
      return uniqueUnities;
    },
  });

  return {
    assets,
    loading,
    loadingMore,
    hasMore,
    currentPage,
    resetFilters,
    loadMore,
    locations,
    unities, // <--- Adicionado
  };
} 