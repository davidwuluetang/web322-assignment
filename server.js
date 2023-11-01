/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: David Wulue Tang Student ID: 150276228 Date: November 1, 2023
*
* Published URL: https://concerned-pig-wetsuit.cyclic.app/
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

    let legoSets = await legoData.getAllSets();
    
    app.set('view engine', 'ejs');
    
    app.use(express.static('public'));

    app.get('/', (req, res) => {
        res.render('home');
    });
    
    app.get('/about', (req, res) => {
        res.render('about');
    });

    app.get('/lego/sets', async (req, res) => {
        let theme = req.query.theme;
        if (typeof(theme) !== 'undefined') {
            try {
                let result = await legoData.getSetsByTheme(theme);
                res.render('sets', {sets: result});
            } catch (error) {
                res.status(404).render('404', {message: error});
            }
        }
        else
            res.render('sets', {sets: legoSets});
    });
    
    app.get('/lego/sets/:set_num', async (req, res) => {
        try {
            let result = await legoData.getSetByNum(req.params.set_num);
            res.render('set', {sets: result});
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.use((req, res, next) => {
        res.status(404).render('404', {message: "I'm sorry, we're unable to find what you're looking for."});
    });
    
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}

load();
