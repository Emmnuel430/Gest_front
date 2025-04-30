const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const outputFilePath = path.join(__dirname, "description.txt");

const categories = {
  Racines: [],
  Components: [],
  Pages: [],
};

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(__dirname, fullPath);

    if (entry.isDirectory()) {
      // Exclure node_modules même s’il est dans src (par précaution)
      if (entry.name !== "node_modules") {
        walk(fullPath);
      }
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const label = `Composant React: ${relativePath.replace(/\\/g, "\\")}`;

      if (relativePath.includes("components")) {
        categories.Components.push(label);
      } else if (relativePath.includes("pages")) {
        categories.Pages.push(label);
      } else {
        categories.Racines.push(label);
      }
    }
  });
}

function generateOutput() {
  const outputLines = [];

  const pushCategory = (title, items) => {
    outputLines.push(`-${title}`);
    if (title === "Pages") {
      const grouped = {};
      items.forEach((item) => {
        const match = item.match(/pages\\([^\\]+)\\/);
        const key = match ? match[1] : "Divers";
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
      });

      for (const section of Object.keys(grouped)) {
        outputLines.push(...grouped[section]);
        outputLines.push("--");
      }
    } else {
      outputLines.push(...items);
    }
  };

  pushCategory("Racines", categories.Racines);
  pushCategory("Components", categories.Components);
  pushCategory("Pages", categories.Pages);

  fs.writeFileSync(outputFilePath, outputLines.join("\n"), "utf-8");
  console.log(`✅ description.txt généré à : ${outputFilePath}`);
}

// Exécuter
walk(srcDir);
generateOutput();
