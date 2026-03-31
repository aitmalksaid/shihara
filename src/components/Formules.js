import React, { useState, useEffect } from 'react';
import api from '../api';

const Formules = () => {
    const [recettes, setRecettes] = useState([]);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecette, setSelectedRecette] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        ingredients: [{ produit_nom: '', pourcentage: 0 }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [recettesData, produitsData] = await Promise.all([
                api.getRecettes(),
                api.getProduitsChimiques()
            ]);
            setRecettes(recettesData || []);
            setProduits(produitsData || []);
        } catch (error) {
            console.error('Erreur data:', error);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement des données.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = field === 'pourcentage' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { produit_nom: '', pourcentage: 0 }]
        }));
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;
            if (selectedRecette) {
                result = await api.updateRecette(selectedRecette.id, formData);
            } else {
                result = await api.addRecette(formData);
            }

            if (result.error) throw new Error(result.error);

            setMessage({ type: 'success', text: 'Formule enregistrée avec succès.' });
            setShowModal(false);
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Erreur lors de l\'enregistrement.' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette formule ?')) {
            try {
                await api.deleteRecette(id);
                setMessage({ type: 'success', text: 'Formule supprimée.' });
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Erreur lors de la suppression.' });
            }
        }
    };

    const openModal = (recette = null) => {
        if (recette) {
            setSelectedRecette(recette);
            setFormData({
                nom: recette.nom,
                description: recette.description || '',
                ingredients: recette.ingredients.length > 0 ? recette.ingredients : [{ produit_nom: '', pourcentage: 0 }]
            });
        } else {
            setSelectedRecette(null);
            setFormData({
                nom: '',
                description: '',
                ingredients: [{ produit_nom: '', pourcentage: 0 }]
            });
        }
        setShowModal(true);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner"></div><p>Chargement des formules...</p></div>;

    return (
        <div className="container-fluid px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 text-gray-800 font-weight-bold">Gestion des Formules</h1>
                    <p className="text-muted small mb-0">Définissez les phases de production et leurs besoins en produits chimiques.</p>
                </div>
                <button className="btn btn-primary shadow-sm" onClick={() => openModal()}>
                    <i className="fas fa-plus mr-2"></i> Nouvelle Formule
                </button>
            </div>

            {message.text && <div className={`alert alert-${message.type} shadow-sm mb-4`}>{message.text}</div>}

            <div className="row">
                {recettes.map(r => (
                    <div key={r.id} className="col-xl-6 col-md-12 mb-4">
                        <div className="card shadow-sm border-0 h-100 recipe-card">
                            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-light">
                                <div className="d-flex align-items-center">
                                    <div className="recipe-icon mr-3">
                                        <i className="fas fa-flask text-primary"></i>
                                    </div>
                                    <h6 className="m-0 font-weight-bold text-dark">{r.nom}</h6>
                                </div>
                                <div className="recipe-actions">
                                    <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => openModal(r)} title="Modifier">
                                        <i className="fas fa-edit mr-1"></i> Modifier
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)} title="Supprimer">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                {r.description && <p className="small text-muted mb-3 italic">{r.description}</p>}
                                <div className="ingredients-container">
                                    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
                                        <span className="small font-weight-bold text-muted text-uppercase">Produit</span>
                                        <span className="small font-weight-bold text-muted text-uppercase">Pourcentage</span>
                                    </div>
                                    <div className="ingredients-list">
                                        {r.ingredients.map((ing, i) => (
                                            <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom-faint">
                                                <span className="text-dark small font-weight-500">{ing.produit_nom}</span>
                                                <span className="badge badge-light text-primary font-weight-bold">{(ing.pourcentage * 100).toFixed(2)} %</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-between mt-3 pt-2 bg-light px-2 rounded">
                                        <span className="small font-weight-bold text-dark">TOTAL BASE</span>
                                        <span className="small font-weight-bold text-primary">
                                            {(r.ingredients.reduce((sum, ing) => sum + (ing.pourcentage || 0), 0) * 100).toFixed(2)} %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-on-show shadow-lg" style={{ maxWidth: '850px' }}>
                        <div className="modal-header bg-white border-bottom">
                            <h5 className="modal-title font-weight-bold text-primary">
                                {selectedRecette ? `Modifier : ${selectedRecette.nom}` : 'Créer une Nouvelle Formule'}
                            </h5>
                            <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body bg-light" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <div className="row mb-4">
                                    <div className="col-md-6 form-group">
                                        <label className="small font-weight-bold text-muted uppercase">Nom de la Phase / Formule</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            className="form-control form-control-lg border-0 shadow-sm"
                                            value={formData.nom}
                                            onChange={handleInputChange}
                                            placeholder="ex: PH 1 - RIVIER"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label className="small font-weight-bold text-muted uppercase">Description</label>
                                        <input
                                            type="text"
                                            name="description"
                                            className="form-control form-control-lg border-0 shadow-sm"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Description optionnelle"
                                        />
                                    </div>
                                </div>

                                <div className="card shadow-sm border-0 overflow-hidden">
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <h6 className="m-0 font-weight-bold small text-primary uppercase">Composition Chimique</h6>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={addIngredient}>
                                            <i className="fas fa-plus mr-1"></i> Ajouter
                                        </button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="bg-light text-muted uppercase" style={{ fontSize: '0.75rem' }}>
                                                <tr>
                                                    <th className="px-3 border-0">Produit Chimique</th>
                                                    <th className="text-right border-0" style={{ width: '180px' }}>Pourcentage (0.01 = 1%)</th>
                                                    <th className="text-center border-0" style={{ width: '60px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.ingredients.map((ing, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 border-top-0">
                                                            <select
                                                                className="form-control form-control-sm border-light"
                                                                value={ing.produit_nom}
                                                                onChange={(e) => handleIngredientChange(index, 'produit_nom', e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Sélectionner un produit...</option>
                                                                {produits.map(p => (
                                                                    <option key={p.id} value={p.nom}>{p.nom}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 border-top-0">
                                                            <input
                                                                type="number"
                                                                step="0.0001"
                                                                className="form-control form-control-sm text-right font-weight-bold border-light"
                                                                style={{ backgroundColor: '#fffbe6' }}
                                                                value={ing.pourcentage}
                                                                onChange={(e) => handleIngredientChange(index, 'pourcentage', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center border-top-0">
                                                            <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => removeIngredient(index)}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-light">
                                                <tr className="font-weight-bold">
                                                    <td className="px-3 py-2">TOTAL FORMULE</td>
                                                    <td className="text-right px-3 py-2 text-primary" style={{ fontSize: '1.1rem' }}>
                                                        {(formData.ingredients.reduce((sum, ing) => sum + (ing.pourcentage || 0), 0) * 100).toFixed(2)} %
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                                <div className="alert alert-info mt-3 small shadow-sm border-0" style={{ borderLeft: '4px solid #17a2b8' }}>
                                    <i className="fas fa-info-circle mr-2"></i>
                                    <strong>Conseil :</strong> Les pourcentages sont multipliés par le "Poids Brut" lors du lancement. <br />
                                    <em>Exemple : 0.05 pour 5%, 0.002 pour 0.2%.</em>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-top shadow-inner">
                                <button type="button" className="btn btn-link text-muted font-weight-bold" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-5 shadow-sm rounded-pill font-weight-bold text-uppercase">
                                    <i className="fas fa-save mr-2"></i> Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .d-flex { display: flex !important; }
                .justify-content-between { justify-content: space-between !important; }
                .align-items-center { align-items: center !important; }
                .flex-column { flex-direction: column !important; }
                .mr-1 { margin-right: 0.25rem !important; }
                .mr-2 { margin-right: 0.5rem !important; }
                .mr-3 { margin-right: 1rem !important; }
                .mb-1 { margin-bottom: 0.25rem !important; }
                .mb-2 { margin-bottom: 0.5rem !important; }
                .mb-4 { margin-bottom: 1.5rem !important; }
                .mt-3 { margin-top: 1rem !important; }
                .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
                .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                .py-3 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .px-4 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
                .pr-4 { padding-right: 1.5rem !important; }
                .pl-3 { padding-left: 1rem !important; }
                .italic { font-style: italic; }

                .recipe-card {
                    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
                    border: 1px solid #edf2f7 !important;
                }
                .recipe-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                .recipe-icon {
                    width: 40px; height: 40px; background: #ebf8ff;
                    border-radius: 10px; display: flex; align-items: center; justify-content: center;
                }
                .border-bottom-light { border-bottom: 1px solid #f1f5f9; }
                .border-bottom-faint { border-bottom: 1px solid #f8fafc; }
                
                .ingredients-container { padding: 5px 2px; }
                
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
                    z-index: 1050; backdrop-filter: blur(8px);
                }
                .modal-content { 
                    background: white; border-radius: 1.25rem; border: none; 
                    width: 95%; overflow: hidden;
                }
                .animate-on-show { animation: bounceUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes bounceUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .spinner {
                    width: 40px; height: 40px; border: 3px solid #f3f3f3;
                    border-top: 3px solid #3182ce; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 20px auto;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                .close {
                    background: none; border: none; font-size: 1.5rem; color: #a0aec0;
                    cursor: pointer; transition: color 0.2s;
                }
                .close:hover { color: #4a5568; }
                .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
            `}</style>
        </div>
    );
};

export default Formules;
