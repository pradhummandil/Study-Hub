import { supabase } from './supabase';

export interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  exam_tag: string | null;
  file_url: string;
  thumbnail_url: string | null;
  file_type: string | null;
  download_count: number;
  created_at: string;
}

export async function getResources(): Promise<ResourceItem[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching resources:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch resources:', err);
    return [];
  }
}

export async function incrementDownloadCount(resourceId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_resource_download', { resource_id: resourceId });
    if (error) {
      console.warn('RPC increment_resource_download failed, fallback update:', error.message);
    }
  } catch (err) {
    console.warn('Failed to increment download count:', err);
  }
}
