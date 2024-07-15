const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const {sequelize, State, Transition, Graph, Dataset} = require('./db/db');
const getRandom = require('./utils/get-random');
const trainAsync = require('./utils/train-async');


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
        const dataset = await Dataset.create({
            name: req.body.name
        });
        trainAsync({dataset, file: req.file});
        res.json(dataset.toJSON());
    } catch(e) {
        next(e);
    } finally {
        // await connection.end()
    }
})

app.get('/training-status/:datasetId', async (req, res, next) => {
    try{
        const dataset = await Dataset.findOne({
            where: {id: req.params.datasetId}
        })
        res.json(dataset.toJSON());
    } catch(e) {
        next(e);
    }
})

app.get('/next-word/:dataset/:state', async (req, res, next) => {
    try{
        const {dataset, state} = req.params;
        const datasetObj = await Dataset.findOne({
            where: {name: dataset},
            attributes: ['id']
        })
        const graph = await Graph.findOne({
            where: {datasetId: datasetObj.id},
            attributes: ['id']
        })
        const stateObj = await State.findOne({
            where: {
                graphId: graph.id,
                state,
            },
            attributes: ['id'],
            // include: Transition
        })
        const transitions = await Transition.findAll({
            where: {sourceStateId: stateObj.id}
        })
        const nextStateId = getRandom(
            transitions?.map(el => el.destStateId)??[],
            transitions?.map(el => el.probability)??[],
        )
        if(!nextStateId){
            res.json({nextWord: ''})
        }
        const nextState = await State.findOne({
            where:{
                id: nextStateId
            }
        })
        res.json({nextWord: nextState?.state?? ''});
    } catch(e) {
        next(e);
    } finally {
        // await connection.end()
    }
})

app.get('/datasets', async (req, res, next) => {
    try {
        const datasets = await Dataset.findAll({
            attributes: ['name']
        });
        // const datasets = files.map(file => file.split('.')[0])
        res.json({datasets: datasets.map(dataset => dataset.name)});
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

