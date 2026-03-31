import React, { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';

const ProduitsChimiques = () => {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduit, setSelectedProduit] = useState(null);
    const [nom, setNom] = useState('');
    const [seuilMin, setSeuilMin] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProduits();
    }, []);

    const fetchProduits = async () => {
        try {
            setLoading(true);
            const data = await api.getProduitsChimiques();
            setProduits(data || []);
        } catch (error) {
            console.error('Erreur produits:', error);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement des produits.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nom.trim()) return;

        try {
            let result;
            if (selectedProduit) {
                result = await api.updateProduitChimique(selectedProduit.id, nom.trim(), seuilMin);
            } else {
                result = await api.addProduitChimique(nom.trim(), seuilMin);
            }

            if (result && result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: selectedProduit ? 'Produit mis à jour' : 'Produit ajouté' });
            setShowModal(false);
            setNom('');
            setSeuilMin(0);
            setSelectedProduit(null);
            fetchProduits();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de la sauvegarde' });
        }
    };

    const handleDelete = async (id, nomProduit) => {
        if (window.confirm(`Voulez-vous vraiment supprimer "${nomProduit}" ?`)) {
            try {
                await api.deleteProduitChimique(id);
                setMessage({ type: 'success', text: 'Produit supprimé' });
                fetchProduits();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Erreur lors de la suppression' });
            }
        }
    };

    const openModal = (produit = null) => {
        setSelectedProduit(produit);
        setNom(produit ? produit.nom : '');
        setSeuilMin(produit ? (produit.seuil_min || 0) : 0);
        setShowModal(true);
    };

    const filteredProduits = produits.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToExcel = () => {
        try {
            const dataToExport = produits.map(p => ({
                'ID': p.id,
                'Nom du produit': p.nom,
                'Seuil Minimum (kg)': p.seuil_min || 0
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Catalogue");
            XLSX.writeFile(workbook, `Catalogue_Produits_Chimiques_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Erreur export:', error);
            alert('Erreur lors de l\'exportation');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                setLoading(true);
                let successCount = 0;
                let errorCount = 0;

                for (const row of data) {
                    const id = row['ID'];
                    const nom = row['Nom du produit'];
                    const seuil = parseFloat(row['Seuil Minimum (kg)']) || 0;

                    if (id && nom) {
                        try {
                            await api.updateProduitChimique(id, nom, seuil);
                            successCount++;
                        } catch (err) {
                            errorCount++;
                        }
                    }
                }

                setMessage({
                    type: 'success',
                    text: `Importation terminée : ${successCount} produits mis à jour.${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}`
                });
                fetchProduits();
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } catch (error) {
                console.error('Erreur import:', error);
                setMessage({ type: 'danger', text: 'Erreur lors de la lecture du fichier Excel.' });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div></div>;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="card shadow-lg border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h1 className="h4 mb-0 text-primary font-weight-bold">Catalogue Produits Chimiques</h1>
                    <div className="d-flex" style={{ gap: '10px' }}>
                        <button className="btn btn-outline-success btn-sm" onClick={exportToExcel} title="Exporter en Excel">
                            <i className="fas fa-file-export mr-1"></i> Exporter
                        </button>
                        <div className="position-relative">
                            <button className="btn btn-outline-info btn-sm" title="Importer Excel (ID / Nom / Seuil)">
                                <i className="fas fa-file-import mr-1"></i> Importer
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="position-absolute"
                                    style={{ top: 0, left: 0, opacity: 0, width: '100%', cursor: 'pointer' }}
                                    onChange={handleImport}
                                />
                            </button>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                            <i className="fas fa-plus mr-1"></i> Nouveau
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {message.text && <div className={`alert alert-${message.type} fade-in`}>{message.text}</div>}

                    <div className="mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="thead-light">
                                <tr>
                                    <th>Nom du produit</th>
                                    <th className="text-center">Seuil Min (kg)</th>
                                    <th className="text-center" style={{ width: '180px', minWidth: '180px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProduits.map(p => (
                                    <tr key={p.id}>
                                        <td className="font-weight-bold">{p.nom}</td>
                                        <td className="text-center">
                                            <span className={`badge ${p.seuil_min > 0 ? 'badge-warning' : 'badge-light'}`}>
                                                {p.seuil_min || 0} kg
                                            </span>
                                        </td>
                                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                            <button className="btn btn-sm btn-outline-primary" style={{ marginRight: '6px' }} onClick={() => openModal(p)}>
                                                <i className="fas fa-edit"></i> Modifier
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" title="Supprimer" onClick={() => handleDelete(p.id, p.nom)}>
                                                <i className="fas fa-trash"></i> Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProduits.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">Aucun produit trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h5 className="modal-title font-weight-bold">
                                {selectedProduit ? 'Modifier le produit' : 'Nouveau produit'}
                            </h5>
                            <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Désignation</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Seuil d'alerte Minimum (kg)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="form-control"
                                        value={seuilMin}
                                        onChange={(e) => setSeuilMin(e.target.value)}
                                        placeholder="Ex: 50"
                                    />
                                    <small className="form-text text-muted">Affiche une alerte si le stock descend sous cette valeur.</small>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-link text-muted" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-4">
                                    {selectedProduit ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: start; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px); padding-top: 100px;
                }
                .modal-content { background: white; border-radius: 12px; border: none; }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid #edf2f7;
                    border-top: 3px solid #3182ce; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ProduitsChimiques;
