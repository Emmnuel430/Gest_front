// Importation des bibliothèques nécessaires
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Layout from "../../components/Layout";
import ConfirmPopup from "../../components/ConfirmPopup";
import HeaderWithFilter from "../../components/HeaderWithFilter";
import Loader from "../../components/Loader";

// Définition du composant principal
const EtudiantList = () => {
  // Déclaration des états locaux
  const [etudiants, setEtudiants] = useState([]); // Liste des étudiants
  const [selectedEtudiant, setSelectedEtudiant] = useState(null); // Étudiant sélectionné pour suppression
  const [sortOption, setSortOption] = useState(""); // Option de tri sélectionnée
  const [sortedEtudiants, setSortedEtudiants] = useState([]); // Liste triée des étudiants
  // -----------
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const [timeState, setTimeState] = useState(Date.now()); // État pour forcer le re-rendu basé sur le temps
  const location = useLocation(); // Localisation actuelle (pour recharger les données)
  const [filter, setFilter] = useState(""); // Filtre pour les étudiants
  const [showModal, setShowModal] = useState(false); // Contrôle l'affichage du modal de confirmation
  const navigate = useNavigate(); // Navigation entre les pages

  // Effet pour charger les étudiants et mettre à jour le temps périodiquement
  useEffect(() => {
    fetchEtudiants(); // Charge les étudiants au montage du composant
    const interval = setInterval(() => {
      setTimeState(Date.now()); // Met à jour l'état pour forcer un re-rendu
    }, 59000); // Intervalle de 59 secondes

    return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
  }, [location]); // Déclenche l'effet lors d'un changement de localisation

  useEffect(() => {
    if (!Array.isArray(etudiants)) return; // Sécurité : vérifie que etudiants est un tableau
    // Tri par défaut du plus récent au plus ancien
    setSortedEtudiants(
      [...etudiants].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    );
  }, [etudiants]); // Déclenche le tri lorsque la liste des étudiants change

  // Fonction pour ouvrir le modal de confirmation
  const handleOpenModal = (etudiant) => {
    setSelectedEtudiant(etudiant); // Définit l'étudiant à supprimer
    setShowModal(true); // Affiche le modal
  };

  // Fonction pour fermer le modal de confirmation
  const handleCloseModal = () => {
    setShowModal(false); // Cache le modal
    setSelectedEtudiant(null); // Réinitialise l'étudiant sélectionné
  };

  // Fonction pour gérer la suppression d'un étudiant
  const handleDelete = async () => {
    if (!selectedEtudiant) return; // Vérifie si un étudiant est sélectionné

    setLoading(selectedEtudiant.id); // Active le spinner pour l'étudiant sélectionné
    try {
      await deleteOperation(selectedEtudiant.id); // Exécute la suppression
    } catch (error) {
      setError("Erreur lors de la suppression :" + error); // Affiche les erreurs
    } finally {
      setLoading(null); // Désactive le spinner
      handleCloseModal(); // Ferme le modal
    }
  };

  // Fonction pour récupérer la liste des étudiants depuis l'API
  const fetchEtudiants = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/liste_etudiant`
      ); // Appel API
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des etudiants."); // Gère les erreurs HTTP
      }
      const data = await response.json(); // Parse les données JSON
      setEtudiants(data.etudiants); // Met à jour l'état avec les données
    } catch (err) {
      setError("Impossible de charger les données : " + err.message); // Stocke le message d'erreur
    } finally {
      setLoading(false); // Désactive le spinner global
    }
  };

  // Fonction pour supprimer un étudiant
  const deleteOperation = async (id) => {
    setLoading(id); // Active le spinner pour l'étudiant en cours de suppression
    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info")); // Récupère les infos utilisateur
      const userId = userInfo ? userInfo.id : null; // Vérifie si l'utilisateur est connecté

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      const result = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/delete_etudiant/${id}`,
        {
          method: "DELETE", // Méthode HTTP DELETE
          headers: {
            "Content-Type": "application/json", // En-tête JSON
          },
          body: JSON.stringify({ user_id: userId }), // Envoie l'ID utilisateur
        }
      );

      const response = await result.json(); // Parse la réponse JSON

      if (response.status === "deleted") {
        alert("Etudiant supprimé !"); // Alerte de succès
        setEtudiants(etudiants.filter((etudiant) => etudiant.id !== id)); // Met à jour la liste
      } else {
        alert("Échec de la suppression."); // Alerte d'échec
      }
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression." + err); // Alerte d'erreur
      console.error(err); // Log de l'erreur
    } finally {
      setLoading(false); // Désactive le spinner
    }
  };

  // Fonction pour formater une date en texte relatif
  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: false, // Pas de suffixe (ex. "il y a")
      locale: fr, // Locale française
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant"; // Cas particulier pour "moins d'une minute"
    }

    // Remplacements pour abréger les unités de temps
    const abbreviations = [
      { regex: /environ /i, replacement: "≈" },
      { regex: / heures?/i, replacement: "h" },
      { regex: / minutes?/i, replacement: "min" },
      { regex: / secondes?/i, replacement: "s" },
      { regex: / jours?/i, replacement: "j" },
      { regex: / semaines?/i, replacement: "sem" },
      { regex: / mois?/i, replacement: "mois" },
      { regex: / ans?/i, replacement: "an" },
    ];

    let shortened = formatted;
    abbreviations.forEach(({ regex, replacement }) => {
      shortened = shortened.replace(regex, replacement); // Applique les remplacements
    });

    return shortened; // Retourne la version abrégée
  };

  // Rendu du composant
  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Affichage du spinner ou du tableau */}
        {loading === true ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            {/* En-tête avec filtre */}
            <HeaderWithFilter
              title="Étudiants"
              link="/add/etudiant"
              linkText="+ Ajouter"
              main={etudiants.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les inscrits" },
                { value: "permis", label: "Permis" },
                { value: "recyclage", label: "Recyclage" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={etudiants} // Liste des étudiants ou autre
              setSortedList={setSortedEtudiants}
              alphaField="nom" // Peut être "prenom", "titre", etc.
              dateField="created_at" // Peut être "dateInscription", "dateAjout"
            />
            <Table
              style={{ tableLayout: "auto" }}
              className="centered-table"
              hover
              responsive
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Scolarité</th>
                  <th>Motif</th>
                  <th>Créé il y a</th>
                  <th>M-A-J il y a</th>
                  <th>Opérations</th>
                </tr>
              </thead>
              <tbody>
                {/* Filtrage et affichage des étudiants */}
                {sortedEtudiants.filter(
                  (etudiant) => !filter || etudiant.motif_inscription === filter
                ).length > 0 ? (
                  sortedEtudiants
                    .filter(
                      (etudiant) =>
                        !filter || etudiant.motif_inscription === filter
                    )
                    .map((etudiant, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>ETU-{etudiant.id}</td>
                        <td>{etudiant.nom}</td>
                        <td>{etudiant.prenom}</td>
                        <td>
                          {etudiant.montant_paye >= etudiant.scolarite ? (
                            <span className="badge bg-success">Soldé</span>
                          ) : (
                            <span className="badge bg-danger">Pas soldé</span>
                          )}
                        </td>
                        <td
                          className={`text-center text-capitalize ${
                            etudiant.motif_inscription === "permis"
                              ? "bg-success"
                              : "bg-info"
                          } text-white`}
                        >
                          {etudiant.motif_inscription}
                        </td>
                        <td>{formatDateRelative(etudiant.created_at)}</td>
                        <td>
                          {etudiant.created_at == etudiant.updated_at
                            ? "-"
                            : formatDateRelative(etudiant.updated_at)}
                        </td>
                        <td className="table-operations d-flex justify-content-center">
                          <div className="d-flex gap-2">
                            {/* Bouton pour voir les détails */}
                            <button
                              onClick={() =>
                                navigate(`/etudiant/${etudiant.id}`)
                              }
                              className="btn btn-info btn-sm me-2"
                              title="Voir"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {/* Bouton pour modifier */}
                            <button
                              onClick={() =>
                                navigate(`/update/etudiant/${etudiant.id}`)
                              }
                              className="btn btn-warning btn-sm me-2"
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {/* Bouton pour supprimer */}
                            <button
                              onClick={() => handleOpenModal(etudiant)}
                              className="btn btn-danger btn-sm"
                              title="Supprimer"
                              disabled={loading === etudiant.id}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Aucun etudiant trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}

        {/* Modal de confirmation */}
        <ConfirmPopup
          show={showModal} // Affichage du modal
          onClose={handleCloseModal} // Fonction pour fermer le modal
          onConfirm={handleDelete} // Fonction pour confirmer la suppression
          title="Confirmer la suppression" // Titre du modal
          body={
            <p>
              Voulez-vous vraiment supprimer{" "}
              <strong>
                {selectedEtudiant?.nom} {selectedEtudiant?.prenom}
              </strong>{" "}
              ?
            </p>
          } // Contenu du modal
        />
      </div>
    </Layout>
  );
};

// Exportation du composant
export default EtudiantList;
