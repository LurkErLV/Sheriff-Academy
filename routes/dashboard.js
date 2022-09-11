const bodyParser = require("body-parser");
const router = require('express').Router();
const MongoClient = require('mongodb').MongoClient;
const DiscordUser = require('../models/DiscordUser');

function isAuthorized(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

const ranks = {
    1: "Кадет ПА",
    2: "Офицер",
    3: "Сержант",
    4: "Лейтенант",
    5: "Капитан",
    6: "Коммандер",
    7: "Зам. Шерифа",
    8: "Шериф"
};

function checkRank(req, user) {
    if (req.body.rank > 7 && req.body.rank < 1) {
        return false;
    }

    const rank = Object.keys(ranks).find(key => ranks[key] === req.user.rank);
    const userRank = Object.keys(ranks).find(key => ranks[key] === user.rank);
    if (rank <= req.body.rank) {
        return false;
    } else {
        if (rank > userRank) {
            return true;
        } else {
            return false;
        }
    }
}

async function validatePost(req) {
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;

        const db = client.db('users');

        if (req.user.discordId === req.body.id) {
            return false;
        }

        const target = await DiscordUser.findOne({ discordId: req.body.id });

        if (target) {
            if (req.body.accessLevel) {
                if (req.user.level > req.body.accessLevel) {
                    target.updateOne({ level: req.body.accessLevel }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }

            if (req.body.rank) {
                if (checkRank(req, target)) {
                    target.updateOne({ rank: ranks[req.body.rank] }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        }
    });
}

router.get('/', isAuthorized, (req, res) => {
    if (req.user.level < 4) return res.redirect('/');
    res.render('dashboard', {
        user: req.user
    });
});

router.get('/users', isAuthorized, (req, res) => {
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;
        const db = client.db('users');

    res.render('users', {
            user: req.user,
            users: await db.collection('users').find().toArray()
        });
    });
});

router.post('/users', bodyParser.urlencoded({ extended: true }), isAuthorized, async (req, res) => {
    await validatePost(req);
    setTimeout(function(){
        res.redirect(req.get('referer'));
    }, 200);
});

module.exports = router;