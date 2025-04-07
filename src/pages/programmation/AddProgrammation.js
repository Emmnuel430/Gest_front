import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import Back from "../../components/Back";

const AddProgrammation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialisation de l'état pour la programmation
  const [programmation, setProgrammation] = useState({
    type: location.state?.type || "", // Type de programmation (code ou conduite)
    date_prog: location.state?.date_prog || "", // Date de programmation
    etudiants: location.state?.etudiants || [], // Liste des étudiants sélectionnés
  });

  const [etudiants, setEtudiants] = useState([]); // Liste des étudiants disponibles

  // Chargement de la liste des étudiants en fonction du type sélectionné
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/liste_etudiant`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrage des étudiants en fonction du type de programmation
        const filteredEtudiants = data.filter((e) => {
          if (programmation.type === "code") {
            return (
              e.progression?.etape === "cours_de_code" ||
              e.progression?.etape === "examen_de_code"
            );
          } else if (programmation.type === "conduite") {
            return (
              e.progression?.etape === "cours_de_conduite" ||
              e.progression?.etape === "examen_de_conduite"
            );
          }
          return true; // Si aucun type sélectionné, on affiche tous les étudiants
        });

        // Mise en forme des données pour le composant Select
        setEtudiants(
          filteredEtudiants.map((e) => ({
            value: e.id,
            label: `${e.nom} ${e.prenom}`,
            num_telephone: e.num_telephone,
            nom_autoEc: e.nom_autoEc,
            categorie: e.categorie,
            typePiece: e.type_piece,
            numPiece: e.num_piece,
          }))
        );
      })
      .catch((err) =>
        console.error("Erreur lors du chargement des étudiants:", err)
      );
  }, [programmation.type]); // Dépendance : se recharge quand le type change

  // Gestion de la sélection d'un étudiant
  const handleSelectStudent = (selectedOption) => {
    if (
      !programmation.etudiants.some((e) => e.value === selectedOption.value)
    ) {
      setProgrammation((prev) => ({
        ...prev,
        etudiants: [...prev.etudiants, selectedOption],
      }));
    }
  };

  // Validation et redirection vers le récapitulatif
  const handleSubmit = () => {
    if (
      !programmation.type ||
      !programmation.date_prog ||
      programmation.etudiants.length === 0
    ) {
      alert("Veuillez remplir tous les champs avant de valider.");
      return;
    }
    navigate("/recap", { state: programmation });
  };

  return (
    <Layout>
      <Back>Programmations</Back>
      <br />
      <div className="row recap-container mx-auto px-4">
        <div className="col-md-6 mb-2">
          <h2>Nouvelle Programmation</h2>

          {/* Sélection du type de programmation */}
          <div className="mb-2">
            <label htmlFor="type" className="form-label mt-2">
              Type
            </label>
            <select
              id="type"
              className="form-control"
              value={programmation.type}
              onChange={(e) =>
                setProgrammation((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Sélectionnez un type</option>
              <option value="code">Code</option>
              <option value="conduite">Conduite</option>
            </select>
          </div>

          {/* Sélection de la date de programmation */}
          <div className="mb-2">
            <label htmlFor="date_prog" className="form-label mt-2">
              Date de programmation
            </label>
            <input
              type="date"
              id="date_prog"
              className="form-control"
              value={programmation.date_prog}
              min={new Date().toISOString().split("T")[0]} // Date minimale : aujourd'hui
              onChange={(e) =>
                setProgrammation((prev) => ({
                  ...prev,
                  date_prog: e.target.value,
                }))
              }
            />
          </div>

          {/* Sélection des étudiants */}
          <div className="mb-2">
            <label htmlFor="etudiant" className="form-label mt-2">
              Étudiant à programmer
            </label>
            <Select
              id="etudiant"
              options={etudiants}
              onChange={handleSelectStudent}
              placeholder="Ajouter un étudiant"
              isSearchable
              className="mt-2"
              isDisabled={!programmation.type} // Désactivé tant que le type n'est pas sélectionné
            />
          </div>
        </div>

        {/* Liste des étudiants sélectionnés */}
        <div className="col-md-6">
          <h2>Étudiant(s) sélectionné(s)</h2>
          <ul className="list-group">
            {programmation.etudiants.map((etudiant, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between"
              >
                {etudiant.label}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    setProgrammation((prev) => ({
                      ...prev,
                      etudiants: prev.etudiants.filter(
                        (e) => e.value !== etudiant.value
                      ),
                    }))
                  }
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton pour valider la programmation */}
        <button
          className="btn btn-primary mt-3 mx-auto w-100"
          onClick={handleSubmit}
        >
          Voir Récapitulatif
        </button>
      </div>
    </Layout>
  );
};

export default AddProgrammation;
