import React, { useState, useEffect } from 'react';
import api from '../api';

const Teintures = () => {
  const [teintures, setTeintures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeinture, setSelectedTeinture] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_unitaire: '',
    delai_traitement: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTeintures();
  }, []);

  const fetchTeintures = async () => {
    try {
      const data = await api.getTeintures();
      setTeintures(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des teintures:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la récupération des teintures' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (selectedTeinture) {
        // Mise à jour d'une teinture existante
        await api.updateTeinture(selectedTeinture.id, {
          nom: formData.nom,
          description: formData.description,
          prix_unitaire: parseFloat(formData.prix_unitaire),
          delai_traitement: parseInt(formData.delai_traitement)
        });
        setMessage({ type: 'success', text: 'Teinture mise à jour avec succès' });
      } else {
        // Création d'une nouvelle teinture
        await api.addTeinture({
          nom: formData.nom,
          description: formData.description,
          prix_unitaire: parseFloat(formData.prix_unitaire),
          delai_traitement: parseInt(formData.delai_traitement)
        });
        setMessage({ type: 'success', text: 'Teinture créée avec succès' });
      }

      // Réinitialiser le formulaire et fermer la modal
      setFormData({
        nom: '',
        description: '',
        prix_unitaire: '',
        delai_traitement: ''
      });
      setSelectedTeinture(null);
      setShowModal(false);

      // Rafraîchir la liste des teintures
      fetchTeintures();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la teinture:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde de la teinture' });
    }
  };

  const openEditModal = (teinture) => {
    setSelectedTeinture(teinture);
    setFormData({
      nom: teinture.nom,
      description: teinture.description,
      prix_unitaire: teinture.prix_unitaire.toString(),
      delai_traitement: teinture.delai_traitement.toString()
    });
    setShowModal(true);
  };

  const deleteTeinture = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette teinture ?')) return;

    try {
      await api.deleteTeinture(id);
      setMessage({ type: 'success', text: 'Teinture supprimée avec succès' });
      fetchTeintures();
    } catch (error) {
      console.error('Erreur lors de la suppression de la teinture:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la suppression de la teinture' });
    }
  };

  if (loading) {
    return <div className="text-center mt-3">Chargement des teintures...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="card-title mb-0">Gestion des teintures</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedTeinture(null);
              setFormData({
                nom: '',
                description: '',
                prix_unitaire: '',
                delai_traitement: ''
              });
              setShowModal(true);
            }}
          >
            Nouvelle teinture
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {teintures.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Prix unitaire (DH)</th>
                  <th>Délai de traitement (jours)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teintures.map((teinture) => (
                  <tr key={teinture.id}>
                    <td>{teinture.nom}</td>
                    <td>{teinture.description}</td>
                    <td>{teinture.prix_unitaire}</td>
                    <td>{teinture.delai_traitement}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        onClick={() => openEditModal(teinture)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteTeinture(teinture.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune teinture trouvée</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedTeinture ? 'Modifier la teinture' : 'Nouvelle teinture'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  className="form-control"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="prix_unitaire">Prix unitaire (DH)</label>
                    <input
                      type="number"
                      id="prix_unitaire"
                      name="prix_unitaire"
                      className="form-control"
                      value={formData.prix_unitaire}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="delai_traitement">Délai de traitement (jours)</label>
                    <input
                      type="number"
                      id="delai_traitement"
                      name="delai_traitement"
                      className="form-control"
                      value={formData.delai_traitement}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedTeinture ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teintures;
