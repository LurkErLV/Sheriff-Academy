const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discriminator: { type: String, required: true },
    discordId: { type: String, required: true },
    nickname: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, required: false },
    phone: { type: String, required: true },
    level: { type: Number, required: true },
    rank: { type: String, required: true },
    position: { type: String, required: true }
});

const DiscordUser = module.exports = mongoose.model('User', UserSchema);