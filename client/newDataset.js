import {fetchDatasets} from './fetchDatasets.js'

export const newDatasetElement = document.getElementById('newDataset');

const datasetNameInput = document.getElementById('datasetNameInput');
const fileInput = document.getElementById('fileInput');
const submitButton = document.getElementById('datasetSubmit');
const loaderEl = document.getElementById('loader');

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
        const dataset = await response.json()
        submitButton.setAttribute('disabled', false);
        submitButton.textContent = 'Submit';
        loaderEl.style.display = 'flex';
        const intervalId = setInterval(async () => {
            const response = await fetch(`/training-status/${dataset.id}`);
            if(!response.ok){
                clearInterval(intervalId);
                console.log('Something went wrong when fetching training-status');
            }
            const datasetRecent = await response.json();
            const {status} = datasetRecent;
            if(
                status == 'segmentingError' ||
                status == 'mergingError' ||
                status == 'probabilityError' ||
                status == 'error' ||
                status == 'done'
            ) {
                clearInterval(intervalId);
                if(status == 'done'){
                    loaderEl.style.display = 'none';
                    newDatasetElement.style.display = 'none';
                    document.getElementById('main').style.display = 'flex';
                    await fetchDatasets();
                };
            }
            loaderEl.firstElementChild.textContent = status;
        }, 2000)
    } catch(e) {
        console.log(e);
    } 
    
})

