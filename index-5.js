const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
//const static = require('static')
var User = require('./src/model.js').User
passport.use(new FacebookStrategy({
  clientID: '1471631546324166',
  clientSecret: '18e4892ac296db120a8810c4aaa33982',
  callbackURL: '/auth/facebook/callback',

},function(accessToken,refreshToken,profile,done){
  User.find({username:profile.username},function(err,user){
    if(err){return done(err);}
    done(null,user)

  })
}
))
const app = express()

/*cors options*/
app.get('/auth/facebook',passport.authenticate('facebook'));
app.get('/auth/facebook/callback',passport.authenticate('facebook',{successRedirect:'/',failureRedirect:'/login'}));

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
