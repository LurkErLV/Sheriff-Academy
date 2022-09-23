const bodyParser = require("body-parser");
const router = require('express').Router();
const MongoClient = require('mongodb').MongoClient;
const DiscordUser = require('../models/DiscordUser');
const createAndSaveLog = require('../models/Logs');

function isAuthorized(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

const ranks = {
    1: "Гость",
    2: "Кадет ПА",
    3: "Офицер",
    4: "Сержант",
    5: "Лейтенант",
    6: "Капитан",
    7: "Коммандер",
    8: "Зам. Шерифа",
    9: "Шериф"
};

const positions = {
    1: "None",
    2: "Instructor SA",
    3: "High Instructor SA",
    4: "D.Head SA",
    5: "Head SA",
    6: "Curator SA",
};

function checkRank(req, user) {
    if (req.body.rank > 8 && req.body.rank < 1) {
        return false;
    }

    const rank = Object.keys(ranks).find(key => ranks[key] === req.user.rank);

    if (rank === 1) return false;

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

function checkPosition(req, user) {
    if (req.body.position > 6 && req.body.position < 1) {
        return false;
    }

    const position = Object.keys(positions).find(key => positions[key] === req.user.position);
    const userPosition = Object.keys(positions).find(key => positions[key] === user.position);
    if (position <= req.body.position) {
        return false;
    } else {
        if (position > userPosition) {
            return true;
        } else {
            return false;
        }
    }
}

async function validatePostUsers(req) {
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;

        if (req.user.discordId === req.body.id) {
            return false;
        }

        const target = await DiscordUser.findOne({ discordId: req.body.id });

        if (target) {
            if (req.body.accessLevel) {
                if (req.user.level > req.body.accessLevel) {
                    createAndSaveLog(req.user.discordId, req.body.id, `Поменял уровень доступа с ${target.level} до ${req.body.accessLevel}`);
                    target.updateOne({ level: req.body.accessLevel }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }

            if (req.body.rank) {
                if (checkRank(req, target)) {
                    createAndSaveLog(req.user.discordId, req.body.id, `Поменял звание с ${target.rank} до ${ranks[req.body.rank]}`);
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

async function validatePostPositions(req) {
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;

        if (req.user.discordId === req.body.id) {
            return false;
        }

        const target = await DiscordUser.findOne({ discordId: req.body.id });

        if (target) {
            if (req.body.position) {
                if (checkPosition(req, target)) {
                    createAndSaveLog(req.user.discordId, req.body.id, `Поменял должность с ${target.position} до ${positions[req.body.position]}`);
                    target.updateOne({ position: positions[req.body.position] }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        }
    });
}

// Dashboard

router.get('/', isAuthorized, (req, res) => {
    if (req.user.level < 3) return res.redirect('/');
    res.render('dashboard', {
        user: req.user
    });
});

// Users

router.get('/users', isAuthorized, (req, res) => {
    if (req.user.level < 3) return res.redirect('/');
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
    await validatePostUsers(req);
    setTimeout(function(){
        res.redirect(req.get('referer'));
    }, 200);
});

// Positions

router.get('/positions', isAuthorized, (req, res) => {
    if (req.user.level < 3) return res.redirect('/');
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;
        const db = client.db('users');

        res.render('positions', {
            user: req.user,
            users: await db.collection('users').find().toArray()
        });
    });
});

router.post('/positions', bodyParser.urlencoded({ extended: true }), isAuthorized, async (req, res) => {
    await validatePostPositions(req);
    setTimeout(function(){
        res.redirect(req.get('referer'));
    }, 200);
});

// Logs

router.get('/logs', isAuthorized, (req, res) => {
    if (req.user.level < 4) return res.redirect('/');
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;
        const db = client.db('users');

        res.render('logs', {
            user: req.user,
            users: await db.collection('users').find().toArray(),
            logs: (await db.collection('logs').find().toArray()).reverse()
        });
    });

});

module.exports = router;