const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs').promises;
const getRandom = require('./utils/get-random')
const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './assets/training-data/')
//     },
//     filename: function (req, file, cb) {
//     //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, req.body.name + '.txt');
//     }
// })
const storage = multer.memoryStorage();
const upload = multer({storage});

const app = express()
const port = 3000


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static('client'))


app.post('/train', upload.single('file'), async (req, res, next) => {
    try{
        // const fileData = await fs.readFile('./assets/training-data/eye of the world.txt', 'utf-8');
        const fileData = req.file.buffer.toString('utf-8');
        await fs.writeFile(`assets/training-data/${req.body.name}.txt`, fileData, 'utf-8');
        const sentences = fileData.split(/\?|\n|\r|\./)
        let sentenceArr = sentences.map(sentence => sentence.split(' '))
        sentenceArr = sentenceArr.map(sentence => sentence.map(word => word.replace(',', '')))
        sentenceArr = sentenceArr.filter(sentence => sentence.length > 1)
        sentenceArr = sentenceArr.map(sentence => sentence.filter(word => word.length > 0));
        sentenceArr = sentenceArr.map(sentence => sentence.map(word => word.toLowerCase()));
        const model = {};
        sentenceArr.forEach(sentence => {
            for(let i=0; i < sentence.length - 1; i++){
                const currentWord = sentence[i];
                const nextWord = sentence[i+1];
                if(!model[currentWord]){
                    model[currentWord] = {};
                }
                const transitionCounts = model[currentWord];
                if(!transitionCounts[nextWord]){
                    transitionCounts[nextWord] = 0
                }
                transitionCounts[nextWord] += 1;
            }
        })
        Object.keys(model).forEach(word => {
            const transitionCounts = model[word];
            let total = 0;
            Object.keys(transitionCounts).forEach(el => {
                total += transitionCounts[el];
            })
            const transitionProbabilities = {};
            Object.keys(transitionCounts).forEach(el => {
                transitionProbabilities[el] = transitionCounts[el]/total;
            })
            model[word] = transitionProbabilities;
        })
        await fs.writeFile(`assets/trained-models/${req.body.name}.json`, JSON.stringify(model), 'utf-8');
        res.json({success: true});
    } catch(e) {
        next(e);
    } finally {
        // await connection.end()
    }
})

app.get('/next-word/:dataset/:word', async (req, res, next) => {
    try{
        const {dataset, word} = req.params;
        const modelJSON = await fs.readFile(`assets/trained-models/${dataset}.json`, 'utf-8');
        const model = JSON.parse(modelJSON);
        let transitionProbabilities = model[word.toLowerCase()];
        if(!transitionProbabilities){
            transitionProbabilities = {}
        }
        const nextWord = getRandom(
            Object.keys(transitionProbabilities),
            Object.keys(transitionProbabilities).map(el => transitionProbabilities[el]),
        )
        res.json({nextWord});
    } catch(e) {
        next(e);
    } finally {
        // await connection.end()
    }
})

app.get('/datasets', async (req, res, next) => {
    try {
        const files = await fs.readdir('assets/trained-models/');
        const datasets = files.map(file => file.split('.')[0])
        res.json({datasets});
    } catch(e) {
        next(e);
    }
})

app.get('/', (req, res) => {
    res.redirect('/client/index.html');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})