import { importedData, selectedColumns, importedColumns } from "..taskpane/taskpane.js";

let data = importedData;
let checkboxRows = {}; // Stocke les cases à cocher des lignes

// Fonction pour générer les cases à cocher
function populateCheckboxContainer(data, containerId, selectedItems, importedItems, itemType) {
  const checkboxContainer = document.getElementById(containerId);
  checkboxContainer.innerHTML = ""; // Vider avant de remplir

  if (!data || data.length === 0) {
    return;
  }

  data.forEach((value, index) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("checkbox-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${itemType}${index}`;
    checkbox.value = index;

    // Gestion du changement d'état du checkbox
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (importedItems.includes(index)) {
          e.target.checked = false;
          alert(`Cette ${itemType} a déjà été importée et ne peut être sélectionnée à nouveau.`);
        } else {
          selectedItems.push(index);
          if (itemType === "col") {
            displayRowCheckboxesBelowColumn(index);
          }
        }
      } else {
        selectedItems = selectedItems.filter((itemIndex) => itemIndex !== index);
        if (itemType === "col") {
          hideRowCheckboxes(index);
        }
      }
    });

    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = value || `Colonne ${index + 1}`;

    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    checkboxContainer.appendChild(checkboxDiv);
  });

  document.getElementById("copyColumnButton").disabled = false;
  document.getElementById("copyTableButton").disabled = false;
}

// Sélection des colonnes
function populateColumnSelector(data) {
  populateCheckboxContainer(
    data[0],
    "checkboxRowContainer",
    selectedColumns,
    importedColumns,
    "col"
  );
}

// Initialiser les cases à cocher des lignes
function initializeRowCheckboxes(data) {
  checkboxRows = {}; // Reset

  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!checkboxRows[colIndex]) {
        checkboxRows[colIndex] = [];
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = cell;
      checkbox.style.display = "none"; // Caché par défaut

      checkboxRows[colIndex].push(checkbox);
    });
  });
}

// Afficher les cases à cocher des lignes sous la colonne
function displayRowCheckboxesBelowColumn(columnIndex) {
  const checkboxContainer = document.getElementById("checkboxRowContainer");
  let rowCheckboxesContainer = document.getElementById(`row-checkboxes-${columnIndex}`);

  if (!rowCheckboxesContainer) {
    rowCheckboxesContainer = document.createElement("div");
    rowCheckboxesContainer.id = `row-checkboxes-${columnIndex}`;
    rowCheckboxesContainer.classList.add("row-checkboxes-container");
    checkboxContainer.appendChild(rowCheckboxesContainer);
  }

  rowCheckboxesContainer.innerHTML = ""; // Nettoyer avant d'ajouter

  const rowCheckboxes = checkboxRows[columnIndex];
  if (rowCheckboxes) {
    rowCheckboxes.forEach((checkbox) => {
      checkbox.style.display = "block";
      rowCheckboxesContainer.appendChild(checkbox);
    });
  }
}

// Masquer les cases à cocher des lignes sous une colonne
function hideRowCheckboxes(columnIndex) {
  const rowCheckboxesContainer = document.getElementById(`row-checkboxes-${columnIndex}`);
  if (rowCheckboxesContainer) {
    rowCheckboxesContainer.remove(); // Supprimer complètement
  }
}

// Exemple d'utilisation
// initializeRowCheckboxes(data);
// populateColumnSelector(data);
