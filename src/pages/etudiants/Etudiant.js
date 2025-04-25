import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import userImg from "../../assets/img/etudiant.png"; // Image de profil par défaut
import Layout from "../../components/Layout";
import ProgressBar from "../../components/ProgressBar";
import Back from "../../components/Back";

const Etudiant = () => {
  const { id } = useParams(); // Récupération de l'ID depuis l'URL
  const [etudiant, setEtudiant] = useState(null); // Données de l'étudiant
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [error, setError] = useState(null); // Gestion des erreurs

  // Calcul de l'âge à partir de la date de naissance
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Formatage du numéro de téléphone
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 ");
  };

  useEffect(() => {
    // Fonction pour récupérer les données de l'étudiant
    const fetchEtudiant = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/etudiant/${id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        const data = await response.json();
        setEtudiant(data);
      } catch (err) {
        setError("Impossible de charger les données : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEtudiant();
  }, [id]);

  // Affichage d'un spinner de chargement pendant le chargement des données
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

  // Gestion des erreurs si les données ne sont pas disponibles
  if (error) {
    return (
      <Layout>
        <Back>etudiants</Back>
        <div className="alert alert-danger">{error}</div>
      </Layout>
    );
  }

  // Gestion de l'erreur si l'étudiant n'existe pas
  if (!etudiant || !etudiant.etudiant) {
    return (
      <Layout>
        <Back>etudiants</Back>
        <div className="alert alert-danger">Étudiant introuvable</div>
      </Layout>
    );
  }

  // Extraction des données de l'étudiant
  const { etudiant: details, progression } = etudiant;

  const montantPaye = parseFloat(details.montant_paye);
  const scolarite = parseFloat(details.scolarite);

  return (
    <Layout>
      <Back>etudiants</Back>
      <section className="bg-body">
        <div className="container">
          <div
            className="row"
            style={{
              backgroundColor:
                montantPaye < scolarite ? "#d51c0ddd" : "#4caf50c4",
            }}
          >
            <div className="col-lg-12">
              <div className="card card-style1 border-0">
                <div className="card-body p-1-9 p-sm-2-3 p-md-6 p-lg-7">
                  <div className="row align-items-center">
                    {/* Section : Photo de l'étudiant */}
                    <div className="col-lg-6 mb-4 mb-lg-0 text-center">
                      <img
                        src={userImg}
                        alt="Profile"
                        className="rounded-circle userImg"
                      />
                    </div>
                    {/* Section : Informations de l'étudiant */}
                    <div className="col-lg-6 px-xl-10">
                      <div className="d-inline-block py-1-9 px-1-9 px-sm-6 mb-1-9 rounded">
                        <h3 className="h2 text-primary mb-0">
                          <span className="text-capitalize">
                            {details.nom} {details.prenom}
                          </span>
                          (ID ETU-{details.id})
                        </h3>
                        <h6 className="h4 text-primary mb-0">
                          {details.motif_inscription == "permis"
                            ? "Candidat(e) au permis 💳"
                            : "Recyclage de conduite ♻"}
                        </h6>
                      </div>
                      {/* Section : Progression */}
                      <h4 className="text-center mt-2">Progression</h4>
                      <ProgressBar
                        currentStep={progression.etape}
                        motifInscription={details.motif_inscription}
                      />
                      {/* Section : Liste des informations */}
                      <ul className="list-unstyled mb-1-9 mt-3">
                        {(progression.etape === "cours_de_code" ||
                          progression.etape === "cours_de_conduite") && (
                          <li className="mb-2 display-28">
                            <span className="text-secondary me-2 font-weight-600">
                              Moniteur(trice) affecté(e) :
                            </span>
                            {etudiant.moniteur?.nom || "Inconnu"}{" "}
                            {etudiant.moniteur?.prenom || "Inconnu"}
                          </li>
                        )}
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Âge :
                          </span>
                          {calculateAge(details.dateNaissance)} ans
                        </li>
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Pièce d'identité :
                          </span>
                          {details.type_piece || "Non renseigné"}
                        </li>
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            N° :
                          </span>
                          {details.num_piece || "Non renseigné"}
                        </li>
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Lieu de Naissance :
                          </span>
                          {details.lieuNaissance || "Non renseigné"}
                        </li>
                        <span>-------------------------</span>
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Téléphone :
                          </span>
                          {details.num_telephone
                            ? formatPhoneNumber(details.num_telephone)
                            : "Non disponible"}
                        </li>
                        {details.num_telephone_2 && (
                          <li className="mb-2 display-28">
                            <span className="text-secondary me-2 font-weight-600">
                              Téléphone Secondaire :
                            </span>
                            {formatPhoneNumber(details.num_telephone_2)}
                          </li>
                        )}
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Auto-École :
                          </span>
                          {details.nom_autoEc}
                        </li>
                        {details.motif_inscription === "permis" && (
                          <li className="mb-2 display-28">
                            <span className="text-secondary me-2 font-weight-600">
                              Catégories de Permis :
                            </span>
                            {details.categorie || "Non renseigné"}
                          </li>
                        )}
                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Réduction :
                          </span>
                          {details.reduction ? "Oui" : "Non"}
                        </li>

                        <li className="mb-2 display-28">
                          <span className="text-secondary me-2 font-weight-600">
                            Scolarité :
                          </span>
                          {details.scolarite} FCFA
                        </li>

                        <li className="display-28 text-capitalize">
                          <span className="text-secondary me-2 font-weight-600">
                            État de paiement :
                          </span>
                          {montantPaye >= scolarite ? (
                            <span className="text-success">Soldé</span>
                          ) : (
                            <span>
                              Reste :
                              <span className="text-danger ms-2">
                                {scolarite - montantPaye} FCFA
                              </span>
                            </span>
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Etudiant;
