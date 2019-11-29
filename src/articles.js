var cookieKey = 'sid'
const express = require('express')
var Article = require('./model.js').Article

function Getarticle(req,res){
    var author = req.body.author;
    Getarticlebyauthor(author,function(Items){
        res.send(Items)
    })
}


function Getarticlebyauthor(author,callback){
    Article.find({ author: author }).exec(function(err, Items) {
        callback(Items)
    })
}

function GetarticlebyId(Id,callback){
    Article.find({ id: Id }).exec(function(err, Items) {
            callback(Items)
        })
}
function Getarticles(req,res){
    var id = req.params.id
    if (!id){
        var username = req.username
        Getarticlebyauthor(username,function(Items){
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
    var image = req.body.image
    var text = req.body.text
    var author = req.username
    Article.countDocuments({}, function( err, count){
    var D = new Date();
    var d1=D.toLocaleDateString('en-US');
    var d2=D.toLocaleTimeString('en-US');
    var d=d1+' '+d2;
    var newarticle ={id: count,
                    author: author,
                    body: text,
                    date: d,
                    picture: image,
                    comments: []
            }
    Article(newarticle).save()
    res.send([newarticle])
    })

}
function Newarticleimage(req,res){
    
    
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
                                 targetcomments[commentId] = {commentId: targetcomments[commentId],
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