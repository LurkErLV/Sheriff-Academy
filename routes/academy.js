const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('academy', {
        user: req.user
    });
});

module.exports = router;