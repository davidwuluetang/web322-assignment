require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectModule: pg,
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define('Theme',
{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
            autoIncrement: true,
        },
        name: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

const Set = sequelize.define('Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

let sets = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            sequelize.sync();
            resolve();
        }
        catch (error) {
            reject(error);
        }
    });
}

function getAllSets() {
    return new Promise((resolve) => {
        sets = Set.findAll({include: [Theme]});
        resolve(sets);
    });
}

async function getSetByNum(setNum) {
    let found = await Set.findAll({
        include: [Theme],
        where: { set_num: setNum }
    });
    return new Promise((resolve, reject) => {
        if(found.length !== 0) resolve(found[0]);
        else reject(`No match on requested set number: "${setNum}"`);
    });
}

async function getSetsByTheme(theme) {
    let foundSets = await Set.findAll({
        include: [Theme],
        where: { 
        '$Theme.name$':
        { [Sequelize.Op.iLike]: `%${theme}%` }
    }});

    return new Promise((resolve, reject) => {
        if(foundSets.length !== 0) resolve(foundSets);
        else reject(`No match on requested theme: "${theme}"`);
    });
}

function addSet(setData) {
    return new Promise((resolve, reject) => {
        Set.create({
            set_num: setData.set_num,
            name: setData.name,
            year: setData.year,
            num_parts: setData.num_parts,
            theme_id: setData.theme_id,
            img_url: setData.img_url,
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err.errors[0].message);
        });
    });
}

function getAllThemes() {
    return new Promise((resolve) => {
        let themes = Theme.findAll();
        resolve(themes);
    });
}

function editSet(set_num, setData) {
    return new Promise((resolve, reject) => {
        Set.update(
            {
                name: setData.name,
                year: setData.year,
                num_parts: setData.num_parts,
                theme_id: setData.theme_id,
                img_url: setData.img_url,
            },
            {
                where: { set_num: set_num },
            }
        ).then(() => {
            resolve();
        }).catch((err) => {
            reject(err.errors[0].message);
        });
    });
}

function deleteSet(setNum) {
    return new Promise((resolve, reject) => {
        Set.destroy({
            where: { set_num: setNum },
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err.errors[0].message);
        });
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
