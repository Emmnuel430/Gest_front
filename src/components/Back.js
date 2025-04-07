import React from "react";
import { useNavigate } from "react-router-dom";

const Back = ({ children }) => {
  // Hook pour gérer la navigation entre les pages.
  const navigate = useNavigate();
  function back() {
    navigate(`/${children}`);
  }
  return (
    <div>
      <button onClick={back} className="btn btn-primary">
        {" "}
        ⬅ Retour
      </button>
    </div>
  );
};

export default Back;
