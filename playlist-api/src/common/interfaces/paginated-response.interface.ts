/**
 * Interface pour les réponses paginées
 * 
 * Fournit les métadonnées de pagination avec les données
 */
export interface PaginatedResponse<T> {
  /**
   * Données paginées
   */
  data: T[];

  /**
   * Métadonnées de pagination
   */
  meta: {
    /**
     * Numéro de la page actuelle
     */
    currentPage: number;

    /**
     * Nombre d'éléments par page
     */
    itemsPerPage: number;

    /**
     * Nombre total d'éléments
     */
    totalItems: number;

    /**
     * Nombre total de pages
     */
    totalPages: number;

    /**
     * Y a-t-il une page suivante ?
     */
    hasNextPage: boolean;

    /**
     * Y a-t-il une page précédente ?
     */
    hasPreviousPage: boolean;
  };
}
