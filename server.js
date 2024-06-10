/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: David Wulue Tang Student ID: 150276228 Date: November 28, 2023
*
* Published URL: https://charming-plum-scarf.cyclic.app/
*
********************************************************************************/
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');
const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

async function load() {

    legoData.initialize()
    .then(authData.initialize)
    .then(function(){
        app.listen(HTTP_PORT, function(){
            console.log(`app listening on:  ${HTTP_PORT}`);
        });
    }).catch(function(err){
        console.log(`unable to start server: ${err}`);
    });

    
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    
    app.use(express.static('public'));

    app.use(express.urlencoded({ extended: true }));

    app.use(
        clientSessions({
          cookieName: 'session',
          secret: 'o6LjQ5EadfKJSVNC28ZgK64hadKSfadfDELM18ScpFQr',
          duration: 5 * 60 * 1000,
          activeDuration: 1000 * 60 * 3,
        })
    );

    app.use((req, res, next) => {
        res.locals.session = req.session;
        next();
    });
    
    function ensureLogin(req, res, next) {
        if (!req.session.user) {
          res.redirect('/login');
        } else {
          next();
        }
    }

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

    app.get('/lego/addSet', ensureLogin, async (req, res) => {
        try {
            let themeData = await legoData.getAllThemes();
            res.render("addSet", { themes: themeData });
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.post('/lego/addSet', ensureLogin, async (req, res) => {
        let setData = req.body;
        try {
            await legoData.addSet(setData);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
        try {
            let setData = await legoData.getSetByNum(req.params.num);
            let themeData = await legoData.getAllThemes();
            res.render("editSet", { themes: themeData, set: setData });
        } catch (error) {
            res.status(404).render('404', {message: error});
        }
    });

    app.post('/lego/editSet', ensureLogin, async (req, res) => {
        try {
            await legoData.editSet(req.body.set_num, req.body);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.get('/lego/deleteSet/:num', ensureLogin, async (req, res) => {
        try {
            await legoData.deleteSet(req.params.num);
            res.redirect('/lego/sets');
        } catch (error) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}`});
        }
    });

    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.get('/register', (req, res) => {
        res.render('register');
    });

    app.post('/register', async (req, res) => {
        try {
            await authData.registerUser(req.body);
            res.render('register', { successMessage: "User created" });
        } catch (err) {
            res.render('register', { errorMessage: err, userName: req.body.userName });
        }
    });

    app.post('/login', async (req, res) => {
        req.body.userAgent = req.get('User-Agent');

        try {
            let user = await authData.checkUser(req.body);
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/lego/sets');
        } catch (err) {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        }
    });

    app.get('/logout', (req, res) => {
        req.session.reset();
        res.redirect('/');
    });

    app.get('/userHistory', ensureLogin, (req, res) => {
        res.render('userHistory');
    });

    app.use((req, res, next) => {
        res.status(404).render('404', {message: "I'm sorry, we're unable to find what you're looking for."});
    });
    
}

load();
