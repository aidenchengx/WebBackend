var cookieKey = 'sid'
const express = require('express')
const multiparty = require('multiparty')
const Profile = require('./model.js').Profile
const User = require('./model.js').User
const cloudinary = require('cloudinary')
const multer = require('multer')
const stream = require('stream')
cloudinary.config({
    cloud_name: 'hctu5fc4g',
    api_key: '937137325281613',
    api_secret: 'za0fvX6_qvEohlPWcLW7Jv2olK4'
})

function Getheadline(req,res){
    var username = req.params.user
    console.log(username)
    console.log("req"+req.username)
    if (username==""||!username){
        username=req.username
    }
    console.log(username)
    Profile.find({ username:username }).exec(function(err, users) {
                console.log(users)
                if(users.length == 0){
                    console.log("no found user"+username)
                    res.sendStatus(400)
                }
                else
                {   var user=users[0]
                    var Item = {"username":username,"headline":user.status}
                    res.send(Item)
                }
            })
}

function Putheadline(req,res){
    var username = req.username
    var status = req.body.headline
    Profile.updateOne({username:username},{status:status}).exec(function(err, users){
        console.log('headline update')
        var Item = {"username":username,"headline":status}
        res.send(Item)

    })
}


function Getemail(req,res){
    var username = req.params.user
    if (username==""||!username){

        username=req.username
    }
     Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){

                    res.sendStatus(400)
                }
                else
                {   var user=users[0]
                    var Item = {"username":username,"email":user.email}
                    res.send(Item)
                }
            })
}

function Putemail(req,res){
    var username = req.username
    var email = req.body.email
    Profile.updateOne({username:username},{email:email}).exec(function(err, users){
        console.log('email update')
        var Item = {"username":username,"email":email}
        res.send(Item)

    })
}

function Getzipcode(req,res){
    var username = req.params.user
    if (username==""||!username){

        username=req.username
    }
     Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){

                    res.sendStatus(400)
                }
                else
                {   var user=users[0]
                    var Item = {"username":username,"zipcode":user.zipcode}
                    res.send(Item)
                }
            })
}

function Putzipcode(req,res){
    var username = req.username
    var zipcode = req.body.zipcode
    Profile.updateOne({username:username},{zipcode:zipcode}).exec(function(err, users){
        console.log('zipcode update')
        var Item = {"username":username,"zipcode":zipcode}
        res.send(Item)

    })
}

function Getdob(req,res){
    var username = req.params.user
    if (username==""||!username){

        username=req.username
    }
     Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){

                    res.sendStatus(400)
                }
                else
                {   var user=users[0]
                    var Item = {"username":username,"dob":user.dob}
                    res.send(Item)
                }
            })
}

function Getavatar(req,res){
    var username = req.params.user
    if (username==""||!username){

        username=req.username
    }
     Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){

                    res.sendStatus(400)
                }
                else
                {   var user=users[0]
                    var Item = {"username":username,"avatar":user.avatar}
                    res.send(Item)
                }
            })
}

function Putavatar(req,res){
    multer().single('avatar')(req,res,()=>doUpload(req,res))
}

function doUpload(req,res){
    const uploadStream = cloudinary.uploader.upload_stream(result=>{
        var username = req.username
        console.log(req.file)
        Profile.updateOne({username:username},{avatar:result.url}).exec(function(err, users){
        console.log('avatar update')
        var Item = {"username":username,"avatar":result.url}
        res.send(Item)
    })
    })
    const s = new stream.PassThrough();
    s.end(req.file.buffer)
    s.pipe(uploadStream)
    s.on('end',uploadStream.end)
}



exports.Getheadline = Getheadline
exports.Putheadline = Putheadline
exports.Getemail = Getemail
exports.Putemail = Putemail
exports.Getzipcode = Getzipcode
exports.Putzipcode = Putzipcode
exports.Getdob = Getdob
exports.Putavatar = Putavatar
exports.Getavatar = Getavatar

