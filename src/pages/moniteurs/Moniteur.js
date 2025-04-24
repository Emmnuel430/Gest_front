import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap"; // Importation de Table depuis react-bootstrap
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import Back from "../../components/Back";

const Moniteur = () => {
  const { id } = useParams(); // Récupérer l'ID du moniteur depuis l'URL
  const [moniteur, setMoniteur] = useState(null); // État pour stocker les données du moniteur
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const [error, setError] = useState(""); // État pour gérer les erreurs

  useEffect(() => {
    // Fonction pour récupérer les données du moniteur
    const fetchMoniteur = async () => {
      setLoading(true);
      setError("");

      try {
        // Appel à l'API pour récupérer les données du moniteur
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/moniteur/${id}`
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données du moniteur."
          );
        }

        const data = await response.json(); // Conversion des données en JSON
        setMoniteur(data); // Mise à jour de l'état avec les données du moniteur
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Gestion des erreurs
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchMoniteur(); // Appel de la fonction pour récupérer les données
  }, [id]); // Dépendance sur l'ID du moniteur

  // Affichage d'un spinner pendant le chargement
  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      </Layout>
    );
  }

  // Affichage d'un message d'erreur si une erreur survient
  if (error) {
    return (
      <Layout>
        <Back>etudiants</Back> {/* Bouton pour revenir à la page précédente */}
        <div className="alert alert-danger">{error}</div>
      </Layout>
    );
  }

  // Affichage des données du moniteur
  return (
    <Layout>
      <Back>moniteurs</Back>{" "}
      {/* Bouton pour revenir à la liste des moniteurs */}
      <div className="container mt-5">
        {moniteur ? (
          <>
            {/* Section des détails du moniteur */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="card-title">Détails du moniteur</h2>
                <hr />
                <p className="text-capitalize">
                  <strong>Nom : </strong> {moniteur.moniteur.nom}
                </p>
                <p className="text-capitalize">
                  <strong>Prénom : </strong> {moniteur.moniteur.prenom}
                </p>
                <p className="text-capitalize">
                  <strong>Spécialité : </strong> {moniteur.moniteur.specialite}
                </p>
              </div>
            </div>

            {/* Section de la liste des étudiants */}
            {moniteur.etudiants.length > 0 ? (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h3 className="card-title">Liste de ses étudiants</h3>
                  <hr />
                  <Table className="" hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Numéro de téléphone</th>
                        <th>Motif d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moniteur.etudiants.map((etudiant, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{etudiant.nom}</td>
                          <td>{etudiant.prenom}</td>
                          <td>{etudiant.num_telephone}</td>
                          <td
                            className={`text-center text-uppercase ${
                              etudiant.motif_inscription == "permis"
                                ? "bg-success"
                                : "bg-secondary"
                            } text-white`}
                          >
                            {etudiant.motif_inscription == "permis"
                              ? "Permis"
                              : "Recyclage"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              // Message si aucun étudiant n'est affecté au moniteur
              <div className="alert alert-info mt-4">
                Aucun étudiant n'est affecté à ce moniteur.
              </div>
            )}
          </>
        ) : (
          // Affichage d'un spinner si les données ne sont pas encore disponibles
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3">Chargement des données...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Moniteur;
