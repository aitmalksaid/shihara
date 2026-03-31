import React, { useState, useEffect } from 'react';
import api from '../api';

const AchatsChimiques = () => {
    const [achats, setAchats] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [selectedAchat, setSelectedAchat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterFournisseur, setFilterFournisseur] = useState('ALL');
    const [filterDay, setFilterDay] = useState('ALL');
    const [filterMonth, setFilterMonth] = useState('ALL');
    const [filterYear, setFilterYear] = useState('ALL');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        type_achat: 'LOCAL',
        fournisseur: '',
        date_commande: '',
        num_commande: '',
        designation_commande: '',
        qte_commande: '',
        date_reception: '',
        num_reception: '',
        designation_reception: '',
        qte_reception: '',
        pu_reception: '',
        num_facture: '',
        date_facture: '',
        ht_facture: '',
        ttc: '',
        pu_euro: '',
        montant_euro: '',
        taux_change: '',
        transit: '',
        transport_supp: ''
    });

    useEffect(() => {
        fetchAchats();
        fetchFournisseurs();
        fetchProduits();
    }, []);

    const fetchProduits = async () => {
        try {
            const data = await api.getProduitsChimiques();
            setProduits(data || []);
        } catch (error) {
            console.error('Erreur produits:', error);
        }
    };

    const fetchAchats = async () => {
        try {
            setLoading(true);
            const data = await api.getAchatsChimiques();
            setAchats(data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des achats:', error);
            setMessage({ type: 'danger', text: 'Erreur lors de la récupération des achats chimiques.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchFournisseurs = async () => {
        try {
            const data = await api.getFournisseurs();
            // Filter only chemical suppliers if possible, but for now take all tagged as 'Produits Chimiques'
            setFournisseurs(data || []);
        } catch (error) {
            console.error('Erreur fournisseurs:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            let result;
            if (selectedAchat) {
                result = await api.updateAchatsChimique(selectedAchat.id, formData);
            } else {
                result = await api.addAchatsChimique(formData);
            }

            if (result && result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: selectedAchat ? 'Achat mis à jour' : 'Achat ajouté avec succès' });
            setShowModal(false);
            fetchAchats();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de la sauvegarde' });
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProductName.trim()) return;
        try {
            await api.addProduitChimique(newProductName.trim());
            await fetchProduits();
            setFormData(prev => ({ ...prev, designation_commande: newProductName.trim() }));
            setNewProductName('');
            setShowNewProductModal(false);
        } catch (error) {
            console.error('Erreur ajout produit:', error);
        }
    };

    const openEditModal = (achat) => {
        setSelectedAchat(achat);
        setFormData({
            ...achat,
            date_commande: achat.date_commande ? achat.date_commande.split('T')[0] : '',
            date_reception: achat.date_reception ? achat.date_reception.split('T')[0] : '',
            date_facture: achat.date_facture ? achat.date_facture.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet achat ?')) {
            try {
                await api.deleteAchatsChimique(id);
                setMessage({ type: 'success', text: 'Achat supprimé' });
                fetchAchats();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Erreur lors de la suppression' });
            }
        }
    };

    const resetForm = () => {
        setSelectedAchat(null);
        setFormData({
            type_achat: 'LOCAL',
            fournisseur: '',
            date_commande: new Date().toISOString().split('T')[0],
            num_commande: '',
            designation_commande: '',
            qte_commande: '',
            date_reception: '',
            num_reception: '',
            designation_reception: '',
            qte_reception: '',
            pu_reception: '',
            num_facture: '',
            date_facture: '',
            ht_facture: '',
            ttc: '',
            pu_euro: '',
            montant_euro: '',
            taux_change: '',
            transit: '',
            transport_supp: ''
        });
        setShowModal(true);
    };

    const fournisseursUniques = [...new Set(achats.map(a => a.fournisseur))].sort();

    const filteredAchats = achats.filter(a => {
        const matchesSearch = (
            (a.designation_commande && a.designation_commande.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.designation_reception && a.designation_reception.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.fournisseur && a.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.num_facture && a.num_facture.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const matchesType = filterType === 'ALL' || a.type_achat === filterType;
        const matchesFournisseur = filterFournisseur === 'ALL' || a.fournisseur === filterFournisseur;

        let matchesDate = true;
        if (a.date_commande) {
            const date = new Date(a.date_commande);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            if (filterDay !== 'ALL' && day !== parseInt(filterDay)) matchesDate = false;
            if (filterMonth !== 'ALL' && month !== parseInt(filterMonth)) matchesDate = false;
            if (filterYear !== 'ALL' && year !== parseInt(filterYear)) matchesDate = false;
        } else if (filterDay !== 'ALL' || filterMonth !== 'ALL' || filterYear !== 'ALL') {
            matchesDate = false;
        }

        return matchesSearch && matchesType && matchesFournisseur && matchesDate;
    });

    const years = [...new Set(achats.map(a => a.date_commande ? new Date(a.date_commande).getFullYear() : null).filter(y => y))].sort((a, b) => b - a);
    const months = [
        { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
        { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
        { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
        { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div><p>Chargement des achats chimiques...</p></div>;

    return (
        <div className="container-fluid px-4">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h1 className="h4 mb-0 text-primary font-weight-bold">Gestion des Achats Chimiques</h1>
                    <button className="btn btn-primary" onClick={resetForm}>
                        + Nouvel Achat
                    </button>
                </div>

                <div className="card-body">
                    {message.text && <div className={`alert alert-${message.type} shadow-sm`}>{message.text}</div>}

                    <div className="d-flex align-items-center mb-3 bg-light p-2 rounded shadow-sm" style={{ gap: '8px', fontSize: '0.85rem' }}>
                        <div className="input-group input-group-sm" style={{ flex: '2', minWidth: '150px' }}>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-white border-right-0"><i className="fas fa-search text-muted"></i></span>
                            </div>
                            <input
                                type="text"
                                className="form-control border-left-0"
                                placeholder="Recherche..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select className="form-control form-control-sm px-1" style={{ flex: '1', minWidth: '90px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="ALL">Tout Type</option>
                            <option value="IMPORT">IMPORT</option>
                            <option value="LOCAL">LOCAL</option>
                        </select>

                        <select className="form-control form-control-sm px-1" style={{ flex: '1.5', minWidth: '130px' }} value={filterFournisseur} onChange={(e) => setFilterFournisseur(e.target.value)}>
                            <option value="ALL">Fournisseur (Tous)</option>
                            {fournisseursUniques.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>

                        <div className="d-flex align-items-center bg-white border rounded px-2 py-1" style={{ gap: '5px' }}>
                            <i className="far fa-calendar-alt text-muted small"></i>
                            <select className="border-0 bg-transparent small p-0" style={{ width: '40px', outline: 'none' }} value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                                <option value="ALL">Jr</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <span className="text-muted">/</span>
                            <select className="border-0 bg-transparent small p-0" style={{ width: '80px', outline: 'none' }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                <option value="ALL">Mois</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <span className="text-muted">/</span>
                            <select className="border-0 bg-transparent small p-0" style={{ width: '55px', outline: 'none' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                <option value="ALL">Année</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <button
                            className="btn btn-sm btn-light border ml-1"
                            onClick={() => { setSearchTerm(''); setFilterType('ALL'); setFilterFournisseur('ALL'); setFilterDay('ALL'); setFilterMonth('ALL'); setFilterYear('ALL'); }}
                            title="Réinitialiser"
                        >
                            <i className="fas fa-sync-alt text-muted"></i>
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-sm">
                            <thead className="thead-light">
                                <tr>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Fournisseur</th>
                                    <th>Référence</th>
                                    <th>Désignation</th>
                                    <th className="text-right">Qte</th>
                                    <th className="text-right">Total MAD</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAchats.map((a) => (
                                    <tr key={a.id}>
                                        <td>
                                            <span className={`badge ${a.type_achat === 'IMPORT' ? 'badge-info' : 'badge-success'}`}>
                                                {a.type_achat}
                                            </span>
                                        </td>
                                        <td>{a.date_commande ? new Date(a.date_commande).toLocaleDateString() : '-'}</td>
                                        <td className="font-weight-bold">{a.fournisseur}</td>
                                        <td><small className="text-muted">{a.num_commande || a.num_reception}</small></td>
                                        <td>{a.designation_commande || a.designation_reception}</td>
                                        <td className="text-right">{a.qte_commande || a.qte_reception}</td>
                                        <td className="text-right font-weight-bold text-dark">
                                            {a.ttc ? parseFloat(a.ttc).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '-'}
                                        </td>
                                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                            <button
                                                className="btn btn-sm btn-outline-primary mr-1"
                                                title="Modifier"
                                                onClick={() => openEditModal(a)}
                                                style={{ lineHeight: 1, padding: '3px 7px', fontSize: '13px' }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                title="Supprimer"
                                                onClick={() => handleDelete(a.id)}
                                                style={{ lineHeight: 1, padding: '3px 7px', fontSize: '13px' }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-light font-weight-bold">
                                <tr>
                                    <td colSpan="5" className="text-right text-uppercase small">Total</td>
                                    <td className="text-right">{filteredAchats.reduce((sum, a) => sum + (parseFloat(a.qte_commande || a.qte_reception) || 0), 0).toLocaleString('fr-FR')}</td>
                                    <td className="text-right text-primary">
                                        {filteredAchats.reduce((sum, a) => sum + (parseFloat(a.ttc) || 0), 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show" style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h5 className="modal-title font-weight-bold">
                                {selectedAchat ? 'Modifier Achat' : 'Saisir un Nouvel Achat'}
                            </h5>
                            <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <label className="font-weight-bold">Type d'achat</label>
                                        <select name="type_achat" className="form-control bg-light" value={formData.type_achat} onChange={handleInputChange}>
                                            <option value="LOCAL">LOCAL</option>
                                            <option value="IMPORT">IMPORT</option>
                                        </select>
                                    </div>
                                    <div className="col-md-5">
                                        <label className="font-weight-bold">Fournisseur</label>
                                        <select name="fournisseur" className="form-control" value={formData.fournisseur} onChange={handleInputChange} required>
                                            <option value="">Sélectionner...</option>
                                            {fournisseurs.filter(f => f.categorie === 'Produits Chimiques').map(f => (
                                                <option key={f.id} value={f.nom}>{f.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="font-weight-bold">Date Commande</label>
                                        <input type="date" name="date_commande" className="form-control" value={formData.date_commande} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="p-3 mb-3 border rounded bg-light">
                                    <h6 className="font-weight-bold text-muted border-bottom pb-2 mb-3">Détails Commande / Réception</h6>
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <label className="small">N° Commande</label>
                                            <input type="text" name="num_commande" className="form-control" value={formData.num_commande} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-8">
                                            <label className="small">Désignation</label>
                                            <div className="d-flex shadow-sm">
                                                <select
                                                    name="designation_commande"
                                                    className="form-control"
                                                    value={formData.designation_commande}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Sélectionner un produit...</option>
                                                    {produits.map(p => (
                                                        <option key={p.id} value={p.nom}>{p.nom}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary ml-1"
                                                    onClick={() => setShowNewProductModal(true)}
                                                    title="Nouveau produit"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label className="small">Qte</label>
                                            <input type="number" step="any" name="qte_commande" className="form-control" value={formData.qte_commande} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small">P.U Récep (LOCAL)</label>
                                            <input type="number" step="any" name="pu_reception" className="form-control" value={formData.pu_reception} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small font-weight-bold text-primary">TTC Total (MAD)</label>
                                            <input type="number" step="any" name="ttc" className="form-control border-primary" value={formData.ttc} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>

                                {formData.type_achat === 'IMPORT' && (
                                    <div className="p-3 mb-3 border rounded border-info">
                                        <h6 className="font-weight-bold text-info border-bottom pb-2 mb-3">Informations Import (Devises)</h6>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <label className="small">P.U (€)</label>
                                                <input type="number" step="any" name="pu_euro" className="form-control" value={formData.pu_euro} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small">Total (€)</label>
                                                <input type="number" step="any" name="montant_euro" className="form-control" value={formData.montant_euro} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small">Taux de change</label>
                                                <input type="number" step="any" name="taux_change" className="form-control" value={formData.taux_change} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small">Transit / Frais</label>
                                                <input type="number" step="any" name="transit" className="form-control" value={formData.transit} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light p-3">
                                <button type="button" className="btn btn-link text-muted mr-auto" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-5 shadow-sm">
                                    {selectedAchat ? 'Sauvegarder les modifications' : 'Enregistrer l\'achat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showNewProductModal && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content animate-on-show" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h5 className="modal-title font-weight-bold">Nouveau Produit</h5>
                            <button className="close" onClick={() => setShowNewProductModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nom du produit chimique</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-link text-muted" onClick={() => setShowNewProductModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-4">Ajouter au catalogue</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: start; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px); padding-top: 50px;
                }
                .modal-content { 
                    background: white; border-radius: 12px; border: none; 
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid #edf2f7;
                    border-top: 3px solid #3182ce; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AchatsChimiques;
