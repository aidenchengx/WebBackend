var User = require('./model.js').User


function adduser(username,salt,hash){
    User({username:username,salt:salt,hash:hash}).save();
}


exports.adduser = adduser