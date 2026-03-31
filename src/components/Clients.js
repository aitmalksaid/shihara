import React, { useState, useEffect } from 'react';
import api from '../api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la récupération des clients' });
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
      if (selectedClient) {
        // Mise à jour d'un client existant
        await api.updateClient(selectedClient.id, formData);
        setMessage({ type: 'success', text: 'Client mis à jour avec succès' });
      } else {
        // Création d'un nouveau client
        await api.addClient(formData);
        setMessage({ type: 'success', text: 'Client créé avec succès' });
      }

      // Réinitialiser le formulaire et fermer la modal
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: ''
      });
      setSelectedClient(null);
      setShowModal(false);

      // Rafraîchir la liste des clients
      fetchClients();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde du client' });
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email,
      adresse: client.adresse
    });
    setShowModal(true);
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await api.deleteClient(id);
      setMessage({ type: 'success', text: 'Client supprimé avec succès' });
      fetchClients();
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la suppression du client' });
    }
  };

  if (loading) {
    return <div className="text-center mt-3">Chargement des clients...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="card-title mb-0">Gestion des clients</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedClient(null);
              setFormData({
                nom: '',
                prenom: '',
                telephone: '',
                email: '',
                adresse: ''
              });
              setShowModal(true);
            }}
          >
            Nouveau client
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {clients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Adresse</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.nom}</td>
                    <td>{client.prenom}</td>
                    <td>{client.telephone}</td>
                    <td>{client.email}</td>
                    <td>{client.adresse}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        onClick={() => openEditModal(client)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteClient(client.id)}
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
          <p>Aucun client trouvé</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-col form-col-6">
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
                </div>
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      className="form-control"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      className="form-control"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-col form-col-6">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adresse">Adresse</label>
                <textarea
                  id="adresse"
                  name="adresse"
                  className="form-control"
                  value={formData.adresse}
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
                  {selectedClient ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
