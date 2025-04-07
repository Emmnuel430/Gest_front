import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap"; // Importation de Table depuis react-bootstrap
import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import Layout from "../../components/Layout"; // Composant pour la mise en page
import Back from "../../components/Back"; // Composant pour le bouton de retour
import ConfirmPopup from "../../components/ConfirmPopup"; // Importation du composant ConfirmPopup

const Recap = () => {
  const location = useLocation(); // Récupère l'état passé via la navigation
  const navigate = useNavigate(); // Permet de naviguer entre les pages
  const [programmation, setProgrammation] = useState(location.state || {}); // État pour stocker les données de programmation
  const [error, setError] = useState(""); // Pour afficher les erreurs
  const [showModal, setShowModal] = useState(false); // État pour afficher ou masquer le popup de confirmation

  // Vérification si les données de programmation sont présentes
  if (!programmation.type || !programmation.date_prog) {
    return <h3>Aucune programmation sélectionnée.</h3>; // Affiche un message si aucune programmation n'est disponible
  }

  // Fonction pour rediriger vers la page d'ajout de programmation avec les données actuelles
  const modifierProgrammation = () => {
    navigate("/add/programmation", { state: programmation }); // Redirection avec les données actuelles
  };

  // Fonction pour formater la date de programmation
  const formatProgDate = (dateString) => {
    const date = new Date(dateString);
    let formattedDate = date
      .toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(".", "")
      .toUpperCase(); // Enlever le point et mettre en majuscules

    return formattedDate.replace(
      /\b(\p{L}+)/u,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase() // Mettre la première lettre en majuscule
    );
  };

  // Fonction pour générer un fichier PDF
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); // Création d'un document PDF en mode paysage

    // Titre du document
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      `PROGRAMMATION DE ${programmation.type.toUpperCase()} DU ${formatProgDate(
        programmation.date_prog
      )}`,
      doc.internal.pageSize.getWidth() / 2, // Centrer le texte horizontalement
      15,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(14, 17, doc.internal.pageSize.getWidth() - 14, 17); // Ligne sous le titre

    // Préparation des données du tableau
    const rows = programmation.etudiants.map((e, index) => [
      index + 1, // Numéro
      e.label || "-", // Nom & Prénom(s)
      `${e.typePiece} - ${e.numPiece}` || "-", // Identifiants
      e.num_telephone || "-", // Téléphone
      e.nom_autoEc || "-", // Auto-école
      e.categorie || "-", // Catégorie
    ]);

    // Largeur totale du document en paysage
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10; // Marge de chaque côté
    const tableWidth = pageWidth - 2 * margin; // Largeur disponible pour le tableau

    // Génération du tableau
    doc.autoTable({
      startY: 20, // Position du tableau
      head: [
        [
          "#",
          "Nom & Prénom(s)",
          "Identifiants",
          "Téléphone",
          "Auto-école",
          "Catégorie",
        ],
      ],
      body: rows, // Contenu du tableau
      theme: "grid", // Style simple sans couleur de fond
      styles: {
        fontSize: 10,
        halign: "center", // Centre le texte horizontalement
        valign: "middle", // Centre le texte verticalement
        cellPadding: 3, // Espacement dans les cellules
      },
      headStyles: {
        fillColor: false, // Fond transparent
        textColor: [0, 0, 0], // Texte noir
        fontStyle: "bold",
        fontSize: 12, // Taille de police pour l'en-tête
        textTransform: "uppercase", // Texte en majuscules
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Largeur pour le numéro
        1: { cellWidth: "auto" }, // Largeur automatique pour le nom
        2: { cellWidth: "auto" }, // Largeur automatique pour les identifiants
        3: { cellWidth: "auto" }, // Largeur automatique pour le téléphone
        4: { cellWidth: "auto" }, // Largeur automatique pour l'auto-école
        5: { cellWidth: "auto" }, // Largeur automatique pour la catégorie
      },
      tableWidth: tableWidth, // Largeur totale du tableau
      margin: { left: margin, right: margin }, // Marges sur les côtés
    });

    // Génération du fichier en Blob
    const pdfBlob = doc.output("blob"); // Convertir le PDF en blob
    const pdfFile = new File(
      [pdfBlob],
      `Prog-${programmation.type}-${programmation.date_prog}.pdf`, // Nom du fichier
      { type: "application/pdf" }
    );

    // Mise à jour de l'état de la programmation avec le fichier PDF
    setProgrammation((prev) => ({
      ...prev,
      fichier_pdf: pdfFile, // Stocke le fichier PDF généré
    }));

    doc.save(pdfFile.name); // Téléchargement du fichier PDF
  };

  // Fonction pour valider la programmation
  const validerProgrammation = async () => {
    const userInfo = JSON.parse(localStorage.getItem("user-info")); // Récupération des informations utilisateur
    const userId = userInfo ? userInfo.id : null; // Vérification de l'authentification

    if (!userId) {
      setError("Utilisateur non authentifié. Veuillez vous connecter."); // Mise à jour de l'erreur
      navigate("/");
      return;
    }

    if (!programmation.fichier_pdf) {
      setError("Veuillez d'abord générer le PDF avant de valider."); // Mise à jour de l'erreur
      return;
    }

    // Création d'un formulaire pour envoyer les données
    const formData = new FormData();
    formData.append("date_prog", programmation.date_prog);
    formData.append("type", programmation.type);
    formData.append("idUser", userId);
    formData.append("fichier_pdf", programmation.fichier_pdf); // Ajout du fichier PDF
    formData.append(
      "nom_fichier",
      `Prog-${programmation.type}-${programmation.date_prog}.pdf` // Nom du fichier
    );

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_programmations`, // URL de l'API
        {
          method: "POST",
          body: formData, // Envoi des données
        }
      );

      if (response.ok) {
        alert("Programmation enregistrée avec succès !");
        navigate("/programmations"); // Redirection après succès
      } else {
        throw new Error("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error(error);
      setError("Échec de l'enregistrement :", error); // Mise à jour de l'erreur
    }
  };

  // Fonction pour ouvrir le popup de confirmation
  const handleShowModal = () => {
    setShowModal(true);
  };

  // Fonction pour fermer le popup de confirmation
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fonction pour confirmer la validation
  const handleConfirmValidation = () => {
    setShowModal(false);
    validerProgrammation(); // Appelle la fonction de validation
  };

  // Formatage du numéro de téléphone
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 "); // Ajout d'espaces entre chaque groupe de 2 chiffres
  };

  return (
    <Layout>
      <Back>add/programmation</Back> {/* Bouton de retour */}
      {error && (
        <div className="alert alert-danger w-50 mx-auto">{error}</div>
      )}{" "}
      <h2 className="text-center">Récapitulatif de la Programmation</h2>
      {/* Affichage des erreurs */}
      <div className="print-container card p-3 mt-3  px-4">
        <h4 className="text-center">
          Programmation de {programmation.type || "N/A"}
        </h4>
        <h5>Date: {formatProgDate(programmation.date_prog)}</h5>
        <Table className="table-bordered mt-3 w-75 mx-auto" responsive>
          <thead className="bg-light">
            <tr>
              <th className="text-center">N°</th>
              <th className="text-center">Nom & Prénom(s)</th>
              <th className="text-center">Téléphone </th>
              <th className="text-center">Auto-école</th>
              <th className="text-center">Catégorie </th>
              <th className="text-center">Identifiants</th>
            </tr>
          </thead>
          <tbody>
            {programmation.etudiants.map((etudiant, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td> {/* Numéro */}
                <td className="text-center">{etudiant.label}</td> {/* Nom */}
                <td className="text-center">
                  {formatPhoneNumber(etudiant.num_telephone)} {/* Téléphone */}
                </td>
                <td className="text-center">{etudiant.nom_autoEc}</td>{" "}
                {/* Auto-école */}
                <td className="text-center">
                  {etudiant.categorie || "-"}
                </td>{" "}
                {/* Catégorie */}
                <td className="text-center">
                  {etudiant.typePiece} - {etudiant.numPiece}{" "}
                  {/* Identifiants */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-center mt-4 px-4">
        <button
          className="btn btn-warning me-3"
          onClick={modifierProgrammation} // Bouton pour modifier la programmation
        >
          Modifier
        </button>
        <button className="btn btn-info me-3" onClick={generatePDF}>
          {" "}
          {/* Bouton pour générer le PDF */}
          Générer PDF
        </button>

        <button className="btn btn-success" onClick={handleShowModal}>
          {" "}
          {/* Bouton pour afficher le popup de confirmation */}
          Valider la programmation
        </button>
      </div>
      {/* Utilisation du ConfirmPopup */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmValidation}
        title="Confirmer la validation"
        body={
          <p>
            Êtes-vous sûr de vouloir valider la programmation suivante ?
            <br />
            <strong>Type :</strong>{" "}
            <span className="text-capitalize">{programmation.type}</span> <br />
            <strong>Date :</strong> {formatProgDate(programmation.date_prog)}
          </p>
        }
      />
      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }

        `}
      </style>
    </Layout>
  );
};

export default Recap;
