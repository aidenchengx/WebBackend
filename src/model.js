// this is model.js 
var mongoose = require('mongoose')
require('./db.js')

var commentSchema = new mongoose.Schema({
	commentId: Number, author: String, date: Date, text: String
})
/*var articleSchema = new mongoose.Schema({
	id: Number, author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})*/

var userSchema = new mongoose.Schema({
	username: String,
        salt: String,
        hash: String,
        link: {
                google:String,
                facebook:String,
                rice:String,
                },
        isThirdParty:String,
})
var profileSchema = new mongoose.Schema( {
    username: String,
    status: String,
    following: [ String ],
    email: String,
    dob: String,
    zipcode: String,
    avatar: String,

})
var articleSchema = new mongoose.Schema( {
    id: Number,
    author: String,
    body: String,
    date: Date,
    picture: String,
    comments: [{
        commentId: Number,
        author: String,
        body: String,
        date: Date
    }]
})

//exports.Article = mongoose.model('article', articleSchema)
exports.User = mongoose.model('user', userSchema)
exports.Profile = mongoose.model('profile', profileSchema)
exports.Article = mongoose.model('article',articleSchema)