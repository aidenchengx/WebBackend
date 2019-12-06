var cookieKey = 'sid'
const express = require('express')
const dbuser = require('./dbuser.js')
const md5 = require('md5')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

//const passport2 = require('passport')
//const FacebookStrategy2 = require('passport-facebook').Strategy

var User = require('./model.js').User
var Profile = require('./model.js').Profile
var Article = require('./model.js').Article
var pepper = md5("thisismypepper")
var mySecretMessage = md5("thisismysecretmessage")
console.log(process.env.REDIS_URL)
var clienturl = process.env.REDIS_URL || 'redis://h:p2e5f55a5d1cb9a7fdb185d43e5b0d4857be2dea28beff3adea511405dd0e7d4c@ec2-18-214-19-152.compute-1.amazonaws.com:23649'
const redis = require('redis').createClient(clienturl)

FacebookStrategy.prototype.authorizationParams = function(options){
	var params = {};
	params.auth_type = "reauthenticate"
	return params
}

passport.use('FBlogin',new FacebookStrategy({
  clientID: '1471631546324166',
  clientSecret: '18e4892ac296db120a8810c4aaa33982',
  callbackURL: 'https://xc28hw7.herokuapp.com/auth/facebook/callback',
  profileFields: ["email", "name"],
  authType: 'reauthenticate',
},function(accessToken,refreshToken,profile,done){
	const {email,first_name,last_name} = profile._json
	console.log('try to log in')
	console.log({email,first_name,last_name})
  	User.findOne({username: first_name},function(err,user){
    	if(err){
    		console.log('error')
    		return done(err);}
    	else{
    		if(user==null){
    			console.log('no such linked user')
    			var salt = Math.random().toString(36).substring(8);//8bits salt
       				var hash = md5(pepper+salt+Math.random().toString(36).substring(9))
       				User({username:first_name,salt:salt,hash:hash,isThirdParty:"facebook"}).save();
       				Profile({ username:first_name,status:"placeholderheadline",avatar:"uploads\\avatar\\placeholder.png",following:[]}).save();
      				Article.countDocuments({}, function( err, count){
  					for(var i=0;i<5;i++)
  					{	var newarticle = {}
    	   				var image = null
    	   				var text = "hardcoded text"
    	   				var author = first_name
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
            		var user2 = {"username":first_name}
    			done(null,user2);
    		})
      			}
    
    					/*console.log('no such user,register a new one')
    				
            		done(null,user)
    			})*/			
    			else
 					{done(null,user);}
       			}
    		
    		}
	)}))


passport.serializeUser(function(user,done){
	
	done(null, user)
})

passport.deserializeUser(function(user,done){
	
	done(null ,user)
})

function FBlogin(req,res){
	console.log('FBlogin')
	console.log(req.user)
	var code = generateCode({username:req.user.username})
	res.cookie(cookieKey,code,{maxAge:3600*1000,httpOnly:true})
	redis.hmset('sessionUser',code,req.user.username)
	res.redirect('http://xc28hw7.surge.sh/#/main')
}

passport.use('FBlink',new FacebookStrategy({
  clientID: '1471631546324166',
  clientSecret: '18e4892ac296db120a8810c4aaa33982',
  callbackURL: 'https://xc28hw7.herokuapp.com/auth/facebook2/callback',
  profileFields: ["email", "name"],
  authType: 'reauthenticate',
},function(accessToken,refreshToken,profile,done){
	const {email,first_name,last_name} = profile._json
	console.log('try to link account ')
	console.log({email,first_name,last_name})

  	User.findOne({username: first_name},function(err,user){
    	if(err){
    		console.log('error')
    		return done(err);}
    	else{
    		if(user==null){
    			console.log('no such user')
    			var user2 = {"username":first_name}
    			done(null,user2)
    		}
    		else
    			{done(null,user)
    			
    			}
    		}
})}))


function FBlogin2(req,res){
	console.log('FBlogin2')
	//console.log('id'+req.id)
	redis.hget('Lastuser','last',function(err,obj){
	var username = obj
	var code = generateCode({username:username})
	res.cookie(cookieKey,code,{maxAge:3600*1000,httpOnly:true})
	redis.hmset('sessionUser',code,username)	
	User.findOne({username:username}).exec(function(err,user) 
            		{var ofollowing = user["following"]
            			if (ofollowing==null)
            				ofollowing = []
            			User.findOne({username:req.user.username}).exec(function(err,user){
            			var pfollowing = []
            			if (user==null || user["following"]==null)
            				pfollowing = []
            			else
            				pfollowing = user["following"]
            			var newfollowing = ofollowing.concat(pfollowing)
            		User.updateOne({username:username},{"link.facebook" : req.user.username,following:newfollowing }).exec(function(err, users){
                    User.deleteOne({username:req.user.username}).exec(function(err){
                    		//res.redirect()
                    		Profile.deleteOne({username:req.user.username}).exec(function(err){
                    		res.redirect('http://xc28hw7.surge.sh/#/profile');})
                    })
                })

                }) 

	})
	//res.send({"result":"success","username":req.user.username,"ousername":username});
})
}

function Putlastuser(req,res,next){
	console.log("????")
	console.log(req.username)
	redis.hmset('Lastuser','last',req.username)
	next();
}

function isLoggedIn(req,res,next){
	var sid = req.cookies[cookieKey]
    console.log(req.cookies)
	if(!sid){
		return res.sendStatus(401)
	}
	redis.hget('sessionUser',sid,function(err,obj){
		var username = obj
		if(username){
		req.username=username
		console.log(obj)
		next()
		}
	else{
		res.sendStatus(401)
	}
	})
}

function GetMerge(req,res){
	var username = req.username
	User.find({ username: username}).exec(function(err, users) {
		if (users.length ==0 || users[0]["link"] == null || ((users[0]["link"]["facebook"] == null || users[0]["link"]["facebook"] == "" ) && (users[0]["link"]["rice"] == null || users[0]["link"]["rice"] == "" )))
			{	console.log('bbbb')
				res.send({"result":"None"})}
	 	else
	 		{	console.log(users[0])
	 			console.log('aaaa')
	 			console.log(users[0]["link"]["facebook"])
	 		res.send({"result":"Have","account":users[0]["link"]})
	 	}
	})

}
function Mergeaccountwithlocal(req,res){
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
    else{
            userObj=users[0]
            if(userObj["link"]["rice"]!=null && userObj["link"]["rice"]!="")
            	{	console.log('link rice fail')	
            		res.sendStatus(401)
            		return
            	}
            var salt=userObj["salt"]
            var db_hash = userObj["hash"]
            var hash = md5(pepper+salt+password)
            if(hash!=db_hash){
            	console.log('incorrect pwd')
                res.sendStatus(401)
                return
            }
            else{
            	User.findOne({username:username}).exec(function(err,user) 
            		{var ofollowing = user["following"]
            			if (ofollowing==null)
            				ofollowing = []
            			User.findOne({username:req.username}).exec(function(err,user){
            			var pfollowing = user["following"]
            			var newfollowing = ofollowing.concat(pfollowing)
            		User.updateOne({username:req.username},{"link.rice" : username,following:newfollowing }).exec(function(err, users){
                    User.deleteOne({username:username}).exec(function(err){
                    	Profile.deleteOne({username:username}).exec(function(err){res.send({"username":req.username})})
                   		
                    }) 
                })
			})

            		}
            	)
            }
        }
    })
}

function MergeaccountwithThirdParty(req,res){
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
    else{
            userObj=users[0]
            if(userObj["link"]["facebook"]!=null && userObj["link"]["facebook"]!="")
            	{res.sendStatus(401)
            		return
            	}
            var salt=userObj["salt"]
            var db_hash = userObj["hash"]
            var hash = md5(pepper+salt+password)
            if(hash!=db_hash){
                res.sendStatus(401)
                return
            }
            else{
            	User.findOne({username:username}).exec(function(err,user) 
            		{var ofollowing = user["following"]
            			if (ofollowing==null)
            				ofollowing = []
            			User.findOne({username:req.username}).exec(function(err,user){
            			var pfollowing = user["following"]
            			var newfollowing = ofollowing.concat(pfollowing)
            		User.updateOne({username:username},{"link.facebook" : req.username,following:newfollowing }).exec(function(err, users){
                    User.deleteOne({username:req.username}).exec(function(err){
                   		res.send({"username":username})
                    }) 
                })
			})

            		}
            	)
            }
        }
    })
}




function UnMerge(req,res){
	var username = req.username
	User.updateOne({username:username},{link :{}}).exec(function(err, users){
                   })
	res.send({"account":{}})
}

function GetThirdParty(req,res){
	User.findOne({username:req.username}).exec(function(err,user){
		if (user["isThirdParty"]!=null && user["isThirdParty"]!="")
			res.send({"result":"true"})
		else
			res.send({"result":"false"})

	})

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
       Profile({ username:username, email:email, dob:dob, zipcode:zipcode,status:"placeholderheadline",avatar:"https://res.cloudinary.com/hctu5fc4g/image/upload/v1575050876/om7pivkfz4gxoo9dx67p.png",following:[]}).save();
      Article.countDocuments({}, function( err, count){
  		for(var i=0;i<5;i++)
  			{	var newarticle = {}
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

	        res.sendStatus(401)
	        return
	    }
	var code = generateCode(userObj)
	res.cookie(cookieKey,code,{maxAge:3600*1000,httpOnly:true})
	redis.hmset('sessionUser',code,username)
	var msg = {username:username, result: 'success'}
	res.send(msg)
	}
})
}
function Logout(req,res){
    var sid = req.cookies[cookieKey]
        //res.send(sid)
    //var username = sessionUser[sid] //not defined yet?? in-memory
    //delete sessionUser[sid]
    redis.hdel('sessionUser',sid,function(err,obj){
    	    console.log('logging out')
    		res.sendStatus(200)
	})

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
exports.FBpassport = passport;
//exports.FBpassport2 = passport2;
exports.FBlogin = FBlogin;
exports.FBlogin2 = FBlogin2;
exports.Merge = Mergeaccountwithlocal;
exports.UnMerge =UnMerge
exports.GetMerge = GetMerge
exports.GetThirdParty = GetThirdParty
exports.Putlastuser = Putlastuser