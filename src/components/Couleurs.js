import React, { useState, useEffect } from 'react';
import api from '../api';

const Couleurs = () => {
  const [couleurs, setCouleurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCouleur, setSelectedCouleur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code_hex: '#000000',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCouleurs();
  }, []);

  const fetchCouleurs = async () => {
    try {
      const data = await api.getCouleurs();
      setCouleurs(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des couleurs:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la récupération des couleurs' });
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
      if (selectedCouleur) {
        // Mise à jour d'une couleur existante
        await api.updateCouleur(selectedCouleur.id, {
          nom: formData.nom,
          code_hex: formData.code_hex,
          description: formData.description
        });
        setMessage({ type: 'success', text: 'Couleur mise à jour avec succès' });
      } else {
        // Création d'une nouvelle couleur
        await api.addCouleur({
          nom: formData.nom,
          code_hex: formData.code_hex,
          description: formData.description
        });
        setMessage({ type: 'success', text: 'Couleur créée avec succès' });
      }

      // Réinitialiser le formulaire et fermer la modal
      setFormData({
        nom: '',
        code_hex: '#000000',
        description: ''
      });
      setSelectedCouleur(null);
      setShowModal(false);

      // Rafraîchir la liste des couleurs
      fetchCouleurs();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la couleur:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde de la couleur' });
    }
  };

  const openEditModal = (couleur) => {
    setSelectedCouleur(couleur);
    setFormData({
      nom: couleur.nom,
      code_hex: couleur.code_hex,
      description: couleur.description
    });
    setShowModal(true);
  };

  const deleteCouleur = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) return;

    try {
      await api.deleteCouleur(id);
      setMessage({ type: 'success', text: 'Couleur supprimée avec succès' });
      fetchCouleurs();
    } catch (error) {
      console.error('Erreur lors de la suppression de la couleur:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la suppression de la couleur' });
    }
  };

  if (loading) {
    return <div className="text-center mt-3">Chargement des couleurs...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="card-title mb-0">Gestion des couleurs</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedCouleur(null);
              setFormData({
                nom: '',
                code_hex: '#000000',
                description: ''
              });
              setShowModal(true);
            }}
          >
            Nouvelle couleur
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {couleurs.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Couleur</th>
                  <th>Code Hex</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {couleurs.map((couleur) => (
                  <tr key={couleur.id}>
                    <td>{couleur.nom}</td>
                    <td>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: couleur.code_hex,
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      ></div>
                    </td>
                    <td>{couleur.code_hex}</td>
                    <td>{couleur.description}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        onClick={() => openEditModal(couleur)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteCouleur(couleur.id)}
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
          <p>Aucune couleur trouvée</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedCouleur ? 'Modifier la couleur' : 'Nouvelle couleur'}
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
                <label htmlFor="code_hex">Couleur</label>
                <div className="d-flex align-items-center">
                  <input
                    type="color"
                    id="code_hex"
                    name="code_hex"
                    className="form-control mr-2"
                    value={formData.code_hex}
                    onChange={handleInputChange}
                    style={{ width: '80px', height: '40px' }}
                    required
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code_hex}
                    onChange={(e) => setFormData(prev => ({ ...prev, code_hex: e.target.value }))}
                    placeholder="#000000"
                  />
                </div>
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedCouleur ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Couleurs;
