let importedData = [];
let selectedColumns = [];
let importedColumns = [];
let selectedRows = [];
let importedRows = [];
let idHistorique = 0;
let sum = 0;

Office.onReady(() => {
  document.getElementById("importButton").addEventListener("click", handleFile);
  document.getElementById("copyColumnButton").addEventListener("click", copySelectedColumns);
  document.getElementById("copyTableButton").addEventListener("click", copyEntireTable);
  document.getElementById("deleteFiltre").addEventListener("click", deleteFiltre);
  document.getElementById("additionByFilter").addEventListener("click", additionByFilter);
  document.getElementById("moyenneByFilter").addEventListener("click", moyenneByFilter);
  loadCSVFromLocalStorage();
});

// bouton import csv
document.getElementById("fileButton").addEventListener("click", function () {
  document.getElementById("fileInput").click();
});

function deleteFiltre() {
  importedColumns = 0;
  importedData = 0;
  selectedColumns = 0;
  selectedRows = 0;
  importedRows = 0;
}
// moyenne par colonne
function moyenneByFilter() {
  let sum = 0;
  let selectedData = [];

  if (selectedColumns.length === 0) {
    console.log("Aucune colonne sélectionnée.");
    return;
  }

  selectedData = importedData.map((row) =>
    selectedColumns.map((colIndex) => row[colIndex])
  );

  let numericValues = selectedData.flat().map((value) => {
    let num = parseFloat(value.toString().replace(",", "."));
    return isNaN(num) ? 0 : num;
  });

  console.log("Valeurs numériques:", numericValues);

  sum = numericValues.reduce((acc, val) => acc + val, 0);

  let average = numericValues.length > 0 ? sum / numericValues.length : 0;

  console.log("Moyenne calculée:", average);

  Excel.run(async (context) => {
    let sheet = context.workbook.worksheets.getActiveWorksheet();
    let targetRange = sheet.getRange("A2");

    targetRange.values = [[average]];
    await context.sync();

  }).catch((error) => {
    console.log('erreur moyenne')
  });
}

function updateMoyenneButtonState() {
  const moyenneButton = document.getElementById("moyenneByFilter");
  moyenneButton.disabled = selectedColumns.length === 0;
}

// fonction addition colonne
function additionByFilter() {
  let sum = 0;
  let selectedData = [];

  if (selectedColumns.length === 0) {
    return;
  }


  selectedData = importedData.map((row) => selectedColumns.map((colIndex) => row[colIndex]));

  let numericValues = selectedData.flat().map((value) => {
    let num = parseFloat(value.toString().replace(",", "."));
    return isNaN(num) ? 0 : num;
  });


  sum = numericValues.reduce((acc, val) => acc + val, 0);


  // Envoi du résultat dans A1
  Excel.run(async (context) => {
    let sheet = context.workbook.worksheets.getActiveWorksheet();
    let targetRange = sheet.getRange("A1");

    targetRange.values = [[sum]];
    await context.sync();
  }).catch((error) => {});
}

function updateAdditionButtonState() {
  const additionButton = document.getElementById("additionByFilter");
  additionButton.disabled = selectedColumns.length === 0;
}

function updateSelectedColumns() {
  updateAdditionButtonState();
  updateMoyenneButtonState();
}

// Pour faire fonctionner les CSV avec des ; ou des ,
function detectDelimiter(csvData) {
  let commaCount = (csvData.match(/,/g) || []).length;
  let semicolonCount = (csvData.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

// Pour importer un fichier CSV et l'afficher
function handleFile() {
  let fileInput = document.getElementById("fileInput");
  let file = fileInput.files[0];

  if (!file) {
    return;
  }

  let reader = new FileReader();
  reader.onload = function (event) {
    let csvData = event.target.result;

    try {
      let delimiter = detectDelimiter(csvData);
      importedData = csvData
        .split("\n")
        .map((row) => row.split(delimiter).map((cell) => cell.trim()));

      localStorage.setItem("importedCSV", csvData);
      localStorage.setItem("importedFileName", file.name);

      document.getElementById("fileName").textContent = file.name;

      let maxColumns = Math.max(...importedData.map((row) => row.length));
      importedData = importedData.map((row) => {
        while (row.length < maxColumns) {
          row.push("");
        }
        return row;
      });

      populateColumnSelector(importedData);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier CSV.");
    }
  };
  reader.readAsText(file);
}

// Copier les colonnes sélectionnées vers Excel
function copySelectedColumns() {
  if (selectedColumns.length === 0) {
    return;
  }

  Excel.run(async (context) => {
    let sheet = context.workbook.worksheets.getActiveWorksheet();

    let usedRange = sheet.getUsedRange();
    usedRange.load("columnCount");
    await context.sync();

    let startCol = usedRange.columnCount;
    let selectedData = [];

    if (selectedRows.length > 0) {
      selectedData = selectedRows.map((rowIndex) =>
        selectedColumns.map((colIndex) => importedData[rowIndex]?.[colIndex] || "")
      );
    } else {
      selectedData = importedData.map((row) => selectedColumns.map((colIndex) => row[colIndex]));
    }

    idHistorique++;

    // Afficher uniquement la première valeur de la première ligne de la colonne sélectionnée
    const rowMemory = document.createElement("div");
    rowMemory.classList.add("rowMemory");

    rowMemory.textContent = `${selectedData[0][0]} ${idHistorique}`;

    const checkboxMemoryParent = document.getElementById("checkboxMemoryParent");
    checkboxMemoryParent.appendChild(rowMemory);

    if (selectedData.length === 0 || selectedData[0].length === 0) {
      console.error("Aucune donnée valide sélectionnée.");
      return;
    }

    let numRows = selectedData.length;
    let numCols = selectedData[0].length;

    let targetRange = sheet.getRangeByIndexes(0, startCol, numRows, numCols);
    targetRange.values = selectedData;

    targetRange.format.autofitColumns();
    targetRange.format.autofitRows();
    await context.sync();
  }).catch(console.error);
}

// Copier toute la table vers Excel
function copyEntireTable() {
  if (importedData.length === 0) {
    return;
  }

  Excel.run(async (context) => {
    let sheet = context.workbook.worksheets.getActiveWorksheet();
    let targetRange = sheet.getRange("A1");

    let numRows = importedData.length;
    let numCols = importedData[0].length;
    targetRange = sheet.getRangeByIndexes(0, 0, numRows, numCols);
    targetRange.values = importedData;
    targetRange.format.autofitColumns();
    targetRange.format.autofitRows();
    await context.sync();
  }).catch(console.error);
}

// Gérer la sélection de colonnes dans la liste
function populateColumnSelector(data) {
  const checkboxContainer = document.getElementById("checkboxContainer");
  const checkboxRow = document.getElementById("checkboxRow");
  checkboxRow.innerHTML = "";
  checkboxContainer.innerHTML = "";

  if (data.length === 0) {
    return;
  }

  const firstRow = data[0];

  firstRow.forEach((value, index) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("checkbox-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "col" + index;
    checkbox.value = index;

    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedColumns.push(index);
        console.log(selectedColumns, "selectedColumns");
      } else {
        selectedColumns = selectedColumns.filter((colIndex) => colIndex !== index);
      }
      updateSelectedColumns();
      updateRowSelector(data);
      console.log(selectedColumns, "colonne");
      return selectedColumns;
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

// Mettre à jour le sélecteur de lignes en fonction des colonnes sélectionnées
function updateRowSelector(data) {
  const checkboxRow = document.getElementById("checkboxRow");
  const textSeparator = document.getElementById("rowSeparator");
  const Separator = document.getElementById("Separator");

  checkboxRow.innerHTML = "";

  if (selectedColumns.length === 0) {
    checkboxRow.style.display = "none";
    textSeparator.style.display = "none";
    Separator.style.display = "none";
    return;
  }
  textSeparator.style.display = "block";
  checkboxRow.style.display = "block";
  Separator.style.display = "block";

  const dataRow = [...data];

  selectedColumns.forEach((colIndex) => {
    // Ajouter une ligne de séparation au début de chaque groupe
    const separatorDiv = document.createElement("div");
    separatorDiv.classList.add("separator");
    checkboxRow.appendChild(separatorDiv);

    // Ajouter un en-tête pour la colonne sélectionnée
    const firstCellValue = data[0][colIndex] || `Colonne ${colIndex + 1}`;
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("header-item");
    headerDiv.textContent = `${firstCellValue}`;
    checkboxRow.appendChild(headerDiv);

    // Ajouter les lignes associées à cette colonne
    const uniqueValues = new Set();
    dataRow.forEach((row, rowIndex) => {
      const selectedRowMap = new Map();
      const alreadyImportedRows = new Set();

      const value = row[colIndex];

      if (rowIndex > 0 && !uniqueValues.has(value)) {
        const checkboxRowDiv = document.createElement("div");
        checkboxRowDiv.classList.add("checkbox-item");

        const checkboxR = document.createElement("input");
        checkboxR.type = "checkbox";
        checkboxR.id = "row" + rowIndex + "_" + colIndex;
        checkboxR.value = value;

        const labelRow = document.createElement("label");
        labelRow.setAttribute("for", checkboxR.id);
        labelRow.textContent = value || `Ligne ${rowIndex}`;

        checkboxRowDiv.appendChild(checkboxR);
        checkboxRowDiv.appendChild(labelRow);
        checkboxRow.appendChild(checkboxRowDiv);

        uniqueValues.add(value);

        checkboxR.addEventListener("change", (e) => {
          if (e.target.checked) {
            dataRow.forEach((r, i) => {
              if (selectedColumns.some((col) => r[col] === value)) {
                if (!alreadyImportedRows.has(i)) {
                  if (!selectedRowMap.has(i)) {
                    selectedRowMap.set(i, new Set());
                  }
                  selectedRowMap.get(i).add(colIndex);
                }
              }
            });
          } else {
            dataRow.forEach((r, i) => {
              if (selectedColumns.some((col) => r[col] === value)) {
                if (selectedRowMap.has(i)) {
                  selectedRowMap.get(i).delete(colIndex);
                  if (selectedRowMap.get(i).size === 0) {
                    selectedRowMap.delete(i);
                  }
                }
              }
            });
          }
          selectedRows = Array.from(selectedRowMap.keys()).map((row) =>
            typeof row === "number" ? row.toString() : row
          );
        });
      }
    });
  });
}

// Chargement d'un fichier dans le localStorage déjà importé
function loadCSVFromLocalStorage() {
  let storedCSV = localStorage.getItem("importedCSV");
  let fileName = localStorage.getItem("importedFileName");

  if (storedCSV) {
    try {
      let delimiter = detectDelimiter(storedCSV);
      importedData = storedCSV
        .split("\n")
        .map((row) => row.split(delimiter).map((cell) => cell.trim()));
      let maxColumns = Math.max(...importedData.map((row) => row.length));
      importedData = importedData.map((row) => {
        while (row.length < maxColumns) {
          row.push("");
        }
        return row;
      });
      populateColumnSelector(importedData);
      if (fileName) {
        document.getElementById("fileName").textContent = fileName;
      }
    } catch (error) {
      console.error("Erreur lors du chargement du fichier depuis le stockage local.");
    }
  }
}
