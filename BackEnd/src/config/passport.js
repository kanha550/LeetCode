const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'DUMMY_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_SECRET',
    callbackURL: "http://localhost:550/user/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { emailId: profile.emails[0].value }
        ]
      });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          firstName: profile.name.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
          emailId: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
        });
      } else if (!user.googleId) {
        // Link google ID if user exists with same email
        user.googleId = profile.id;
        if (!user.profilePicture) user.profilePicture = profile.photos[0].value;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'DUMMY_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'DUMMY_SECRET',
    callbackURL: "http://localhost:550/user/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
      let user = await User.findOne({ 
        $or: [
          { githubId: profile.id },
          { emailId: email }
        ]
      });

      if (!user) {
        user = await User.create({
          githubId: profile.id,
          firstName: profile.displayName || profile.username,
          emailId: email,
          profilePicture: profile.photos[0].value,
        });
      } else if (!user.githubId) {
        user.githubId = profile.id;
        if (!user.profilePicture) user.profilePicture = profile.photos[0].value;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
