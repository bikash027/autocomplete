const { QueryTypes, Op } = require("sequelize");
const { Graph, State, Transition, sequelize } = require("../db/db");

const merge = async ({dataset}) => {
    try {
        const segmentGraphs = await Graph.findAll({
            where: {datasetId: dataset.id}
        })
        const finalGraphId = segmentGraphs[0].id;
        const finalStates = await State.findAll({
            where: {graphId: finalGraphId}
        })
        const finalStateMap = new Map();
        for(const state of finalStates){
            finalStateMap.set(state.state, state.id);
        }
        if(segmentGraphs.length == 1){
            return {
                finalGraphId,
                finalStateIds: finalStates.map(state => state.id)
            };
        }
        for(let i=1; i<segmentGraphs.length; i++){
            const statesInSegment = await State.findAll({
                where: {graphId: segmentGraphs[i].id}
            })
            const statesInSegmentMap = new Map();
            for(const state of statesInSegment){
                statesInSegmentMap.set(state.id, state.state);
            }
            const transitions = await Transition.findAll({
                where: {sourceStateId: statesInSegment.map(state => state.id)}
            })
            const updatedTransitions = [];
            const updatedStateIds = [];
            for(const transition of transitions){
                const {sourceStateId, destStateId, count} = transition;
                const sourceState = statesInSegmentMap.get(sourceStateId);
                const finalSourceStateId = finalStateMap.get(sourceState);
                const destState = statesInSegmentMap.get(destStateId);
                const finalDestStateId = finalStateMap.get(destState);
                if(!finalSourceStateId){
                    await State.update(
                        {graphId: finalGraphId},
                        {
                            where: {id: sourceStateId}
                        }
                    );
                    finalStateMap.set(sourceState, sourceStateId);
                    updatedStateIds.push(sourceStateId)
                }
                if(!finalDestStateId){
                    await State.update(
                        {graphId: finalGraphId},
                        {
                            where: {id: destStateId}
                        }
                    );
                    finalStateMap.set(destState, destStateId);
                    updatedStateIds.push(destStateId)
                }
                if(!finalSourceStateId || !finalDestStateId){
                    transition.sourceStateId = finalSourceStateId?? transition.sourceStateId;
                    transition.destStateId = finalDestStateId?? transition.destStateId;
                    await transition.save();
                    updatedTransitions.push(transition);
                } else {
                    const transitionInFinalGraph = await Transition.findOne({
                        where: {
                            sourceStateId: finalSourceStateId,
                            destStateId: finalDestStateId
                        }
                    })
                    if(transitionInFinalGraph){
                        transitionInFinalGraph.count += count;
                        await transitionInFinalGraph.save();
                    } else {
                        await Transition.create({
                            sourceStateId: finalSourceStateId,
                            destStateId: finalDestStateId,
                            count
                        })
                    }
                }
            }
            const stateIdsToDelete = statesInSegment.map(el => el.id).filter(id => !updatedStateIds.includes(id));
            // const transitionsToDelete = transitions.filter(transition => !updatedTransitions.includes(transition));
            await Transition.destroy({
                where: {
                    [Op.or]: {
                        sourceStateId: {[Op.in]: stateIdsToDelete},
                        destStateId: {[Op.in]: stateIdsToDelete}
                    }
                }
            })
            await State.destroy({
                where: {id: stateIdsToDelete}
            })
            await Graph.destroy({
                where: {id: segmentGraphs[i].id}
            })
        }
        const finalStateIds = [];
        for(const value of finalStateMap.values()){
            finalStateIds.push(value);
        }
        return {
            finalGraphId,
            finalStateIds
        };
    } catch (e) {
        console.log(e);
        dataset.status = 'mergingError';
        await dataset.save();
        return{
            finalGraphId: 0,
            finalStateIds: []
        }
    }
}

module.exports = merge;