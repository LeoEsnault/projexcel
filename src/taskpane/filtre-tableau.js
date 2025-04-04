document.addEventListener("DOMContentLoaded", function () {
  const miseAJourButton = document.getElementById("miseAJourTableau");
  const filtreButton = document.getElementById("filtreColumn");
  const inputFiltre = document.getElementById("inputFiltre");
  const inputTableau = document.getElementById("inputTableau");
  const checkboxContainerFiltre = document.getElementById("checkboxContainerFiltre");


  // Mettre à jour la table active
  miseAJourButton.addEventListener("click", () => {
    Excel.run(async (context) => {
      await chargerColonnes(context);
    }).catch((error) => console.error("Erreur de mise à jour des colonnes :", error));
  });

  // Appliquer le filtre sur une colonne
  filtreButton.addEventListener("click", () => {
    Excel.run(async (context) => {
      await appliquerFiltre(context);
    }).catch((error) => console.error("Erreur d'application du filtre :", error));
  });

  // Récupérer la table active
  function getActiveTable(context) {
    const tableName = inputTableau.value.trim();
    if (!tableName) {
      console.error("Veuillez entrer le nom du tableau.");
      return null;
    }
    return context.workbook.tables.getItem(tableName);
  }

  // Charger dynamiquement les colonnes
  async function chargerColonnes(context) {
    let table = getActiveTable(context);
    if (!table) return;

    let colonnes = table.columns;
    colonnes.load("items/name");
    await context.sync();

    // Affichage des colonnes dans les cases à cocher
    checkboxContainerFiltre.innerHTML = "";
    colonnes.items.forEach((colonne) => {
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `col_${colonne.name}`;
      checkbox.value = colonne.name;

      let label = document.createElement("label");
      label.setAttribute("for", checkbox.id);
      label.textContent = colonne.name;

      checkboxContainerFiltre.appendChild(checkbox);
      checkboxContainerFiltre.appendChild(label);
      checkboxContainerFiltre.appendChild(document.createElement("br"));
    });
  }

  // Appliquer un filtre sur la colonne sélectionnée
  async function appliquerFiltre(context) {
    let valeurFiltre = inputFiltre.value.trim();
    if (!valeurFiltre) {
      console.error("Veuillez entrer une valeur à filtrer.");
      return;
    }

    let table = getActiveTable(context);
    if (!table) return;

    let colonnes = table.columns;
    colonnes.load("items/name");
    await context.sync();

    let selectedCol = document.querySelector("#checkboxContainerFiltre input:checked");
    if (!selectedCol) {
      console.error("Veuillez sélectionner une colonne.");
      return;
    }

    let colonne = colonnes.items.find((col) => col.name === selectedCol.value);
    if (!colonne) {
      console.error("Colonne sélectionnée introuvable.");
      return;
    }

    let valeurs = colonne.getDataBodyRange();
    valeurs.load("values");
    await context.sync();

    let valeurFiltreNumerique = isNaN(valeurFiltre) ? valeurFiltre : parseFloat(valeurFiltre);

    // Vérifier si la valeur existe dans la colonne
    let valeurExiste = valeurs.values.flat().some((cellValue) => {
      if (cellValue === null || cellValue === undefined) return false;
      return isNaN(cellValue) ? cellValue === valeurFiltre : parseFloat(cellValue) === valeurFiltreNumerique;
    });

    if (!valeurExiste) {
      console.error("Erreur : Valeur inexistante dans la colonne.");
      return;
    }

    // Appliquer le filtre sur la colonne sélectionnée
    colonne.filter.applyValuesFilter([valeurFiltre]);
    await context.sync();
    console.log("Filtre appliqué avec :", valeurFiltre);
  }
});
