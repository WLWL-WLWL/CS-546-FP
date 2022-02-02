const express = require('express');
const { videogames, comments } = require('../data');
const router = express.Router();
const xss = require('xss');

router.get('/create', async (req, res) => {
    res.render('videogames/creategamePage.handlebars', { 
                                            userLoggedIn: req.session.user !== undefined,
                                            userId: req.session.user?.userId,
                                            isAdmin: req.session.user?.isAdmin});
});

router.get('/:id', async (req, res) => {
    const isLoggedIn = req.session !== undefined && req.session.user !== undefined; 

    const username = req.session && req.session.user && req.session.user.username ? req.session.user.username : 'No User';
   
    const userId = req.session && req.session.user?.userId ? req.session.user?.userId : undefined;

    if(!req.params || !req.params.id) {
        res.status(500).render('error/error.handlebars', {error: 'No video game id passed in',
                                                isAdmin: req.session.user?.isAdmin,
                                                userLoggedIn: isLoggedIn, 
                                                username: username,
                                                userId: userId});
        return;
    }

    // Make call from videogames.users to get user data with id
    try{
        const videogameData = await videogames.getGame(req.params.id);
        res.render('videogames/videogamesPage.handlebars', {videogameData: videogameData, 
                                                            isAdmin: req.session.user?.isAdmin,
                                                            userLoggedIn: isLoggedIn, 
                                                            username: username,
                                                            userId: userId});   // TODO: Remove hardcoded id and username
    } catch(e) {
        res.status(500).render('error/error.handlebars', {error: e.message,
                                                isAdmin: req.session.user?.isAdmin,
                                                userLoggedIn: isLoggedIn, 
                                                username: username,
                                                userId: userId});
    }


});

router.post('/:id', async(req, res) => {
    if(!req.params || !req.params.id) {
        res.status(400).json({error: 'No video game id passed in'});
        return;
    }

    if(!req.body) {
        res.status(400).json({error: 'No data in request body'});
        return;
    }

    if(!req.session.user) {
        res.status(400).json({error: 'Cannot post comment when not logged in'});
        return;
    }

    if(!req.body.reviewer) {
        res.status(400).json({error: 'Missing username'});
        return;
    }
    if(!req.body.title) {
        res.status(400).json({error: 'Missing title'});
        return;
    }
    if(!req.body.comment) {
        res.status(400).json({error: 'Missing comment'});
        return;
    }
    if(!req.body.date) {
        res.status(400).json({error: 'Missing date'});
        return;
    }

    try {
        const comment = await comments.create(req.params.id, xss(req.body.title), xss(req.body.reviewer), req.body.date, xss(req.body.comment));
        res.json(comment);
    } catch(e) {
        res.status(500).json({error: `${e}`});
        return;
    }
});

router.post('/:id/comment/:commentId', async(req, res) => {
    if(!req.params || !req.params.id || !req.params.commentId) {
        res.status(400).json({error: 'No video game id passed in'});
        return;
    }

    if(!req.body) {
        res.status(400).json({error: 'No data in request body'});
        return;
    }
    if(!req.body.like || !req.body.operation) {
        res.status(400).json({error: 'Missing like data in request body'});
        return;
    }

    try {
        if(req.body.operation === 'add') {
            const updateInfo = await comments.addLikeDislike(req.params.id, req.params.commentId, req.body.like);
            res.json(updateInfo);
        } else if (req.body.operation === 'remove') {
            const updateInfo = await comments.removeLikeDislike(req.params.id, req.params.commentId, req.body.like);
            res.json(updateInfo);
        } else {
            res.status(400).json({error: 'Operation is not either add or remove'});
            return;
        }
    } catch(e) {
        res.status(500).json({error: `${e}`});
        return;
    }
});

router.post('/', async (req, res) => {
    const { gameTitle, releaseDate, developer, genre, price, boxart } = req.body;

    // Do input validation
    function stringCheck(str) {
        return typeof str === 'string' && str.length > 0 && str.replace(/\s/g, "").length > 0;
    }
    const isLoggedIn = req.session !== undefined && req.session.user !== undefined; 

    try {
        if(!gameTitle || !releaseDate || !developer || !genre || !price || !boxart)
            throw new Error("Missing input");
        if(!stringCheck(gameTitle) || !stringCheck(releaseDate) || !stringCheck(developer) || !stringCheck(genre) || !stringCheck(price) || !stringCheck(boxart))
            throw new Error("All strings must contain non-whitespace characters");        
        if(typeof parseFloat(price) !== 'number' || parseFloat(price) < 0){
            throw new Error("Price must be a non-negative number");
        }
    } catch (e) {
        res.status(400).render('error/error.handlebars', 
            { 
                layout: null,
                error: e.message,
            });
        return;
    }

    // Try to add game to database
    try {
        const newGame = await videogames.create(xss(gameTitle), xss(releaseDate), xss(developer), xss(genre), xss(price), xss(boxart))

        if (!newGame) {
            res.status(400).render('error/error.handlebars', 
            {   
                layout: null,
                error: "Game was not successfully added",
            });
        } else {
            // If game is added send preview html
            res.render('videogames/videogamePreview.handlebars', 
            {   
                layout: null,
                videogameData: newGame,             
            });
        }
    } catch (e) {
        res.status(400).render('error/error.handlebars', 
        {   
            layout: null,
            error: e.message, 
        });
        return;
    }
});

module.exports = router;