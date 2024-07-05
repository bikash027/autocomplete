import {newDatasetElement} from './newDataset.js';
import {selectedDataset, fetchDatasets} from './fetchDatasets.js'
const mainElement = document.getElementById('main');
const inputElement = document.getElementsByTagName('textarea')[0];
const secondSuggestion = document.getElementById('second-suggestion');
const addDatasetButton = document.getElementById('addDataset');


inputElement.addEventListener('input', async (e) => {
    const text = e.target.value;
    if(text[text.length - 1] != ' '){
        return;
    }
    const words = text.split(' ');
    let lastWord = '';
    for(let i=words.length -1; i>=0; i--){
        if(words[i].length > 0){
            lastWord = words[i];
            break;
        }
    }
    if(lastWord.length === 0){
        return;
    }

    const response = await fetch(`/next-word/${selectedDataset}/${lastWord}`)

    if (!response.ok) {
        console.log(`HTTP error! Status: ${response.status}`);
        return;
    }
    const suggestion = await response.json();
    secondSuggestion.textContent = suggestion.nextWord;
})

secondSuggestion.addEventListener('click', () => {
    inputElement.value = inputElement.value + secondSuggestion.textContent;
    inputElement.focus();
})

addDatasetButton.addEventListener('click', () => {
    mainElement.style.display = 'none';
    newDatasetElement.style.display = 'flex';
})

window.addEventListener('load', fetchDatasets);

