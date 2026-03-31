import React, { useState, useEffect } from 'react';
import api from '../api';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [teintures, setTeintures] = useState([]);
  const [couleurs, setCouleurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    statut: 'en_attente',
    articles: []
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCommandes();
    fetchClients();
    fetchTeintures();
    fetchCouleurs();
  }, []);

  const fetchCommandes = async () => {
    try {
      const data = await api.getCommandes();
      setCommandes(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la récupération des commandes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    }
  };

  const fetchTeintures = async () => {
    try {
      const data = await api.getTeintures();
      setTeintures(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des teintures:', error);
    }
  };

  const fetchCouleurs = async () => {
    try {
      const data = await api.getCouleurs();
      setCouleurs(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des couleurs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArticleChange = (index, field, value) => {
    const newArticles = [...formData.articles];
    newArticles[index] = {
      ...newArticles[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      articles: newArticles
    }));
  };

  const addArticle = () => {
    setFormData(prev => ({
      ...prev,
      articles: [
        ...prev.articles,
        {
          teinture_id: '',
          couleur_id: '',
          quantite: 1,
          instructions: ''
        }
      ]
    }));
  };

  const removeArticle = (index) => {
    const newArticles = [...formData.articles];
    newArticles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      articles: newArticles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (selectedCommande) {
        // Mise à jour d'une commande existante
        await api.updateCommande(selectedCommande.id, formData);
        setMessage({ type: 'success', text: 'Commande mise à jour avec succès' });
      } else {
        // Création d'une nouvelle commande
        await api.addCommande(formData);
        setMessage({ type: 'success', text: 'Commande créée avec succès' });
      }

      // Réinitialiser le formulaire et fermer la modal
      setFormData({
        client_id: '',
        date_commande: new Date().toISOString().split('T')[0],
        date_livraison_prevue: '',
        statut: 'en_attente',
        articles: []
      });
      setSelectedCommande(null);
      setShowModal(false);

      // Rafraîchir la liste des commandes
      fetchCommandes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde de la commande' });
    }
  };

  const openEditModal = async (commande) => {
    setSelectedCommande(commande);
    setFormData({
      client_id: commande.client_id,
      date_commande: new Date(commande.date_commande).toISOString().split('T')[0],
      date_livraison_prevue: new Date(commande.date_livraison_prevue).toISOString().split('T')[0],
      statut: commande.statut,
      articles: []
    });

    // Récupérer les articles de la commande
    try {
      const articles = await api.getArticlesCommande(commande.id);
      setFormData(prev => ({
        ...prev,
        articles: articles || []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    }

    setShowModal(true);
  };

  const deleteCommande = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

    try {
      await api.deleteCommande(id);
      setMessage({ type: 'success', text: 'Commande supprimée avec succès' });
      fetchCommandes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la suppression de la commande' });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'en_attente':
        return 'status-pending';
      case 'en_cours':
        return 'status-processing';
      case 'terminee':
        return 'status-completed';
      case 'annulee':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours':
        return 'En cours';
      case 'terminee':
        return 'Terminée';
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center mt-3">Chargement des commandes...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="card-title mb-0">Gestion des commandes</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedCommande(null);
              setFormData({
                client_id: '',
                date_commande: new Date().toISOString().split('T')[0],
                date_livraison_prevue: '',
                statut: 'en_attente',
                articles: []
              });
              setShowModal(true);
            }}
          >
            Nouvelle commande
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {commandes.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Date de commande</th>
                  <th>Date de livraison prévue</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((commande) => (
                  <tr key={commande.id}>
                    <td>#{commande.id}</td>
                    <td>
                      {commande.clients?.nom} {commande.clients?.prenom}
                      <br />
                      <small>{commande.clients?.telephone}</small>
                    </td>
                    <td>{new Date(commande.date_commande).toLocaleDateString('fr-FR')}</td>
                    <td>{new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(commande.statut)}`}>
                        {getStatusText(commande.statut)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        onClick={() => openEditModal(commande)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteCommande(commande.id)}
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
          <p>Aucune commande trouvée</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedCommande ? 'Modifier la commande' : 'Nouvelle commande'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="client_id">Client</label>
                    <select
                      id="client_id"
                      name="client_id"
                      className="form-control"
                      value={formData.client_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nom} {client.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="statut">Statut</label>
                    <select
                      id="statut"
                      name="statut"
                      className="form-control"
                      value={formData.statut}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="en_attente">En attente</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminee">Terminée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="date_commande">Date de commande</label>
                    <input
                      type="date"
                      id="date_commande"
                      name="date_commande"
                      className="form-control"
                      value={formData.date_commande}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="date_livraison_prevue">Date de livraison prévue</label>
                    <input
                      type="date"
                      id="date_livraison_prevue"
                      name="date_livraison_prevue"
                      className="form-control"
                      value={formData.date_livraison_prevue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Articles de la commande</h3>
                {formData.articles.length === 0 ? (
                  <p>Aucun article ajouté</p>
                ) : (
                  formData.articles.map((article, index) => (
                    <div key={index} className="card mb-3">
                      <div className="form-row">
                        <div className="form-col form-col-4">
                          <div className="form-group">
                            <label>Type de teinture</label>
                            <select
                              className="form-control"
                              value={article.teinture_id}
                              onChange={(e) => handleArticleChange(index, 'teinture_id', e.target.value)}
                              required
                            >
                              <option value="">Sélectionner un type</option>
                              {teintures.map((teinture) => (
                                <option key={teinture.id} value={teinture.id}>
                                  {teinture.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-col form-col-4">
                          <div className="form-group">
                            <label>Couleur</label>
                            <select
                              className="form-control"
                              value={article.couleur_id}
                              onChange={(e) => handleArticleChange(index, 'couleur_id', e.target.value)}
                              required
                            >
                              <option value="">Sélectionner une couleur</option>
                              {couleurs.map((couleur) => (
                                <option key={couleur.id} value={couleur.id}>
                                  {couleur.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-col form-col-3">
                          <div className="form-group">
                            <label>Quantité</label>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              value={article.quantite}
                              onChange={(e) => handleArticleChange(index, 'quantite', parseInt(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-col form-col-1">
                          <div className="form-group">
                            <label>&nbsp;</label>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeArticle(index)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Instructions spéciales</label>
                        <textarea
                          className="form-control"
                          value={article.instructions}
                          onChange={(e) => handleArticleChange(index, 'instructions', e.target.value)}
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addArticle}
                >
                  Ajouter un article
                </button>
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
                  {selectedCommande ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commandes;
