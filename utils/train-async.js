const { Graph, State, Transition, sequelize } = require("../db/db");
const merge = require('./merge');
const calcProbability = require('./calculate-probability');
const segment = require("./segment");

const trainAsync = async ({dataset, file}) => {
    try{

        // 1. Divide the dataset into segments and create a Markov-chain (graph, states, transitions) for each segment
        // 2. merge the markov-chains for the segments into a sigle one
        // 3. calculate the transition-probabilities for each source-state.
        //STEP 1
        await segment({dataset, file});
        if(dataset.status == 'segmentingError'){
            return;
        }
        // STEP 2
        dataset.status = 'merging';
        await dataset.save();
        const {finalGraphId, finalStateIds} = await merge({dataset});
        if(dataset.status == 'mergingError'){
            return;
        }
        // STEP 3
        dataset.status = 'probability';
        await dataset.save();
        await calcProbability({
            dataset,
            stateIds: finalStateIds
        })
        if(dataset.status == 'probabilityError'){
            return;
        }
        dataset.status = 'done';
        await dataset.save();
    } catch(e) {
        console.log(e);
        dataset.status = 'error';
        await dataset.save();
    }
}

module.exports = trainAsync;