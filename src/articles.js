var cookieKey = 'sid'
const express = require('express')
const Article = require('./model.js').Article
const Profile = require('./model.js').Profile
const multiparty = require('multiparty')
const cloudinary = require('cloudinary')
const multer = require('multer')
const stream = require('stream')

cloudinary.config({
    cloud_name: 'hctu5fc4g',
    api_key: '937137325281613',
    api_secret: 'za0fvX6_qvEohlPWcLW7Jv2olK4'
})
function Getarticle(req,res){
    var author = req.body.author;
    Getarticlebyauthor(author,function(Items){
        res.send(Items)
    })
}


function Getarticlebyauthor(author,callback){
    Article.find({ author: author ,limit: 10}).exec(function(err, Items) {
        callback(Items)
    })
}

function GetarticlebyId(Id,callback){
    Article.find({ id: Id }).exec(function(err, Items) {
            callback(Items)
        })
}

function Getarticlebyauthors(author,callback){
    var username = author
    Profile.find({ username:username }).exec(function(err, users) {
                if(users.length == 0){

                    res.sendStatus(400)
                }
                else{
                    var usersToquery  = []
                    console.log(users[0].following)
                    usersToquery.push(username)
                    var usersToquery2 = usersToquery.concat(users[0].following)
                    console.log(usersToquery2)
                    Article.find({ author: usersToquery2 }).sort({'date': -1}).limit(10).exec(function(err, Items) {
                        callback(Items.reverse())
                        })
                   
                }
            })

}
function Getarticles(req,res){
    var id = req.params.id
    if (!id){
        var username = req.username
        Getarticlebyauthors(username,function(Items){
        res.send(Items)
        })
    }
    else{
        GetarticlebyId(id,function(Items1){
            if (Items1){
                res.send(Items1)
            }
            else{
            Getarticlebyauthor(id,function(Items2){
                
                res.send(Items2)
            })
            }
        })
    }

}
function Newarticle(req,res){
    var newarticle = {}
    var image = req.file
    var text = req.body.text
    var author = req.username
    //console.log(req)
    multer().single('picture')(req,res,() =>doUpload(req,res))
}


function doUpload(req,res){
    var image = req.file;
    var text = req.body.text;
    var author = req.username
    var newarticle = {}
    console.log(text)
    console.log(image)
    Article.countDocuments({}, function( err, count){
    var D = new Date();
    var d1=D.toLocaleDateString('en-US');
    var d2=D.toLocaleTimeString('en-US');
    var d=d1+' '+d2;

    if (image!=null)
            {       console.log('upload image');
                    const uploadStream = cloudinary.uploader.upload_stream(result=>
                    {
                console.log(result);
                if (!result.url)
                    {return}
                else{
                    var newarticle ={id: count,
                        author: author,
                        body: text,
                        date: d,
                        picture: result.url,
                        comments: []
                    }
                Article(newarticle).save()
                res.send([newarticle])
                }
                })
                const s = new stream.PassThrough();
                s.end(req.file.buffer)
                s.pipe(uploadStream)
                s.on('end',uploadStream.end)    
            }
    else{
        var newarticle ={id: count,
                    author: author,
                    body: text,
                    date: d,
                    picture: image,
                    comments: []
        }
        Article(newarticle).save()
        res.send([newarticle])
        return
        }
        })
}

function Putarticle(req,res){
    var id = req.params.id
    var loggedinuser = req.username
    var text = req.body.text
    var commentId = req.body.commentId
    var textchange = 0
    var commentchange = 0
    var unauth = 0
    if(!text|| text == "" ){
        textchange = 0
        res.sendStatus(400)
    }
    
    if(!commentId||commentId == "")
        {
            commentchange = 0
            textchange = 1
        }
    else
        {commentchange = 1
        commentId=parseInt(commentId)}
    var D = new Date();
    var d1=D.toLocaleDateString('en-US');
    var d2=D.toLocaleTimeString('en-US');
    var d=d1+' '+d2;
    Article.find({id: id }).exec(function(err, Items) {
        if (Items.length==0)
            {   
                console.log("none article found")
                res.sendStatus(400)
            }
        else 
            {   var article = Items[0]
                var targetcomments = article.comments
                var newtext = article.body
                if(commentchange==1)
                    {
                        if (commentId == -1)
                        {
                            targetcomments.push(
                                {commentId: targetcomments.length,
                                author: loggedinuser,
                                body: text,
                                date: d
                                })
                        }
                        else
                        {   if(targetcomments[commentId].author == loggedinuser)
                                 targetcomments[commentId] = {commentId: commentId,
                                    author: loggedinuser,
                                    body: text,
                                    date: d
                                    }
                            else
                                {   console.log('you dont own this comment')
                                    //res.sendStatus(401)
                                    unauth = 1
                                } 
                        }
                    }
                else{
                        if (loggedinuser == article.author)
                        newtext = text
                     else
                                {   console.log('you dont own this article')
                                    //res.sendStatus(401)} 
                                    unauth = 1

                                }   
                    } 
                if (unauth == 1){
                    res.sendStatus(401)
                    }
                else{
               Article.updateOne({id: id },{comments:targetcomments,body:newtext}).exec(function(err, users){
                console.log(targetcomments)
                console.log(newtext)
                console.log('article update') 
                article.comments = targetcomments;
                article.body = newtext;
                res.send(article)
                })
                }
            }
    })
}

exports.Newarticle = Newarticle;
exports.Getarticles = Getarticles;
exports.Putarticle = Putarticle;