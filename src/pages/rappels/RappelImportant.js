import React, { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Loader from "../../components/Loader";

const RappelImportant = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/generate_rappels`
        );
        const data = await response.json();
        setRappels(data.rappels);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la récupération des rappels.");
        setLoading(false);
      }
    };

    fetchRappels();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: false,
      locale: fr,
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant";
    }

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
      shortened = shortened.replace(regex, replacement);
    });

    return shortened;
  };

  return (
    <div className="bg-body rounded p-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="mb-0">Rappels Importants ({rappels.length})</h4>
        {/* <a href="/rappels-complets">Voir tout</a> */}
      </div>
      {rappels.length === 0 ? (
        <div>Aucun rappel important.</div>
      ) : (
        rappels
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((rappel, index) => (
            <div
              key={index}
              className={`d-flex align-items-center border shadow-sm rounded p-3 mb-2 
              ${
                rappel.priorite === "élevée"
                  ? "border-danger bg-danger-subtle"
                  : "border-warning bg-warning-subtle"
              }`}
            >
              <i
                className={`bi ${
                  rappel.priorite === "élevée"
                    ? "bi-exclamation-triangle-fill text-danger"
                    : "bi-exclamation-circle-fill text-warning"
                }`}
                style={{ fontSize: "2rem" }}
              ></i>
              <div className="w-100 ms-3">
                <div className="d-flex w-100 justify-content-between">
                  <h6
                    className={`mb-0 fw-bold ${
                      rappel.priorite === "élevée"
                        ? "text-danger"
                        : "text-warning"
                    }`}
                  >
                    {rappel.titre}
                  </h6>
                  <small className="text-muted">
                    {formatDateRelative(rappel.created_at)}
                  </small>
                </div>
                <span className="text-muted">
                  {rappel.description || "Pas de description."}
                </span>

                <br />
                {rappel.date_rappel && (
                  <span className="text-muted italic">
                    Date de l'examen :{" "}
                    {format(new Date(rappel.date_rappel), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default RappelImportant;
