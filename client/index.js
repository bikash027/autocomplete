const inputElement = document.getElementsByTagName('textarea')[0];
const secondSuggestion = document.getElementById('second-suggestion');
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

    const response = await fetch(`/next-word/eye of the world/${lastWord}`)

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