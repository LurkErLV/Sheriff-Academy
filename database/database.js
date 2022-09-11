const mongoose = require('mongoose');
module.exports = mongoose.connect('mongodb://lurker:gaisma@46.101.142.29:27020/users', { useNewUrlParser: true });