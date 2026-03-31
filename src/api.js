const API_URL = 'http://localhost:5000/api';

const api = {
    // Clients
    getClients: () => fetch(`${API_URL}/clients`).then(res => res.json()),
    addClient: (client) => fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
    }).then(res => res.json()),
    updateClient: (id, client) => fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
    }).then(res => res.json()),
    deleteClient: (id) => fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Commandes
    getCommandes: () => fetch(`${API_URL}/commandes`).then(res => res.json()),
    addCommande: (commande) => fetch(`${API_URL}/commandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commande)
    }).then(res => res.json()),
    updateCommande: (id, commande) => fetch(`${API_URL}/commandes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commande)
    }).then(res => res.json()),
    deleteCommande: (id) => fetch(`${API_URL}/commandes/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),
    getArticlesCommande: (commandeId) => fetch(`${API_URL}/commandes/${commandeId}/articles`).then(res => res.json()),

    // Teintures
    getTeintures: () => fetch(`${API_URL}/teintures`).then(res => res.json()),
    addTeinture: (teinture) => fetch(`${API_URL}/teintures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teinture)
    }).then(res => res.json()),
    updateTeinture: (id, teinture) => fetch(`${API_URL}/teintures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teinture)
    }).then(res => res.json()),
    deleteTeinture: (id) => fetch(`${API_URL}/teintures/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Couleurs
    getCouleurs: () => fetch(`${API_URL}/couleurs`).then(res => res.json()),
    addCouleur: (couleur) => fetch(`${API_URL}/couleurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couleur)
    }).then(res => res.json()),
    updateCouleur: (id, couleur) => fetch(`${API_URL}/couleurs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couleur)
    }).then(res => res.json()),
    deleteCouleur: (id) => fetch(`${API_URL}/couleurs/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Fournisseurs
    getFournisseurs: () => fetch(`${API_URL}/fournisseurs?t=${new Date().getTime()}`).then(res => res.json()),
    getFournisseursAvecReceptions: () => fetch(`${API_URL}/fournisseurs/avec-receptions-pendantes`).then(res => res.json()),
    addFournisseur: (fournisseur) => fetch(`${API_URL}/fournisseurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fournisseur)
    }).then(res => res.json()),
    updateFournisseur: (id, fournisseur) => fetch(`${API_URL}/fournisseurs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fournisseur)
    }).then(res => res.json()),
    deleteFournisseur: (id) => fetch(`${API_URL}/fournisseurs/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Réceptions de Peaux
    getReceptions: () => fetch(`${API_URL}/receptions`).then(res => res.json()),
    getReceptionById: (id) => fetch(`${API_URL}/receptions/${id}`).then(res => res.json()),
    addReception: (reception) => fetch(`${API_URL}/receptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reception)
    }).then(res => res.json()),
    updateReception: (id, reception) => fetch(`${API_URL}/receptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reception)
    }).then(res => res.json()),
    deleteReception: (id) => fetch(`${API_URL}/receptions/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),
    getReceptionsNonFacturees: (fournisseurId) => {
        const timestamp = new Date().getTime();
        const baseUrl = fournisseurId ? `${API_URL}/receptions/non-facturees/${fournisseurId}` : `${API_URL}/receptions/non-facturees`;
        const url = `${baseUrl}?t=${timestamp}`;
        return fetch(url).then(res => res.json());
    },

    // Factures Fournisseurs
    getFacturesFournisseurs: () => fetch(`${API_URL}/factures-fournisseurs?t=${new Date().getTime()}`).then(res => res.json()),
    getInvoiceReceptions: (id) => fetch(`${API_URL}/factures-fournisseurs/${id}/receptions`).then(res => res.json()),
    addFactureFournisseur: (facture) => fetch(`${API_URL}/factures-fournisseurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facture)
    }).then(res => res.json()),
    updateFactureStatut: (id, statut) => fetch(`${API_URL}/factures-fournisseurs/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
    }).then(res => res.json()),
    deleteFactureFournisseur: (id) => fetch(`${API_URL}/factures-fournisseurs/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Achats Produits Chimiques
    getAchatsChimiques: () => fetch(`${API_URL}/achats-chimiques`).then(res => res.json()),
    addAchatsChimique: (achat) => fetch(`${API_URL}/achats-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achat)
    }).then(res => res.json()),
    updateAchatsChimique: (id, achat) => fetch(`${API_URL}/achats-chimiques/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achat)
    }).then(res => res.json()),
    deleteAchatsChimique: (id) => fetch(`${API_URL}/achats-chimiques/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Produits Chimiques (Désignations)
    getProduitsChimiques: () => fetch(`${API_URL}/produits-chimiques`).then(res => res.json()),
    addProduitChimique: (nom, seuil_min = 0) => fetch(`${API_URL}/produits-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, seuil_min })
    }).then(res => res.json()),
    updateProduitChimique: (id, nom, seuil_min = 0) => fetch(`${API_URL}/produits-chimiques/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, seuil_min })
    }).then(res => res.json()),
    deleteProduitChimique: (id) => fetch(`${API_URL}/produits-chimiques/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Stock et Consommation Chimique
    getStockChimique: () => fetch(`${API_URL}/stock-chimique`).then(res => res.json()),
    getConsommationsChimiques: () => fetch(`${API_URL}/consommations-chimiques`).then(res => res.json()),
    addConsommationChimique: (data) => fetch(`${API_URL}/consommations-chimiques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteConsommationChimique: (id) => fetch(`${API_URL}/consommations-chimiques/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),

    // Recettes et Production
    getRecettes: () => fetch(`${API_URL}/recettes`).then(res => res.json()),
    addRecette: (data) => fetch(`${API_URL}/recettes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateRecette: (id, data) => fetch(`${API_URL}/recettes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteRecette: (id) => fetch(`${API_URL}/recettes/${id}`, {
        method: 'DELETE'
    }).then(res => res.json()),
    addProduction: (data) => fetch(`${API_URL}/productions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    getProductionsDetails: () => fetch(`${API_URL}/productions/details`).then(res => res.json()),
};

export default api;
