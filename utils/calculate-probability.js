const { QueryTypes } = require("sequelize");
const { State, Transition, sequelize } = require("../db/db");

const calcProbability = async ({dataset, stateIds}) => {
    try{
        for(const stateId of stateIds){
            const transitionData = await Transition.findOne({
                where: {sourceStateId: stateId},
                attributes: [
                    'sourceStateId',
                    [sequelize.fn('SUM', sequelize.col('count')), 'total']
                ]
            })
            let {total} = transitionData.toJSON();
            total = total? parseFloat(total): 0;
            if(total == 0){
                continue;
            }
            const [results, metadata] = await sequelize.query(
                `
                    UPDATE transitions SET
                    probability = CAST(count as FLOAT)/CAST((:total) as FLOAT)
                    WHERE sourceStateId = :stateId
                `,
                {
                    replacements: {
                        total,
                        stateId
                    }
                }
            )
        }
    } catch(e) {
        console.log(e);
        dataset.status = 'probabilityError';
        await dataset.save();
    }
}

module.exports = calcProbability;