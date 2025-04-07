import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Protected = ({ Cmp, adminOnly = false }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");

    if (!userInfo) {
      navigate("/"); // Redirection si non connecté
      return;
    }

    const user = JSON.parse(userInfo);

    // Si la page est réservée à l’admin et que ce n’est pas un admin
    if (adminOnly && user.role === false) {
      navigate("/access-denied"); // Redirection vers la page d'accès refusé
      return;
    }

    setIsAuthorized(true); // Si tout est ok, on peut afficher la page
  }, [adminOnly, navigate]);

  return <>{isAuthorized ? <Cmp /> : null}</>;
};

export default Protected;
