const router = require('express').Router();
const MongoClient = require('mongodb').MongoClient;

router.get('/', (req, res) => {
    MongoClient.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', async (err, client) => {
        if (err) throw err;
        const db = client.db('users');

        const curator_sa = await db.collection('users').find({ position: "Curator SA" }).toArray();
        const head_sa = await db.collection('users').find({ position: "Head SA" }).toArray();
        const d_head_sa = await db.collection('users').find({ position: "D.Head SA" }).toArray();
        const instructor_sa = await db.collection('users').find({ position: "Instructor SA" }).toArray();

        const sa = curator_sa.concat(head_sa).concat(d_head_sa).concat(instructor_sa);

        res.render('instructors', {
            user: req.user,
            sa: sa
        });
    });
});

module.exports = router;