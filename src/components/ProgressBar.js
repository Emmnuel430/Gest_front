import React from "react";

const ProgressBar = ({ currentStep, motifInscription }) => {
  // Liste des étapes par défaut
  const defaultSteps = [
    {
      name: "Inscription",
      key: "inscription",
      color: "primary",
      percentage: 5,
    },
    {
      name: "Visite Médicale",
      key: "visite_médicale",
      color: "warning",
      percentage: 10,
    },
    {
      name: "Cours de Code",
      key: "cours_de_code",
      color: "info",
      percentage: 30,
    },
    {
      name: "Examen de Code",
      key: "examen_de_code",
      color: "success",
      percentage: 15,
    },
    {
      name: "Cours de Conduite",
      key: "cours_de_conduite",
      color: "info",
      percentage: 25,
    },
    {
      name: "Examen de Conduite",
      key: "examen_de_conduite",
      color: "success",
      percentage: 15,
    },
  ];

  // Étapes spécifiques pour "recyclage"
  const recyclingSteps = [
    {
      name: "Inscription",
      key: "inscription",
      color: "primary",
      percentage: 33,
    },
    {
      name: "Cours de Conduite",
      key: "cours_de_conduite",
      color: "info",
      percentage: 33,
    },
    {
      name: "Examen de Conduite",
      key: "examen_de_conduite",
      color: "success",
      percentage: 34,
    },
  ];

  // Sélection des étapes en fonction du motif d'inscription
  const steps =
    motifInscription === "recyclage" ? recyclingSteps : defaultSteps;

  // Fonction pour calculer le pourcentage total atteint
  const calculateTotalPercentage = (steps, currentIndex) => {
    return steps
      .slice(0, currentIndex + 1)
      .reduce((total, step) => total + step.percentage, 0);
  };

  // Trouver l'étape actuelle
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  // Gestion des erreurs
  if (currentIndex === -1) {
    return (
      <div className="text-danger">
        Étape actuelle invalide : {currentStep || "Non définie"}
      </div>
    );
  }

  // Calcul du pourcentage total atteint
  const totalPercentage = calculateTotalPercentage(steps, currentIndex);

  return (
    <div className="progress-container">
      {/* Titre de l'étape actuelle */}
      <h5 className="text-center mb-3">
        Étape actuelle :{" "}
        <span className={`text-${steps[currentIndex].color} fw-bold`}>
          {steps[currentIndex].name}
        </span>
      </h5>

      {/* Affichage du pourcentage total atteint */}
      <h6 className="text-center mb-3">
        Progression totale : <span className="fw-bold">{totalPercentage}%</span>
      </h6>

      {/* Barre de progression */}
      <div className="progress">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`progress-bar progress-bar-striped progress-bar-animated bg-${step.color}`}
            role="progressbar"
            style={{
              width: index <= currentIndex ? `${step.percentage}%` : "0%",
            }}
            aria-valuenow={step.percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {/* {index <= currentIndex ? `${step.percentage}%` : ""} */}
          </div>
        ))}
      </div>

      {/* Style supplémentaire */}
      <style jsx>{`
        .progress-container {
          width: 100%;
        }
        .progress {
          height: 25px;
        }
        .progress-bar {
          text-align: center;
          font-size: 12px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
