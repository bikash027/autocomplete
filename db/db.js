const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/database.sqlite',
    logging: false
});

const Dataset = sequelize.define(
    'dataset',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('segmenting', 'segmentingError',
                'merging', 'mergingError',
                'probability', 'probabilityError',
                'done', 'error'),
            defaultValue: 'segmenting'
        }
    },
    {

    }
)

const Graph = sequelize.define(
    'graph',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        segment: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
      // Other model options go here
    },
);
Dataset.hasMany(Graph, {
    onDelete: 'SET NULL'
});
Graph.belongsTo(Dataset);


const State = sequelize.define(
    'state', // word, pair of words, triplet of words
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
      timestamps: false
    },
);

Graph.hasMany(State, {
    onDelete: 'SET NULL'
});
State.belongsTo(Graph);

const Transition = sequelize.define(
    'transition', // transition-probabilities table
    {
        sourceStateId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'compositeIndex',
            references: {
                model: State,
                key: 'id',
            }
        },
        destStateId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'compositeIndex',
            references: {
                model: State,
                key: 'id'
            }
        },
        probability: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
      timestamps: false
    },
);


// (async () => {
//     await sequelize.sync({ force: true });
//     // Code here
// })();

module.exports = {sequelize, Dataset, Graph, State, Transition};
