export const datasetSelect = document.getElementById('datasetSelect');
export let selectedDataset = '';
export const fetchDatasets = async () => {
    try{
        const response = await fetch('/datasets');
        if(!response.ok){
            throw new Error('Something went wrong');
        }
        const {datasets} = await response.json();
        selectedDataset = datasets[0];
        datasetSelect.replaceChildren([]);
        for(const dataset of datasets){
            const optionEl = document.createElement('option');
            optionEl.textContent = dataset;
            if(dataset == selectedDataset) 
                optionEl.setAttribute('selected', true)
            datasetSelect.appendChild(optionEl);
        }
    } catch(e) {
        console.log(e);
    }
}

datasetSelect.addEventListener('change', () => {
    selectedDataset = datasetSelect.value;
})