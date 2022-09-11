const bodyParser = require("body-parser");
const router = require('express').Router();
const DiscordUser = require('../models/DiscordUser');

function isAuthorized(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/', isAuthorized, (req, res) => {
   res.render('profile', {
       user: req.user
   });
});

router.get('/settings', isAuthorized, (req, res) => {
    res.render('settings', {
        user: req.user
    });
});

router.post('/settings', bodyParser.urlencoded({ extended: true }), isAuthorized, async (req, res) => {
    const user = await DiscordUser.findOne({ discordId: req.user.discordId });
    if (user) {
        user.updateOne({ nickname: req.body.nickname }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    res.redirect(req.get('referer'));
});

module.exports = router;