# Documentation

Autocomplete is a simple application that suggests the next word in the text. It uses a simple model based on Markov-chain. Multiple such models can be trained with different datasets and any such trained model can be used for the suggestions. It uses only the last word in the text for the suggestion.

The application is divided into two parts: server-side and client-side. The server-side is implemented using ExpressJs. The client side is a web page in which the Javascript code connects to the server-side via HTTP endpoints.

## Running the application

1. Clone the repo in your computer
2. cd into the repo's home directory
3. Install dependencies
4. Start the server
5. Open the UI in the browser (go to http://localhost3000)
```bash
git clone https://github.com/bikash027/autocomplete
cd autocomplete
npm install
npm start
```


