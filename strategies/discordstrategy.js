const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const {clientId, clientSecret, clientRedirect} = require('../config.json');
const DiscordUser = require('../models/DiscordUser');

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser( async(id, done) => {
    const user = await DiscordUser.findById(id);
    if (user) done(null, user);
})

passport.use(new DiscordStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: clientRedirect,
    scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await DiscordUser.findOne({ discordId: profile.id });
        if (user) {
            done(null, user);
        } else {
            const newUser = await DiscordUser.create({
                discriminator: profile.discriminator,
                discordId: profile.id,
                nickname: "None",
                username: profile.username,
                avatar: profile.avatar,
                level: 0,
                rank: "Кадет ПА"
            });
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    } catch (err) {
        console.log(err);
        done(err, null);
    }
    }));