import React from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarLinks = ({ user }) => {
  const location = useLocation();

  // Fonction pour vérifier si une route est active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-nav w-100">
      {/* Lien vers le tableau de bord */}
      <Link
        to="/home"
        className={`nav-item nav-link ${isActive("/home") ? "active" : ""}`}
      >
        <i className="fa fa-tachometer-alt me-2"></i>Dashboard
      </Link>

      {/* Lien vers la gestion des étudiants */}
      <Link
        to="/etudiants"
        className={`nav-item nav-link ${
          isActive("/etudiants") || isActive("/add/etudiant") ? "active" : ""
        }`}
      >
        <i className="fa fa-users me-2"></i>Etudiants
      </Link>

      {/* Lien vers la gestion des résultats */}
      <Link
        to="/resultats"
        className={`nav-item nav-link ${
          isActive("/resultats") || isActive("/add/resultat") ? "active" : ""
        }`}
      >
        <i className="fa fa-clipboard-check me-2"></i>Résultats
      </Link>

      {/* Lien vers la gestion des programmations */}
      <Link
        to="/programmations"
        className={`nav-item nav-link ${
          isActive("/programmations") || isActive("/add/programmation")
            ? "active"
            : ""
        }`}
      >
        <i className="fa fa-calendar-alt me-2"></i>Programmation
      </Link>

      {/* Lien vers les rappels */}
      <Link
        to="/rappels"
        className={`nav-item nav-link ${isActive("/rappels") ? "active" : ""}`}
      >
        <i className="fa fa-bell me-2"></i>Rappels
      </Link>

      {/* Affichage des liens réservés uniquement aux administrateurs */}
      {user.role == 1 && (
        <>
          {/* Lien vers la vue globale */}
          <Link
            to="/global"
            className={`nav-item nav-link ${
              isActive("/global") ? "active" : ""
            }`}
          >
            <i className="fa fa-globe me-2"></i>Global
          </Link>

          {/* Lien vers la gestion des utilisateurs */}
          <Link
            to="/utilisateurs"
            className={`nav-item nav-link ${
              isActive("/utilisateurs") || isActive("/register") ? "active" : ""
            }`}
          >
            <i className="fa fa-user-friends me-2"></i>Utilisateurs
          </Link>

          {/* Lien vers la gestion des moniteurs */}
          <Link
            to="/moniteurs"
            className={`nav-item nav-link ${
              isActive("/moniteurs") ? "active" : ""
            }`}
          >
            <i className="fa fa-chalkboard-teacher me-2"></i>Moniteurs
          </Link>

          {/* Lien vers les logs */}
          <Link
            to="/logs"
            className={`nav-item nav-link ${isActive("/logs") ? "active" : ""}`}
          >
            <i className="fa fa-file-alt me-2"></i>Logs
          </Link>
        </>
      )}
    </div>
  );
};

export default SidebarLinks;
