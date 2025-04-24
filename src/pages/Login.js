import React, { useState, useEffect } from "react";
import "../assets/css/Login.css";
import loginImage from "../assets/img/login1.png";
import logo from "../assets/img/logo.png";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const Login = () => {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // État pour gérer les messages d'erreur
  const [loading, setLoading] = useState(false); // État pour indiquer le chargement
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user-info")) {
      navigate("/home"); // Redirige si l'utilisateur est déjà connecté
    }
  }, []);

  async function login(e) {
    e.preventDefault(); // Empêche le rafraîchissement de la page
    // Validation des entrées utilisateur
    if (!pseudo || !password) {
      setError("Le pseudo et le mot de passe sont réquis");
      return;
    }

    setError(""); // Réinitialise les erreurs si les validations passent
    setLoading(true); // Active l'état de chargement

    // Appel à l'API pour tenter la connexion
    try {
      let item = { pseudo, password };
      let result = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(item),
      });

      result = await result.json();
      console.log("Résultat du backend :", result);

      // Gère une réponse d'erreur de l'API
      if (result.error) {
        setError(result.error); // Affiche un message d'erreur provenant de l'API
        setLoading(false); // Désactive l'état de chargement
        return;
      }

      // Stocke les informations utilisateur si la connexion réussit
      localStorage.setItem("user-info", JSON.stringify(result.user));
      localStorage.setItem("token", result.access_token); // Stocke le token d'accès si nécessaire

      setLoading(false); // Désactive l'état de chargement
      navigate("/home"); // Redirige vers la page d'accueil ou tableau de bord
    } catch (e) {
      setError("Une erreur innatendue s'est produite. Réessayez");
      setLoading(false); // Désactive l'état de chargement
    }
  }
  return (
    <div>
      <section>
        <div className="container">
          <div className="user signinBx">
            <div className="imgBx bg-body">
              <img src={loginImage} alt="Login Illustration" />
            </div>
            <div className="formBx bg-body">
              <img src={logo} alt="Logo" />
              <form onSubmit={login}>
                <h2>Connexion</h2>
                <label htmlFor="Pseudo">Pseudo</label>
                <input
                  type="text"
                  placeholder="Pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
                <br />
                <br />
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Mot de Passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  type="submit"
                  value={loading ? "Connexion ..." : "Connexion"}
                  disabled={loading}
                />
                &nbsp;
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                  </>
                ) : null}
              </form>
              {error && <p>{error}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
