const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper centralisé pour tous les appels API
const apiFetch = async (url, options = {}) => {
    const response = await fetch(url, options);
    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }
    if (!response.ok) {
        throw new Error((data && data.error) || `Erreur ${response.status}`);
    }
    return data;
};

const api = {
    // Clients
    getClients: () => apiFetch(`${API_URL}/clients`),
    addClient: (client) => apiFetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
    }),
    updateClient: (id, client) => apiFetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
    }),
    deleteClient: (id) => apiFetch(`${API_URL}/clients/${id}`, { method: 'DELETE' }),

    // Commandes
    getCommandes: () => apiFetch(`${API_URL}/commandes`),
    addCommande: (commande) => apiFetch(`${API_URL}/commandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commande)
    }),
    updateCommande: (id, commande) => apiFetch(`${API_URL}/commandes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commande)
    }),
    deleteCommande: (id) => apiFetch(`${API_URL}/commandes/${id}`, { method: 'DELETE' }),
    getArticlesCommande: (commandeId) => apiFetch(`${API_URL}/commandes/${commandeId}/articles`),

    // Teintures
    getTeintures: () => apiFetch(`${API_URL}/teintures`),
    addTeinture: (teinture) => apiFetch(`${API_URL}/teintures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teinture)
    }),
    updateTeinture: (id, teinture) => apiFetch(`${API_URL}/teintures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teinture)
    }),
    deleteTeinture: (id) => apiFetch(`${API_URL}/teintures/${id}`, { method: 'DELETE' }),

    // Couleurs
    getCouleurs: () => apiFetch(`${API_URL}/couleurs`),
    addCouleur: (couleur) => apiFetch(`${API_URL}/couleurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couleur)
    }),
    updateCouleur: (id, couleur) => apiFetch(`${API_URL}/couleurs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couleur)
    }),
    deleteCouleur: (id) => apiFetch(`${API_URL}/couleurs/${id}`, { method: 'DELETE' }),

    // Fournisseurs
    getFournisseurs: () => apiFetch(`${API_URL}/fournisseurs?t=${Date.now()}`),
    getFournisseursAvecReceptions: () => apiFetch(`${API_URL}/fournisseurs/avec-receptions-pendantes`),
    addFournisseur: (fournisseur) => apiFetch(`${API_URL}/fournisseurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fournisseur)
    }),
    updateFournisseur: (id, fournisseur) => apiFetch(`${API_URL}/fournisseurs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fournisseur)
    }),
    deleteFournisseur: (id) => apiFetch(`${API_URL}/fournisseurs/${id}`, { method: 'DELETE' }),

    // Réceptions de Peaux
    getReceptions: () => apiFetch(`${API_URL}/receptions`),
    getReceptionById: (id) => apiFetch(`${API_URL}/receptions/${id}`),
    addReception: (reception) => apiFetch(`${API_URL}/receptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reception)
    }),
    updateReception: (id, reception) => apiFetch(`${API_URL}/receptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reception)
    }),
    deleteReception: (id) => apiFetch(`${API_URL}/receptions/${id}`, { method: 'DELETE' }),
    getReceptionsNonFacturees: (fournisseurId) => {
        const url = fournisseurId
            ? `${API_URL}/receptions/non-facturees/${fournisseurId}?t=${Date.now()}`
            : `${API_URL}/receptions/non-facturees?t=${Date.now()}`;
        return apiFetch(url);
    },

    // Factures Fournisseurs
    getFacturesFournisseurs: () => apiFetch(`${API_URL}/factures-fournisseurs?t=${Date.now()}`),
    getInvoiceReceptions: (id) => apiFetch(`${API_URL}/factures-fournisseurs/${id}/receptions`),
    addFactureFournisseur: (facture) => apiFetch(`${API_URL}/factures-fournisseurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facture)
    }),
    updateFactureStatut: (id, statut) => apiFetch(`${API_URL}/factures-fournisseurs/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
    }),
    deleteFactureFournisseur: (id) => apiFetch(`${API_URL}/factures-fournisseurs/${id}`, { method: 'DELETE' }),

    // Achats Produits Chimiques
    getAchatsChimiques: () => apiFetch(`${API_URL}/achats-chimiques`),
    addAchatsChimique: (achat) => apiFetch(`${API_URL}/achats-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achat)
    }),
    updateAchatsChimique: (id, achat) => apiFetch(`${API_URL}/achats-chimiques/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achat)
    }),
    deleteAchatsChimique: (id) => apiFetch(`${API_URL}/achats-chimiques/${id}`, { method: 'DELETE' }),

    // Produits Chimiques (Désignations)
    getProduitsChimiques: () => apiFetch(`${API_URL}/produits-chimiques`),
    addProduitChimique: (nom, seuil_min = 0) => apiFetch(`${API_URL}/produits-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, seuil_min })
    }),
    updateProduitChimique: (id, nom, seuil_min = 0) => apiFetch(`${API_URL}/produits-chimiques/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, seuil_min })
    }),
    deleteProduitChimique: (id) => apiFetch(`${API_URL}/produits-chimiques/${id}`, { method: 'DELETE' }),

    // Stock et Consommation Chimique
    getStockChimique: () => apiFetch(`${API_URL}/stock-chimique`),
    getConsommationsChimiques: () => apiFetch(`${API_URL}/consommations-chimiques`),
    addConsommationChimique: (data) => apiFetch(`${API_URL}/consommations-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    deleteConsommationChimique: (id) => apiFetch(`${API_URL}/consommations-chimiques/${id}`, { method: 'DELETE' }),

    // Recettes et Production
    getRecettes: () => apiFetch(`${API_URL}/recettes`),
    addRecette: (data) => apiFetch(`${API_URL}/recettes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    updateRecette: (id, data) => apiFetch(`${API_URL}/recettes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    deleteRecette: (id) => apiFetch(`${API_URL}/recettes/${id}`, { method: 'DELETE' }),
    addProduction: (data) => apiFetch(`${API_URL}/productions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    getProductionsDetails: () => apiFetch(`${API_URL}/productions/details`),
};

export default api;
