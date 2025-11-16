/**
 * enumeration des roles utilisateur
 * 
 * USER: Utilisateur standard qui peut créer des playlists et des chansons
 * ADMIN: Administrateur avec des privileges supplémentaires (bannir des utilisateurs, etc.)
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
