import { supabase } from './supabase';

export interface SavedResource {
  id: string;
  user_id: string;
  resource_title: string;
  resource_category: string;
  saved_at: string;
}

export interface RoadmapItem {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  is_complete: boolean;
  target_date?: string | null;
  sort_order: number;
  created_at: string;
}

// ── Saved Resources API ──────────────────────────────────────────────────────

export async function getSavedResources(): Promise<SavedResource[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_resources')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.warn('Error fetching saved resources:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch saved resources:', err);
    return [];
  }
}

export async function saveResource(title: string, category: string): Promise<SavedResource | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to save resources.');

    const { data, error } = await supabase
      .from('saved_resources')
      .insert([
        {
          user_id: user.id,
          resource_title: title,
          resource_category: category,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving resource:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to save resource:', err);
    return null;
  }
}

export async function removeResource(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_resources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing resource:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to remove resource:', err);
    return false;
  }
}

export async function removeResourceByTitle(title: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('saved_resources')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_title', title);

    if (error) {
      console.error('Error removing resource by title:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to remove resource by title:', err);
    return false;
  }
}

// ── Roadmap Items API ────────────────────────────────────────────────────────

export async function getRoadmapItems(): Promise<RoadmapItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching roadmap items:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch roadmap items:', err);
    return [];
  }
}

export async function addRoadmapItem(
  title: string,
  description?: string,
  targetDate?: string
): Promise<RoadmapItem | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to add roadmap items.');

    const { data, error } = await supabase
      .from('roadmap_items')
      .insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          target_date: targetDate || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding roadmap item:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to add roadmap item:', err);
    return null;
  }
}

export async function toggleRoadmapItem(id: string, currentIsComplete: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('roadmap_items')
      .update({ is_complete: !currentIsComplete })
      .eq('id', id);

    if (error) {
      console.error('Error toggling roadmap item:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to toggle roadmap item:', err);
    return false;
  }
}

export async function deleteRoadmapItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('roadmap_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting roadmap item:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete roadmap item:', err);
    return false;
  }
}
