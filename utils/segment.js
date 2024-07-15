const { Graph, State, Transition, sequelize } = require("../db/db");

const segment = async ({dataset, file}) => {
    try{
        const segmentLength = 10000;
        for(let i=0, l=file.buffer.length; i<l; i += segmentLength){
            const endSegment = i + segmentLength > l? l: i + segmentLength;
            const fileData = file.buffer.toString('utf-8', i, endSegment);
            const sentences = fileData.split(/\?|\n|\r|\.|;|“|”/)
            let sentenceArr = sentences.map(sentence => sentence.split(' '))
            sentenceArr = sentenceArr.map(sentence => sentence.map(word => word.replace(',', '')))
            sentenceArr = sentenceArr.filter(sentence => sentence.length > 1)
            sentenceArr = sentenceArr.map(sentence => sentence.filter(word => word.length > 0));
            sentenceArr = sentenceArr.map(sentence => sentence.map(word => word.toLowerCase()));
            const graph = await Graph.create({
                datasetId: dataset.id,
                segment: i/segmentLength
            })
            const graphMap = new Map();
            sentenceArr.forEach(sentence => {
                for(let i=0; i < sentence.length - 1; i++){
                    const currentWord = sentence[i];
                    const nextWord = sentence[i+1];
                    if(!graphMap.has(currentWord)){
                        graphMap.set(currentWord, new Map());
                    }
                    if(!graphMap.has(nextWord)){
                        graphMap.set(nextWord, new Map());
                    }
                    const transitionCounts = graphMap.get(currentWord);
                    if(!transitionCounts.has(nextWord)){
                        transitionCounts.set(nextWord, 0)
                    }
                    transitionCounts.set(nextWord, transitionCounts.get(nextWord) + 1);
                }
            })
            const stateData = [];
            for(const key of graphMap.keys()){
                stateData.push({
                    state: key,
                    graphId: graph.id
                })
            }
            await State.bulkCreate(stateData);
            const states = await State.findAll({
                where: {
                    graphId: graph.id
                }
            })
            const transitionData = [];
            for(const [key, transCountMap] of graphMap){
                const sourceState = states.find(el => el.state == key);
                for(const [word, count] of transCountMap){
                    const destState = states.find(el => el.state == word);
                    transitionData.push({
                        sourceStateId: sourceState.id,
                        destStateId: destState.id,
                        count
                    })
                }
            }
            await Transition.bulkCreate(transitionData);
        }
    } catch(e) {
        console.log(e);
        dataset.status = 'segmentingError';
        await dataset.save();
    }
}

module.exports = segment;