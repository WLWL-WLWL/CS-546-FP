const express = require('express');
const data = require('../data');
const router = express.Router();
const videogames = data.videogames;
const usersData = data.users;
const xss = require('xss');


router.get('/', async(req, res) => {
    let userLoggedIn = false;
    let userId = req.session.user?.userId;
    if (!userId) {
        userLoggedIn = false;
    } else {
        userLoggedIn = true;
    }
    const videogameList = await videogames.getAllVideoGames();
    //console.log(videogameList);
    res.render('homepage/home', { videogames: videogameList, userLoggedIn: userLoggedIn, userId: userId, isAdmin: req.session.user?.isAdmin });
});

router.get('/login', async(req, res) => {
    console.log(req.session.user?.userId)
    if (req.session.user?.userId) {
        res.redirect('/'); // if log in, return to homapage 
    } else {
        res.render('homepage/login');
    }
});


router.get('/signup', async(req, res) => {
    if (req.session.user?.userId) {
        res.redirect('/'); // if log in, return to homapage 
    } else {
        res.render('homepage/signup');
    }
})

router.post('/signup', async(req, res) => {
    const { username, password, firstName, lastName } = req.body;
    if (!username) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: "Username must be provided!" });
    }
    if (!password) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: "Password must be provided!" });
    }
    if (!firstName) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: "First name must be provided!" });
    }

    if (!lastName) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: "Last name must be provided!" });
    }
    try {
        checkFirstName = usersData.checkFirstName(firstName);
    } catch (e) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: e });
    }
    try {
        checkLastName = usersData.checkLastName(lastName);
    } catch (e) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: e });
    }
    try {
        checkUserName = usersData.checkUserName(username);
    } catch (e) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: e });
    }

    try {
        checkPassword = usersData.checkPassword(password);
    } catch (e) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: e });
    }

    try {
        const checkDuplicateUsername = await usersData.checkDuplicateUsername(username);
        if (checkDuplicateUsername == "{UsernameDuplicate: true}"){
            res.status(400).render('homepage/signup', { status: 400, errorMessage: "Username already exists!"});
        }else{
            const createUser = await usersData.create(xss(firstName), xss(lastName), xss(username.toLowerCase()), xss(password)); //create function in data/users.js
            if (createUser) {
                res.redirect('/login');
            } else {
                res.status(500).json({ message: "Internal Server Error" });
            }
        }
        
    } catch (e) {
        res.status(400).render('homepage/signup', { status: 400, errorMessage: e });
    }
})




router.post('/login', async(req, res) => {
    const { username, password } = req.body;
    if (!username) {
        res.status(400).render('homepage/login', { status: 400, errorMessage: "Username must be provided!" });
    }
    if (!password) {
        res.status(400).render('homepage/login', { status: 400, errorMessage: "Password must be provided!" });
    }

    try {
        checkUserName = usersData.checkUserName(username);
    } catch (e) {
        res.status(400).render('homepage/login', { status: 400, errorMessage: e });
    }

    try {
        checkPassword = usersData.checkPassword(password);
    } catch (e) {
        res.status(400).render('homepage/login', { status: 400, errorMessage: e });
    }

    try {
        const checkUser = await usersData.checkUser(username, password);
        if (checkUser) {
            //get user ID 
            let userId = await usersData.getUserId(username.toLowerCase());
            req.session.user = {userId: userId};
            const user = await usersData.getUser(userId);
            req.session.user.username = user.username;
            if(user.isAdmin){
                req.session.user.isAdmin = true;
            }

            res.redirect('/'); //if login return to homepage
        }
    } catch (e) {
        res.status(400).render('homepage/login', { status: 400, errorMessage: e });
    }

});

router.get('/logout', async(req, res) => {
    req.session.destroy();
    res.render('homepage/login');

});

module.exports = router;