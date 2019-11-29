const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const multiparty = require('multiparty');
//const static = require('static')

const auth = require('./src/auth.js')
const isLoggedIn = auth.isLoggedIn
const Register = auth.Register
const Login = auth.Login
const Logout = auth.Logout
const Password = auth.Password
const Current = auth.Current

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

const following = require('./src/following.js')
const Putfollowing = following.Putfollowing
const Getfollowing = following.Getfollowing
const Deletefollowing = following.Deletefollowing

const dbpost = require('./src/dbpost.js')

const cookieParser = require('cookie-parser')

const hello = (req, res) => res.send({ hello: 'world' })

const app = express()

/*cors options*/
var whitelist = ['http://localhost:4200', 'http://xc28hw6.surge.sh']
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


app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.static('uploads'))
/*auth*/
app.get('/', hello)
app.post('/login',Login)
app.post('/register',Register)
app.put('/logout',isLoggedIn,Logout)
app.put('/password',isLoggedIn,Password)

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
