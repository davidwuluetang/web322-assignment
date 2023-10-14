/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: David Wulue Tang Student ID: 150276228 Date: October 15, 2023
*
* Published URL: https://charming-plum-scarf.cyclic.app
*
********************************************************************************/
const legoData = require('./modules/legoSets')
const express = require('express');
const app = express();
const path = require('path');
const HTTP_PORT = process.env.PORT || 3000;

async function load() {
    try {
        await legoData.initialize();
    } catch (error) {
        console.log(error);
    }

    let sets = await legoData.getAllSets();
    
    app.use(express.static('public'));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/views/home.html'));
    });
    
    app.get('/about', (req, res) => {
        res.sendFile(path.join(__dirname, '/views/about.html'));
    });

    
    app.get('/lego/sets', async (req, res) => {
        let theme = req.query.theme;
        if (typeof(theme) !== 'undefined') {
            try {
                let result = await legoData.getSetsByTheme(theme);
                res.send(result);
            } catch (error) {
                res.status(404).send(error);
            }
        }
        else
            res.send(sets);
    });
    
    app.get('/lego/sets/:set_num', async (req, res) => {
        try {
            let result = await legoData.getSetByNum(req.params.set_num);
            res.send(result);
        } catch (error) {
            res.status(404).send(error);
        }
    });

    app.use((req, res, next) => {
        res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
    });
    
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}

load();
