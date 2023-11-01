const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(setData =>{
                let set = setData;
                let theme = themeData.find(eleData => eleData.id === setData.theme_id)
                set.theme = theme.name;
                sets.push(set);
            })
            resolve();
        }
        catch (error) {
            reject(error);
        }
    });
}

function getAllSets() {
    return new Promise((resolve) => {
        resolve(sets);
    });
}

function getSetByNum(setNum) {
    let found = sets.find(set => set.set_num === setNum);
    return new Promise((resolve, reject) => {
        if(typeof(found) !== 'undefined') resolve(found);
        else reject(`No match on requested set number: "${setNum}"`);
    });
}

function getSetsByTheme(theme) {
    let foundSets = sets.filter(set => set.theme.toLowerCase() === theme.toLowerCase());
    return new Promise((resolve, reject) => {
        if(foundSets.length !== 0) resolve(foundSets);
        else reject(`No match on requested theme: "${theme}"`);
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };