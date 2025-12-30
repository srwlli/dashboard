/**
 * Favorite item with optional group assignment
 */
export interface FavoriteItem {
  path: string;
  group?: string; // Group name (optional)
}

/**
 * Custom group for organizing favorites
 */
export interface FavoriteGroup {
  id: string;
  name: string;
  color?: string; // Optional color for visual distinction
}

/**
 * Complete favorites data structure for a project
 */
export interface FavoritesData {
  groups: FavoriteGroup[];
  favorites: FavoriteItem[];
}

/**
 * Default empty favorites data
 */
export const createEmptyFavoritesData = (): FavoritesData => ({
  groups: [],
  favorites: [],
});
