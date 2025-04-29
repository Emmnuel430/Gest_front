const fs = require("fs");
const path = require("path");

const outputFilePath = path.join(__dirname, "description.txt");

// Fonction pour scanner un dossier
function scanDirectory(dir, descriptions = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Si c'est un dossier, on le scanne récursivement
      scanDirectory(fullPath, descriptions);
    } else if (stats.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
      // Si c'est un fichier JS/TS, on l'analyse
      const relativePath = path.relative(__dirname, fullPath);
      const content = fs.readFileSync(fullPath, "utf-8");

      // Détection basique des types de fichiers
      let type = "Autre";
      if (content.includes("React") || content.includes("useState")) {
        type = "Composant React";
      } else if (
        content.includes("Route") ||
        content.includes("react-router")
      ) {
        type = "Route";
      } else if (file.includes("page") || dir.includes("pages")) {
        type = "Page";
      }

      descriptions.push(`${type}: ${relativePath}`);
    }
  });

  return descriptions;
}

// Fonction principale
function generateDescriptionFile() {
  const descriptions = scanDirectory(__dirname);

  // Écriture dans le fichier description.txt
  fs.writeFileSync(outputFilePath, descriptions.join("\n"), "utf-8");
  console.log(`Fichier description.txt généré à : ${outputFilePath}`);
}

// Exécuter le script
generateDescriptionFile();
