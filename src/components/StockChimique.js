import React, { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';

const StockChimique = () => {
    const [stock, setStock] = useState([]);
    const [consommations, setConsommations] = useState([]);
    const [produits, setProduits] = useState([]);
    const [recettes, setRecettes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showProdModal, setShowProdModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        produit_nom: '',
        quantite: '',
        date_consommation: new Date().toISOString().split('T')[0],
        commentaire: ''
    });

    const [prodData, setProdData] = useState({
        recette_id: '',
        poids_base: '',
        nb_peaux: '',
        date_production: new Date().toISOString().split('T')[0],
        commentaire: '',
        ingredients_ajustes: {}
    });

    useEffect(() => {
        fetchData();
        fetchRecettes();
    }, []);

    const fetchRecettes = async () => {
        try {
            const data = await api.getRecettes();
            setRecettes(data || []);
        } catch (error) {
            console.error('Erreur recettes:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stockData, consoData, prodData] = await Promise.all([
                api.getStockChimique(),
                api.getConsommationsChimiques(),
                api.getProduitsChimiques()
            ]);
            setStock(stockData || []);
            setConsommations(consoData || []);
            setProduits(prodData || []);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement du stock.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProdInputChange = (e) => {
        const { name, value } = e.target;
        setProdData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.addConsommationChimique(formData);
            if (result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: 'Consommation enregistrée avec succès.' });
            setShowModal(false);
            setFormData({
                produit_nom: '',
                quantite: '',
                date_consommation: new Date().toISOString().split('T')[0],
                commentaire: ''
            });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de l\'enregistrement.' });
        }
    };

    const handleProdSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.addProduction(prodData);
            if (result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: 'Production enregistrée et stock mis à jour (déduction automatique selon formule).' });
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

    const exportToExcel = () => {
        try {
            const dataToExport = consommations.map(c => ({
                'Produit': c.produit_nom,
                'Quantité (kg)': c.quantite,
                'Date': new Date(c.date_consommation).toLocaleDateString('fr-FR'),
                'Commentaire / Source': c.commentaire || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Calculer les colonnes
            const wscols = [
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 40 }
            ];
            worksheet['!cols'] = wscols;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sorties Stock");

            XLSX.writeFile(workbook, `Consommations_Chimiques_Shihara_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Erreur export:', error);
            alert('Erreur lors de l\'exportation Excel');
        }
    };

    const handleDeleteConso = async (id) => {
        if (window.confirm('Voulez-vous supprimer cette sortie de stock ?')) {
            try {
                await api.deleteConsommationChimique(id);
                setMessage({ type: 'success', text: 'Entrée supprimée.' });
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Erreur lors de la suppression.' });
            }
        }
    };

    const selectedRecette = recettes.find(r => r.id === parseInt(prodData.recette_id));

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div><p>Calcul du stock en cours...</p></div>;

    return (
        <div className="container-fluid px-4">
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h1 className="h3 mb-0 text-gray-800 font-weight-bold">Gestion des Stocks Chimiques</h1>
                </div>
                <div className="col-md-6 text-right">
                    <button className="btn btn-primary shadow-sm mr-2" onClick={() => setShowProdModal(true)}>
                        <i className="fas fa-flask mr-2"></i> Nouvelle Production (Formule)
                    </button>
                    <button className="btn btn-danger shadow-sm" onClick={() => setShowModal(true)}>
                        <i className="fas fa-minus-circle mr-2"></i> Sortie Manuelle
                    </button>
                    <button className="btn btn-outline-primary ml-2 shadow-sm" onClick={fetchData}>
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            {message.text && <div className={`alert alert-${message.type} shadow-sm fade-in`}>{message.text}</div>}

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">État du Stock Actuel</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover table-sm">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th className="text-right">Total Entrées (Achat)</th>
                                            <th className="text-right">Total Sorties (Conso)</th>
                                            <th className="text-right text-muted italic">Seuil Min</th>
                                            <th className="text-right">Stock Actuel</th>
                                            <th className="text-center">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stock
                                            .sort((a, b) => {
                                                const aCritique = a.stock <= (a.seuil_min || 0);
                                                const bCritique = b.stock <= (b.seuil_min || 0);
                                                const aBas = a.stock <= (a.seuil_min || 0) * 1.5;
                                                const bBas = b.stock <= (b.seuil_min || 0) * 1.5;

                                                if (aCritique && !bCritique) return -1;
                                                if (!aCritique && bCritique) return 1;
                                                if (aBas && !bBas) return -1;
                                                if (!aBas && bBas) return 1;
                                                return a.nom.localeCompare(b.nom);
                                            })
                                            .map((s, idx) => {
                                                const stockLevel = s.stock;
                                                const seuil = s.seuil_min || 0;

                                                // Calcul du statut dynamique basé sur le seuil min
                                                let statusClass = 'bg-success';
                                                let statusText = 'Ok';

                                                if (stockLevel <= seuil) {
                                                    statusClass = 'bg-danger';
                                                    statusText = 'Critique';
                                                } else if (stockLevel <= seuil * 1.5) {
                                                    statusClass = 'bg-warning text-dark';
                                                    statusText = 'Bas';
                                                }

                                                return (
                                                    <tr key={idx} className={stockLevel <= seuil ? 'table-warning' : ''}>
                                                        <td className="font-weight-bold">{s.nom}</td>
                                                        <td className="text-right">{s.entree.toLocaleString()} kg</td>
                                                        <td className="text-right text-danger">-{s.sortie.toLocaleString()} kg</td>
                                                        <td className="text-right text-muted italic" style={{ fontSize: '0.85rem' }}>
                                                            {seuil > 0 ? `${seuil.toLocaleString()} kg` : '-'}
                                                        </td>
                                                        <td className={`text-right font-weight-bold ${stockLevel <= seuil ? 'text-danger' : 'text-primary'}`}>
                                                            {stockLevel.toLocaleString()} kg
                                                        </td>
                                                        <td className="text-center">
                                                            <span className={`badge ${statusClass} px-2 py-1`} style={{ minWidth: '70px' }}>
                                                                {statusText}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        {stock.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted">Aucun stock disponible. Enregistrez des achats d'abord.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-dark">Dernières Consommations</h6>
                            {consommations.length > 0 && (
                                <button className="btn btn-sm btn-success shadow-sm" onClick={exportToExcel}>
                                    <i className="fas fa-file-excel mr-1"></i> Export
                                </button>
                            )}
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th className="text-right">Qte</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consommations.map((c, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2">
                                                    <div className="font-weight-bold text-primary">{c.produit_nom}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {new Date(c.date_consommation).toLocaleDateString()}
                                                        {c.commentaire && ` • ${c.commentaire}`}
                                                    </div>
                                                </td>
                                                <td className="text-right font-weight-bold text-danger py-2">
                                                    -{c.quantite}
                                                </td>
                                                <td className="text-center py-2">
                                                    <button
                                                        className="btn btn-sm text-danger p-0"
                                                        onClick={() => handleDeleteConso(c.id)}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {consommations.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-muted">Aucune sortie enregistrée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Résumé par produit en bas */}
                            {consommations.length > 0 && (
                                <div className="p-3 bg-light border-top">
                                    <h6 className="small font-weight-bold text-muted text-uppercase mb-2">Résumé par produit (Sorties Totales)</h6>
                                    <div className="bg-white rounded border overflow-hidden">
                                        <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.8rem' }}>
                                            <tbody>
                                                {Object.entries(
                                                    consommations.reduce((acc, c) => {
                                                        acc[c.produit_nom] = (acc[c.produit_nom] || 0) + parseFloat(c.quantite);
                                                        return acc;
                                                    }, {})
                                                ).sort((a, b) => b[1] - a[1]).map(([prod, total], idx) => (
                                                    <tr key={idx} className={idx !== 0 ? 'border-top' : ''}>
                                                        <td className="py-1 pl-3 font-weight-bold text-dark">{prod}</td>
                                                        <td className="py-1 pr-3 text-right text-danger font-weight-bold">-{total.toFixed(2)} kg</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showProdModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show shadow-lg" style={{ maxWidth: '600px' }}>
                        <div className="modal-header bg-white border-bottom">
                            <h5 className="modal-title font-weight-bold text-primary">Lancer une Production (Formule)</h5>
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
                                            <option key={r.id} value={r.id}>{r.nom} ({r.description})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="small font-weight-bold text-muted uppercase">Poids de base (KG)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="poids_base"
                                                className="form-control"
                                                placeholder="Pds Brut / Tripe / Derayé"
                                                value={prodData.poids_base}
                                                onChange={handleProdInputChange}
                                                required
                                            />
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
                                                <strong>Attention :</strong> Stock insuffisant. L'enregistrement sera bloqué.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="form-group mt-3">
                                    <label className="small font-weight-bold text-muted uppercase">Commentaire / Lot N°</label>
                                    <textarea
                                        name="commentaire"
                                        className="form-control"
                                        rows="2"
                                        placeholder="Note sur le lot ou la raie..."
                                        value={prodData.commentaire}
                                        onChange={handleProdInputChange}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-top">
                                <button type="button" className="btn btn-link text-muted" onClick={() => setShowProdModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-4 shadow-sm">Valider la Production</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show shadow-lg" style={{ maxWidth: '450px' }}>
                        <div className="modal-header bg-white border-bottom">
                            <h5 className="modal-title font-weight-bold text-danger">Sortie Manuelle de Stock</h5>
                            <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body bg-light">
                                <div className="form-group">
                                    <label className="small font-weight-bold text-muted uppercase">Produit Chimique</label>
                                    <select
                                        name="produit_nom"
                                        className="form-control"
                                        value={formData.produit_nom}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Sélectionner un produit...</option>
                                        {produits.map(p => (
                                            <option key={p.id} value={p.nom}>{p.nom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label className="small font-weight-bold text-muted uppercase">Quantité (kg)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="quantite"
                                                className="form-control"
                                                value={formData.quantite}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label className="small font-weight-bold text-muted uppercase">Date</label>
                                            <input
                                                type="date"
                                                name="date_consommation"
                                                className="form-control"
                                                value={formData.date_consommation}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="small font-weight-bold text-muted uppercase">Commentaire / Destination</label>
                                    <textarea
                                        name="commentaire"
                                        className="form-control"
                                        rows="2"
                                        placeholder="Ex: Teinture Lot #123..."
                                        value={formData.commentaire}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-top">
                                <button type="button" className="btn btn-link text-muted" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-danger px-4 shadow-sm">Valider la sortie</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6); display: flex; align-items: start; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px); padding-top: 80px;
                }
                .modal-content { border-radius: 12px; border: none; overflow: hidden; }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid #edf2f7;
                    border-top: 3px solid #3182ce; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .fade-in { animation: fadeIn 0.3s ease-in; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-on-show { transform: translateY(0); animation: slideDown 0.4s ease-out; }
                @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default StockChimique;
