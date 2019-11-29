var cookieKey = 'sid'
const express = require('express')
var Profile = require('./model.js').Profile

function Getfollowing(req,res){
    var username = req.params.user
    if (username==""||!username){
        username=req.username
    }
     Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){
                    res.sendStatus(400)
                }
                else
                {   user=users[0]
                    var Item = {"username":username,"following":user.following}
                    res.send(Item)
                }
            })
}

function Putfollowing(req,res){
    var username = req.username
    var newfollow = req.params.user
    //var newfollow = req.body.email
    if (newfollow==""){
            res.sendStatus(400)
        }
    Profile.find({ username:username }).exec(function(err, users) {
                    if(users.length == 0){
                        res.sendStatus(400)
                    }
                    else
                    {   var user=users[0]
                        var nowfollowlist = user.following
                        console.log(nowfollowlist)
                        nowfollowlist.push(newfollow)
                        console.log(nowfollowlist)
                        Profile.find({ username:newfollow }).exec(function(err, users) {
                            if(users.length!= 0 )
                                {Profile.updateOne({username:username},{following:nowfollowlist}).exec(function(err, users){
                                var Item = {"username":username,"following":nowfollowlist}
                                res.send(Item)
                                })}
                            else
                                {   console.log('no such user')
                                    res.send({"result":"no such user"})
                                }

                        })
                        
                    }
                })

}

function Deletefollowing(req,res){
        var username = req.username
        var deletefollow = req.params.user
        if (deletefollow==""){
                res.sendStatus(400)
            }

        Profile.find({ username:username }).exec(function(err, users) {
                        if(users.length == 0){
                            res.sendStatus(400)
                        }
                        else
                        {   var user=users[0]
                            var nowfollowlist = user.following
                            console.log(nowfollowlist)
                            var xid = nowfollowlist.indexOf(deletefollow)
                            console.log(xid)
                            if(xid==-1){
                                res.sendStatus(400)
                                return
                            }
                            nowfollowlist.splice(xid,1)
                            console.log('delete')
                            console.log(nowfollowlist)
                            Profile.updateOne({username:username},{following:nowfollowlist}).exec(function(err, users){
                            var Item = {"username":username,"following":nowfollowlist}
                            res.send(Item)
                            })
                        }
                    })
}

exports.Getfollowing = Getfollowing
exports.Putfollowing = Putfollowing
exports.Deletefollowing = Deletefollowing