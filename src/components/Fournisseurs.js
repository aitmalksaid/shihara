import React, { useState, useEffect } from 'react';
import api from '../api';

const Fournisseurs = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFournisseur, setSelectedFournisseur] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        cin: '',
        categorie: 'Produits Chimiques',
        code: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('ALL');

    const [achats, setAchats] = useState([]);
    const [activeTab, setActiveTab] = useState('fournisseurs');

    useEffect(() => {
        fetchFournisseurs();
        fetchAchats();
    }, []);

    const fetchAchats = async () => {
        try {
            const data = await api.getAchatsChimiques();
            setAchats(data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des achats:', error);
        }
    };

    const fetchFournisseurs = async () => {
        try {
            setLoading(true);
            const data = await api.getFournisseurs();
            setFournisseurs(data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des fournisseurs:', error);
            setMessage({ type: 'danger', text: 'Erreur lors de la récupération des fournisseurs' });
        } finally {
            setLoading(false);
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
            if (selectedFournisseur) {
                result = await api.updateFournisseur(selectedFournisseur.id, formData);
            } else {
                result = await api.addFournisseur(formData);
            }

            if (result && result.error) {
                throw new Error(result.error);
            }

            setMessage({
                type: 'success',
                text: selectedFournisseur ? 'Fournisseur mis à jour' : 'Fournisseur ajouté avec succès'
            });

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

            setFormData({ nom: '', telephone: '', email: '', cin: '', categorie: 'Produits Chimiques', code: '' });
            setSelectedFournisseur(null);
            setShowModal(false);
            fetchFournisseurs();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de la sauvegarde' });
        }
    };

    const openEditModal = (f) => {
        setSelectedFournisseur(f);
        setFormData({
            nom: f.nom,
            telephone: f.telephone || '',
            email: f.email || '',
            cin: f.cin || '',
            categorie: f.categorie || 'Autre',
            code: f.code || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id, nom) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${nom}" ?`)) {
            try {
                const result = await api.deleteFournisseur(id);
                if (result && result.error) {
                    throw new Error(result.error);
                }
                setMessage({ type: 'success', text: 'Fournisseur supprimé avec succès' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                fetchFournisseurs();
            } catch (error) {
                console.error('Erreur suppression:', error);
                setMessage({ type: 'danger', text: error.message || 'Erreur lors de la suppression' });
            }
        }
    };


    const filteredFournisseurs = fournisseurs.filter(f => {
        const matchesSearch = f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategorie = filterCategorie === 'ALL' || f.categorie === filterCategorie;
        return matchesSearch && matchesCategorie;
    });

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div><p>Chargement des fournisseurs...</p></div>;

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div className="card shadow-lg">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 className="card-title mb-0">Annuaire Fournisseurs</h1>
                    <div className="btn-group">
                        <button
                            className={`btn ${activeTab === 'fournisseurs' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('fournisseurs')}
                        >
                            <i className="fas fa-users"></i> Liste
                        </button>
                        <button
                            className={`btn ${activeTab === 'achats' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('achats')}
                        >
                            <i className="fas fa-file-import"></i> Achats Importés
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {message.text && (
                        <div className={`alert alert-${message.type} fade-in`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'fournisseurs' ? (
                        <>
                            <div className="row mb-4 align-items-end">
                                <div className="col-md-4">
                                    <div className="form-group mb-0">
                                        <label className="text-muted small font-weight-bold">Rechercher</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom, email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group mb-0">
                                        <label className="text-muted small font-weight-bold">Catégorie</label>
                                        <select
                                            className="form-control"
                                            value={filterCategorie}
                                            onChange={(e) => setFilterCategorie(e.target.value)}
                                        >
                                            <option value="ALL">Toutes les catégories</option>
                                            <option value="Produits Chimiques">Produits Chimiques</option>
                                            <option value="Peaux">Peaux</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-5 text-right">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => {
                                            setSelectedFournisseur(null);
                                            setFormData({ nom: '', telephone: '', email: '', cin: '', categorie: 'Produits Chimiques', code: '' });
                                            setShowModal(true);
                                        }}
                                    >
                                        <i className="fas fa-plus"></i> Nouveau Fournisseur
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Code</th>
                                            <th>Nom</th>
                                            <th>Catégorie</th>
                                            <th>Contact</th>
                                            <th>CIN</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFournisseurs.map(f => (
                                            <tr key={f.id}>
                                                <td className="font-weight-bold text-primary">{f.code || '-'}</td>
                                                <td>
                                                    <div className="font-weight-bold">{f.nom}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${f.categorie === 'Produits Chimiques' ? 'badge-info' :
                                                        f.categorie === 'Peaux' ? 'badge-warning' : 'badge-secondary'
                                                        }`}>
                                                        {f.categorie || 'Non défini'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        {f.telephone && <div><i className="fas fa-phone mr-1"></i> {f.telephone}</div>}
                                                        {f.email && <div><i className="fas fa-envelope mr-1"></i> {f.email}</div>}
                                                        {!f.telephone && !f.email && <span className="text-muted italic">Pas de contact</span>}
                                                    </div>
                                                </td>
                                                <td className="small text-truncate" style={{ maxWidth: '200px' }}>
                                                    {f.cin || '-'}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary mr-1"
                                                        onClick={() => openEditModal(f)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i> Modifier
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(f.id, f.nom)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i> Suppr
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredFournisseurs.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5">
                                                    <div className="text-muted">Aucun fournisseur ne correspond à votre recherche.</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="table-responsive">
                            <div className="alert alert-info py-2 small mb-3">
                                <i className="fas fa-info-circle"></i> Ces données proviennent directement de votre fichier Excel importé.
                            </div>
                            <table className="table table-striped table-sm" style={{ fontSize: '0.85em' }}>
                                <thead className="thead-dark">
                                    <tr>
                                        <th>Date</th>
                                        <th>Fournisseur</th>
                                        <th>Commande</th>
                                        <th>Désignation</th>
                                        <th className="text-right">Qte</th>
                                        <th>Réception</th>
                                        <th className="text-right">Total MAD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {achats.map((a, idx) => (
                                        <tr key={idx}>
                                            <td>{a.date_commande ? new Date(a.date_commande).toLocaleDateString() : '-'}</td>
                                            <td className="font-weight-bold">{a.fournisseur}</td>
                                            <td>{a.num_commande}</td>
                                            <td>{a.designation_commande || a.designation_reception}</td>
                                            <td className="text-right">{a.qte_commande ? parseFloat(a.qte_commande).toLocaleString() : '-'}</td>
                                            <td>{a.num_reception}</td>
                                            <td className="text-right font-weight-bold">
                                                {a.ttc ? parseFloat(a.ttc).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {achats.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">Aucun achat importé trouvé.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content animate-on-show">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">
                                    {selectedFournisseur ? (
                                        <><i className="fas fa-user-edit mr-2"></i> Modifier Fournisseur</>
                                    ) : (
                                        <><i className="fas fa-user-plus mr-2"></i> Ajouter Fournisseur</>
                                    )}
                                </h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label className="font-weight-bold">Code Suffixe</label>
                                                <input type="text" name="code" className="form-control form-control-lg" value={formData.code} onChange={handleInputChange} placeholder="ex: 12" />
                                                <small className="text-muted">Utilisé pour le N° Entrée (ex: 816/12)</small>
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <div className="form-group">
                                                <label className="font-weight-bold">Nom du Fournisseur</label>
                                                <input type="text" name="nom" className="form-control form-control-lg" value={formData.nom} onChange={handleInputChange} required placeholder="Ex: NOVAKEM" />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="font-weight-bold">Catégorie</label>
                                                <select name="categorie" className="form-control form-control-lg" value={formData.categorie} onChange={handleInputChange}>
                                                    <option value="Produits Chimiques">Produits Chimiques</option>
                                                    <option value="Peaux">Peaux</option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold">Téléphone</label>
                                                <input type="text" name="telephone" className="form-control" value={formData.telephone} onChange={handleInputChange} placeholder="06..." />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold">Email</label>
                                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} placeholder="contact@..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="font-weight-bold">CIN</label>
                                        <input type="text" name="cin" className="form-control" value={formData.cin} onChange={handleInputChange} placeholder="Numéro CIN..." />
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-link text-muted" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        {selectedFournisseur ? 'Sauvegarder les modifications' : 'Créer le fournisseur'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .container { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
                .card { border-radius: 12px; border: none; overflow: hidden; }
                .card-header { background: #fff; border-bottom: 1px solid #edf2f7; padding: 1.5rem; }
                .card-title { color: #1a202c; font-weight: 700; letter-spacing: -0.025em; }
                .btn { border-radius: 8px; font-weight: 600; }
                .badge { padding: 0.5em 0.75em; border-radius: 6px; }
                .table thead th { border-top: none; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: #718096; }
                .table td { vertical-align: middle; }
                
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px);
                }
                .modal-dialog { width: 100%; max-width: 600px; padding: 1rem; }
                .modal-content { border-radius: 12px; border: none; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .animate-on-show { animation: slideUp 0.3s ease-out; }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
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

export default Fournisseurs;
