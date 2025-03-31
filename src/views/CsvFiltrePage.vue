<template>
  <div class="container">
    <h2 class="title">Importer un fichier CSV</h2>
    <div style="display: flex; flex-direction: row; justify-content: center;">
      <input type="file" ref="fileInput" @change="handleFileChange">
      <button id="importButton" class="btn primary-btn" @click="importCsv">Importer</button>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center">
      <h3 style="text-align: center">Fichier en cours :</h3>
      <span id="fileName">{{ fileName }}</span>
    </div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator"></div>
    </div>
    <h3 class="subtitle" style="text-align: center; margin-bottom: 1.3em">
      Sélectionner les colonnes à insérer
    </h3>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator"></div>
    </div>
    <div id="checkboxContainer"></div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator"></div>
    </div>
    <h3 class="subtitle" style="text-align: center; margin-bottom: 1.5em;" id="rowSeparator">
      Sélectionner un filtre
    </h3>
    <div id="scrollRowValue" style="display: flex; justify-content: center; width: 90vw;">
      <div id="checkboxRow"></div>
    </div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator" id="Separator"></div>
    </div>
    <div style="width: 95vw; display: flex; justify-content: center;">
      <div style="display: flex; flex-direction: column; justify-content: space-evenly; width: 300px;">
        <button id="copyColumnButton" style="margin-right: 1em;" class="btn secondary-btn" disabled>
          Copier la sélection
        </button>
        <button id="copyTableButton" class="btn tertiary-btn" disabled style="margin-right: 1em;">
          Copier tout le tableau
        </button>
        <button id="deleteFiltre" class="btn-delete-filtre" disabled style="margin-right: 1em; margin-bottom: 0.5em;">
          Supprimer le filtre
        </button>
      </div>
    </div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator"></div>
    </div>
    <h3 class="subtitle" style="text-align: center; margin-bottom: 1em">Formule par colonne</h3>
    <div style="width: 95vw; display: flex; justify-content: center;">
      <div style="display: flex; flex-direction: column; justify-content: space-evenly; width: 300px; height: 100px;">
        <button id="moyenneByFilter" style="margin-right: 1em;  margin-bottom: 9px;" class="btn secondary-btn" disabled>
          Moyenne
        </button>
        <button id="additionByFilter" style="margin-right: 1em;" class="btn secondary-btn" disabled>
          Addition
        </button>
      </div>
    </div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator" id="separatorHistorique"></div>
    </div>
    <h3 style="text-align: center;">Historique</h3>
    <div id="scrollHistorique" style="display: flex; justify-content: center; width: 90vw;">
      <div id="checkboxMemoryParent"></div>
    </div>
    <div style="width: 90vw; justify-items: center;">
      <div class="separator"></div>
    </div>
    <h3 class="subtitle" style="text-align: center; margin-bottom: 5vh;">Appliquer un filtre sur un tableau</h3>
    <div style="display: flex; justify-content: center;">
      <input type="text" id="inputTableau" class="input-field" placeholder="Veuillez entrer le nom du tableau" style="width: 80vw; max-width: 450px;" />
    </div>
    <div style="display: flex; justify-content: center;">
      <button id="miseAJourTableau" class="btn primary-btn" style="margin-bottom: 1em; width: 300px;">
        Selectionner ce tableau
      </button>
    </div>
    <div id="checkboxContainerFiltre" style="margin-left: 5vw;"></div>
    <div style="display: flex; justify-content: center;">
      <input type="text" id="inputFiltre" class="input-field" placeholder="Veuillez entrer un élément à filtrer" style="width: 80vw; max-width: 450px;" />
    </div>
    <div style="display: flex; justify-content: center;">
      <div style="display: flex; justify-content: space-evenly; flex-direction: column; width: 300px;">
        <button type="button" id="filtreColumn" class="btn primary-btn">
          Appliquer le filtre
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCsvStore } from '@/stores/csv-storage-store';

const fileInput = ref(null);
const fileName = ref('Aucun fichier choisi');
const store = useCsvStore();

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
  }
}

async function importCsv() {
  const file = fileInput.value.files[0];
  if (file) {
    await store.handleFile(file);
  }
}
</script>

<style>
@import "src/style/style.css";
</style>