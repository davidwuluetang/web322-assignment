/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: David Wulue Tang Student ID: 150276228 Date: November 17, 2023
*
* Published URL: https://charming-plum-scarf.cyclic.app/
*
********************************************************************************/
const legoData = require('./modules/legoSets')
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

async function load() {
    try {
        await legoData.initialize();
    } catch (error) {
        console.log(error);
    }
    
    app.set('view engine', 'ejs');
    
    app.use(express.static('public'));

    app.use(express.urlencoded({ extended: true }));

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
        else {
            let legoSets = await legoData.getAllSets();
            res.render('sets', {sets: legoSets});
        }
    });
    
    app.get('/lego/sets/:set_num', async (req, res) => {
        try {
            let result = await legoData.getSetByNum(req.params.set_num);
            res.render('set', {set: result});
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.get('/lego/addSet', async (req, res) => {
        try {
            let themeData = await legoData.getAllThemes();
            res.render("addSet", { themes: themeData });
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.post('/lego/addSet', async (req, res) => {
        let setData = req.body;
        try {
            await legoData.addSet(setData);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.get('/lego/editSet/:num', async (req, res) => {
        try {
            let setData = await legoData.getSetByNum(req.params.num);
            let themeData = await legoData.getAllThemes();
            res.render("editSet", { themes: themeData, set: setData });
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.post('/lego/editSet', async (req, res) => {
        try {
            await legoData.editSet(req.body.set_num, req.body);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.get('/lego/deleteSet/:num', async (req, res) => {
        try {
            await legoData.deleteSet(req.params.num);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.use((req, res, next) => {
        res.status(404).render('404', {message: "I'm sorry, we're unable to find what you're looking for."});
    });
    
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}

load();
