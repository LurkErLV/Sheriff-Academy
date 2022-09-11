const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('divisions', {
        user: req.user
    });
});

module.exports = router;