var cookieKey = 'sid'
const express = require('express')
const dbuser = require('./dbuser.js')
const md5 = require('md5')
sessionUser = {}
var User = require('./model.js').User
var Profile = require('./model.js').Profile
var Article = require('./model.js').Article
var pepper = md5("thisismypepper")
var mySecretMessage = md5("thisismysecretmessage")


function isLoggedIn(req,res,next){
	var sid = req.cookies[cookieKey]
    console.log(req.cookies)
	if(!sid){
		return res.sendStatus(401)
	}
	var username = sessionUser[sid] //not defined yet?? in-memory
	//console.log(username)
	if(username){
		req.username=username
		//res.sendStatus(200)
		next()
	}
	else{
		res.sendStatus(401)
	}
}

function Register(req,res){
    var username = req.body.username;
    var password = req.body.password;
    console.log('register')
    User.find({ username: username}).exec(function(err, user) {
    console.log(user)
    if (user.length!=0){
        console.log('already exist')
        res.status(400).send('username already taken')
        return    }
    else{
       var salt = Math.random().toString(36).substring(8);//8bits salt
       var hash = md5(pepper+salt+password)
       User({username:username,salt:salt,hash:hash}).save();
       var email = req.body.email;
       var dob = req.body.dob;
       var zipcode = req.body.zipcode;
       if(!email||!dob||!zipcode){
            res.sendStatus(400)
       }
       else{
       Profile({ username:username, email:email, dob:dob, zipcode:zipcode,status:"placeholderheadline",avatar:"uploads\\avatar\\placeholder.png",following:[]}).save();
      Article.countDocuments({}, function( err, count){
  		for(var i=0;i<5;i++)
  		
  			{var newarticle = {}
    	   var image = null
    	   var text = "hardcoded text"
    	   var author = username
   		 		
    			var D = new Date();
    			var d1=D.toLocaleDateString('en-US');
    			var d2=D.toLocaleTimeString('en-US');
    			var d=d1+' '+d2;
    			var newarticle ={id: count+i,
                    author: author,
                    body: text,
                    date: d,
                    picture: image,
                    comments: []}
          Article(newarticle).save()
            }
    	})
    	     	





       	var msg = {result: 'success',username:username}

       	res.send(msg)

       }
    }
})
}
function Current(req,res){
	var Item = {username:req.username}
	res.send(Item)
	

}
function Login(req,res){
	var username = req.body.username;
	var password = req.body.password;
	if(!username || !password){
		res.sendStatus(400)
		return 
	}
	User.find({ username: username}).exec(function(err, users) {
	console.log(users)
	if(users.length==0){
	    console.log('user not registered')
		res.sendStatus(401)
		return
	}
	else{userObj=users[0]
	    var salt=userObj["salt"]
	    var db_hash = userObj["hash"]
	    var hash = md5(pepper+salt+password)
	    if(hash!=db_hash){
	        console.log(pepper)
	        console.log(salt)
	        console.log(hash)
	        console.log('incorrect password')
	        res.sendStatus(401)
	        return
	    }
	var code = generateCode(userObj)
	res.cookie(cookieKey,code,{maxAge:3600*1000,httpOnly:true})
	//console.log(res.cookie)
	sessionUser[code]=username
	var msg = {username:username, result: 'success'}
	res.send(msg)
	}
})
}
function Logout(req,res){
    var sid = req.cookies[cookieKey]
        //res.send(sid)
    var username = sessionUser[sid] //not defined yet?? in-memory
    delete sessionUser[sid]
    console.log('logging out')
    res.sendStatus(200)
}

function Password(req,res){
    var username = req.username
    var password = req.body.password
    if((!username)||(!password)){
        console.log(username)
        console.log(password)
        res.sendStatus(401)
        console.log('empty input')
        return
    }
    var salt = Math.random().toString(36).substring(8);//8bits salt
    var hash = md5(pepper+salt+password)
    User.updateOne({username:username},{salt:salt,hash:hash}).exec(function(err, users){
    console.log('password update')
    var item = { username: username, result: 'success' }
    res.send(item)})
}

function getUser(username){
	let dummyusers = [{"username":'aa',"password":'aaa'},
						{"username":'bb',"password":'bbb'}]
	for(i=0;i<dummyusers.length;i++){
		if (dummyusers[i]["username"] == username)
			return dummyusers[i]
	}
	return
}

function generateCode(obj){
    return md5(mySecretMessage + new Date().getTime() + obj.username)
}
const app = express()
exports.isLoggedIn = isLoggedIn;
exports.Login = Login;
exports.Register = Register;
exports.Logout = Logout;
exports.Password = Password;
exports.Current = Current

