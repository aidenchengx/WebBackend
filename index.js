const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const multiparty = require('multiparty');
//const passport = require('passport')

//const static = require('static')

const auth = require('./src/auth.js')
const isLoggedIn = auth.isLoggedIn
const Register = auth.Register
const Login = auth.Login
const Logout = auth.Logout
const Password = auth.Password
const Current = auth.Current
const FBlogin = auth.FBlogin
const FBlogin2 = auth.FBlogin2
const PutLastUser = auth.Putlastuser

const article = require('./src/articles.js')
const Newarticle = article.Newarticle
const Getarticles = article.Getarticles
const Putarticle = article.Putarticle

const profile = require('./src/profile.js')
const Putheadline = profile.Putheadline
const Getheadline = profile.Getheadline
const Putemail = profile.Putemail
const Getemail = profile.Getemail
const Putzipcode = profile.Putzipcode
const Getzipcode = profile.Getzipcode
const Putavatar = profile.Putavatar
const Getavatar = profile.Getavatar
const Getdob = profile.Getdob
const Merge = auth.Merge
const UnMerge = auth.UnMerge
const GetMerge = auth.GetMerge
const GetThirdParty = auth.GetThirdParty

const following = require('./src/following.js')
const Putfollowing = following.Putfollowing
const Getfollowing = following.Getfollowing
const Deletefollowing = following.Deletefollowing

const dbpost = require('./src/dbpost.js')

const cookieParser = require('cookie-parser')

const session = require('express-session')

const passport = require('./src/auth.js').FBpassport
//const passport2 = require('./src/auth.js').FBpassport2

process.env.REDIS_URL = 'redis://h:p2e5f55a5d1cb9a7fdb185d43e5b0d4857be2dea28beff3adea511405dd0e7d4c@ec2-18-214-19-152.compute-1.amazonaws.com:23649'
const redis = require('redis').createClient(process.env.REDIS_URL)

const hello = (req, res) => res.send({ hello: 'world' })

const md5 = require('md5')
var pepper = md5("thisismypepper")
var mySecretMessage = md5("thisismysecretmessage")


const app = express()
app.use(session({secret:'thisismysecretmessage'}))
app.use(passport.initialize());
app.use(passport.session())

app.use(bodyParser.json())
app.use(cookieParser())

var users = {}
var User = require('./src/model.js').User
var Profile = require('./src/model.js').Profile
var Article = require('./src/model.js').Article

/*cors options*/
var whitelist = ['http://localhost:4200', 'http://xc28hw6.surge.sh','http://xc28hw7.surge.sh']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error(origin+'Not allowed by CORS'))
    }
  	},
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials:true,
  methods:['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
}

function enableCors(req,res,next){
	res.header("Access-Control-Allow-Credentials",true)
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Origin",req.headers.origin)
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	next();
}

app.use(cors(corsOptions))
app.use(enableCors)
app.use(express.static('uploads'))

/*auth*/
app.get('/', hello)
app.post('/login',Login)
app.post('/register',Register)
app.put('/logout',isLoggedIn,Logout)
app.put('/password',isLoggedIn,Password)


app.get('/auth/facebook',passport.authenticate("FBlogin"));
app.get('/auth/facebook/callback',passport.authenticate("FBlogin",{successRedirect:'/FBsuccess',failureRedirect:'/login'}));
app.get('/auth/facebook2',isLoggedIn,PutLastUser,passport.authenticate("FBlink"));
app.get('/auth/facebook2/callback',passport.authenticate("FBlink",{successRedirect:'/FBsuccess2',failureRedirect:'/'}));

app.get('/FBsuccess',FBlogin)
app.get('/FBsuccess2',FBlogin2)
app.post('/merge', isLoggedIn,Merge)
app.put('/unmerge', isLoggedIn,UnMerge)
app.get('/getmerge', isLoggedIn,GetMerge)
app.get('/getthirdparty', isLoggedIn,GetThirdParty)

app.get('/current',isLoggedIn,Current)

/*article*/
app.post('/article',isLoggedIn,Newarticle)
//app.put('/articles',isLoggedIn,GETarticles);
app.get('/articles/:id?',isLoggedIn,Getarticles);
app.put('/articles/:id',isLoggedIn,Putarticle);



/*profile*/
app.get('/headline/:user?',isLoggedIn,Getheadline)
app.put('/headline',isLoggedIn,Putheadline)
app.get('/email/:user?',isLoggedIn,Getemail)
app.put('/email',isLoggedIn,Putemail)
app.get('/zipcode/:user?',isLoggedIn,Getzipcode)
app.put('/zipcode',isLoggedIn,Putzipcode)
app.get('/avatar/:user?',isLoggedIn,Getavatar)
app.put('/avatar',isLoggedIn,Putavatar)
app.get('/dob/:user?',isLoggedIn,Getdob)

/*following*/
app.get('/following/:user?',isLoggedIn,Getfollowing)
app.put('/following/:user',isLoggedIn,Putfollowing)
app.delete('/following/:user',isLoggedIn,Deletefollowing)

//app.get('/isloggedin',isLoggedIn)
//app.get('/find/user',find)


// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
