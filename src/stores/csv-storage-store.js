import { defineStore } from "pinia";

export const useCsvStore = defineStore('CSV', {
    actions: {
        async handleFile() {
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
    }
})