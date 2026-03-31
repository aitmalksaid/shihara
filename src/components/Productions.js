import React, { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';

const Productions = () => {
    const [recettes, setRecettes] = useState([]);
    const [productions, setProductions] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProdModal, setShowProdModal] = useState(false);
    const [showRecetteModal, setShowRecetteModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [prodData, setProdData] = useState({
        recette_id: '',
        poids_base: '',
        nb_peaux: '',
        date_production: new Date().toISOString().split('T')[0],
        commentaire: '',
        ingredients_ajustes: {}
    });

    const [recetteData, setRecetteData] = useState({
        nom: '',
        description: '',
        ingredients: [{ produit_nom: '', pourcentage: '' }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const results = await Promise.allSettled([
                api.getRecettes(),
                api.getProductionsDetails(),
                api.getStockChimique()
            ]);

            if (results[0].status === 'fulfilled') setRecettes(results[0].value || []);
            if (results[1].status === 'fulfilled') setProductions(results[1].value || []);
            if (results[2].status === 'fulfilled') setStock(results[2].value || []);

            // Log status of each call for debugging (invisible to user)
            results.forEach((res, i) => {
                if (res.status === 'rejected') console.warn(`API ${i} failed:`, res.reason);
            });
        } catch (error) {
            console.error('Erreur globale fetchData:', error);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement des données.' });
        } finally {
            setLoading(false);
        }
    };

    const handleProdInputChange = (e) => {
        const { name, value } = e.target;
        setProdData(prev => ({ ...prev, [name]: value }));
    };

    const handleProdSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.addProduction(prodData);
            if (result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: 'Production enregistrée avec succès. Le stock a été déduit.' });
            setShowProdModal(false);
            setProdData({
                recette_id: '',
                poids_base: '',
                nb_peaux: '',
                date_production: new Date().toISOString().split('T')[0],
                commentaire: '',
                ingredients_ajustes: {}
            });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de la production.' });
        }
    };

    const exportProductionToExcel = (prod) => {
        try {
            // 1. En-tête du document
            const header = [
                ['phase', prod.recette_nom || ''],
                ['date :', new Date(prod.date_production).toLocaleDateString()],
                ['nbr peaux', prod.nb_peaux || ''],
                ['poids', `${prod.poids_base} kg`],
                [], // Espace
                ['Produit', 'Quantité (kg)', 'Commentaire / Source']
            ];

            // 2. Récupérer les détails de la recette pour ce lot
            const recette = recettes.find(r => r.nom === prod.recette_nom || r.id === prod.recette_id);
            const ingredientsData = recette ? recette.ingredients.map(ing => [
                ing.produit_nom,
                (ing.pourcentage * prod.poids_base).toFixed(2),
                `Production #${prod.id} (Phase: ${prod.recette_nom})`
            ]) : [];

            const fullData = [...header, ...ingredientsData];

            // Création du classeur
            const worksheet = XLSX.utils.aoa_to_sheet(fullData);

            // Style des colonnes
            worksheet['!cols'] = [
                { wch: 30 }, // Produit
                { wch: 15 }, // Quantité
                { wch: 45 }  // Commentaire
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Fiche Production");

            const fileName = `Production_${prod.recette_nom.replace(/\s+/g, '_')}_${new Date(prod.date_production).toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error('Erreur export production:', error);
            alert('Erreur lors de la génération du fichier Excel');
        }
    };

    const selectedRecette = recettes.find(r => r.id === parseInt(prodData.recette_id));

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div><p>Chargement des formules et productions...</p></div>;

    return (
        <div className="container-fluid px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 text-gray-800 font-weight-bold">Traitement & Production</h1>
                    <p className="text-muted small mb-0">Gestion des formules chimiques et suivi des lots de production.</p>
                </div>
                <div>
                    <button className="btn btn-primary shadow-sm" onClick={() => setShowProdModal(true)}>
                        <i className="fas fa-plus-circle mr-2"></i> Lancer une Production
                    </button>
                </div>
            </div>

            {message.text && <div className={`alert alert-${message.type} shadow-sm mb-4 animate-on-show`}>{message.text}</div>}

            <div className="row">
                {/* Liste des Formules (Recettes) */}
                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">Formules Classiques</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                {recettes.map(r => (
                                    <div key={r.id} className="list-group-item list-group-item-action flex-column align-items-start py-3">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1 font-weight-bold text-dark">{r.nom}</h6>
                                            <small className="text-muted">{r.ingredients.length} ingr.</small>
                                        </div>
                                        <p className="mb-2 small text-muted text-italic">{r.description || 'Aucune description'}</p>
                                        <div className="bg-light p-2 rounded">
                                            {r.ingredients.slice(0, 3).map((ing, i) => (
                                                <span key={i} className="badge badge-outline-secondary mr-1 mb-1" style={{ fontSize: '0.65rem', border: '1px solid #ddd' }}>
                                                    {ing.produit_nom} ({(ing.pourcentage * 100).toFixed(1)}%)
                                                </span>
                                            ))}
                                            {r.ingredients.length > 3 && <small className="text-muted">...</small>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historique des Productions */}
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-dark">Historique des Lots de Production</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover table-sm">
                                    <thead className="thead-light">
                                        <tr className="small text-muted uppercase">
                                            <th>Date</th>
                                            <th>Formule / Phase</th>
                                            <th className="text-right">Poids Base</th>
                                            <th>Commentaire / Lot</th>
                                            <th className="text-center">Statut</th>
                                            <th className="text-right">Export</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productions.map((p) => (
                                            <tr key={p.id}>
                                                <td>{new Date(p.date_production).toLocaleDateString()}</td>
                                                <td className="font-weight-bold text-primary">{p.recette_nom}</td>
                                                <td className="text-right font-weight-bold">{p.poids_base} kg</td>
                                                <td className="small">{p.commentaire}</td>
                                                <td className="text-center">
                                                    <span className="badge badge-success px-2 py-1">Terminé</span>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Exporter en Excel"
                                                        onClick={() => exportProductionToExcel(p)}
                                                    >
                                                        <i className="fas fa-file-excel"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {productions.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    <i className="fas fa-history fa-2x mb-3 d-block opacity-25"></i>
                                                    Aucune production enregistrée pour le moment.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Lancement Production (Duplicate logic from Stock but here is better) */}
            {showProdModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show shadow-lg" style={{ maxWidth: '600px' }}>
                        <div className="modal-header bg-white border-bottom">
                            <h5 className="modal-title font-weight-bold text-primary">Lancer une Production</h5>
                            <button className="close" onClick={() => setShowProdModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleProdSubmit}>
                            <div className="modal-body bg-light" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="form-group">
                                    <label className="small font-weight-bold text-muted uppercase">Sélectionner la Formule</label>
                                    <select
                                        name="recette_id"
                                        className="form-control form-control-lg"
                                        value={prodData.recette_id}
                                        onChange={handleProdInputChange}
                                        required
                                    >
                                        <option value="">-- Choisir une phase --</option>
                                        {recettes.map(r => (
                                            <option key={r.id} value={r.id}>{r.nom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="small font-weight-bold text-muted uppercase">Poids de base (KG)</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    name="poids_base"
                                                    className="form-control"
                                                    placeholder="Poids Brut/Tripe"
                                                    value={prodData.poids_base}
                                                    onChange={handleProdInputChange}
                                                    required
                                                />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">kg</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="small font-weight-bold text-muted uppercase">Date Production</label>
                                            <input
                                                type="date"
                                                name="date_production"
                                                className="form-control"
                                                value={prodData.date_production}
                                                onChange={handleProdInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedRecette && prodData.poids_base && (
                                    <div className="mt-3 p-3 bg-white border rounded shadow-sm">
                                        <h6 className="font-weight-bold small text-uppercase text-primary border-bottom pb-2">Vérification de Stock (Besoins)</h6>
                                        <table className="table table-sm mb-0 mt-2">
                                            <thead>
                                                <tr className="small text-muted">
                                                    <th>Produit</th>
                                                    <th className="text-right">Besoin</th>
                                                    <th className="text-right">En Stock</th>
                                                    <th className="text-center">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedRecette.ingredients.map(ing => {
                                                    const qteRequise = ing.pourcentage * prodData.poids_base;
                                                    const stockItem = stock.find(s => s.nom === ing.produit_nom);
                                                    const currentStock = stockItem ? stockItem.stock : 0;
                                                    const isInsufficient = currentStock < qteRequise;

                                                    return (
                                                        <tr key={ing.id} className={isInsufficient ? 'table-danger' : ''}>
                                                            <td className="font-weight-bold small">{ing.produit_nom}</td>
                                                            <td className="text-right small font-weight-bold">{qteRequise.toFixed(2)} kg</td>
                                                            <td className="text-right small">{currentStock.toFixed(2)} kg</td>
                                                            <td className="text-center">
                                                                {isInsufficient ?
                                                                    <span className="badge badge-danger">Insuffisant</span> :
                                                                    <span className="badge badge-success">Ok</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {selectedRecette.ingredients.some(ing => (stock.find(s => s.nom === ing.produit_nom)?.stock || 0) < (ing.pourcentage * prodData.poids_base)) && (
                                            <div className="alert alert-danger mt-3 mb-0 small py-2">
                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                <strong>Attention :</strong> Stock insuffisant pour certains produits. L'enregistrement sera bloqué par le système.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="form-group mt-3">
                                    <label className="small font-weight-bold text-muted uppercase">N° Lot / Commentaire</label>
                                    <textarea
                                        name="commentaire"
                                        className="form-control"
                                        rows="2"
                                        placeholder="Ex: Lot #22070 - Victorica Box..."
                                        value={prodData.commentaire}
                                        onChange={handleProdInputChange}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-top">
                                <button type="button" className="btn btn-link text-muted" onClick={() => setShowProdModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-4 shadow-sm">Enregistrer & Déduire Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(45, 55, 72, 0.7); display: flex; align-items: start; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px); padding-top: 80px;
                }
                .modal-content { border-radius: 12px; border: none; overflow: hidden; }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid #edf2f7;
                    border-top: 3px solid #3182ce; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 1rem;
                }
                .badge-outline-secondary { color: #6c757d; background-color: transparent; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-on-show { transform: translateY(0); animation: slideDown 0.4s ease-out; }
                @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
};

export default Productions;
