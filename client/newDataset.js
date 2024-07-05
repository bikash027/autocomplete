import {fetchDatasets} from './fetchDatasets.js'

export const newDatasetElement = document.getElementById('newDataset');

const datasetNameInput = document.getElementById('datasetNameInput');
const fileInput = document.getElementById('fileInput');
const submitButton = document.getElementById('datasetSubmit');

submitButton.addEventListener('click', async () => {
    try{
        const name = datasetNameInput.value;
        const file = fileInput.files[0];
        if(!name || !file){
            return;
        }
        submitButton.setAttribute('disabled', true);
        submitButton.textContent = 'Submitting...';
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file, name+'.txt');
        const response = await fetch('/train', {
            method: 'POST',
            body: formData
        });
        if(!response.ok){
            throw new Error('Something went wrong');
        }
        submitButton.setAttribute('disabled', false);
        submitButton.textContent = 'Submit';
        newDatasetElement.style.display = 'none';
        document.getElementById('main').style.display = 'flex';
        await fetchDatasets();
    } catch(e) {
        console.log(e);
    } 
    
})

