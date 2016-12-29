var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");
var Queue=require("firebase-queue");
admin.initializeApp({
  credential: admin.credential.cert("../serviceAccountKeyAdmin.json"),
  databaseURL: "https://ngrxproject.firebaseio.com"
});
/* GET home page. */
var ref=admin.database().ref('queue');
var refcar=admin.database().ref('/cars');

var queue=new Queue(ref,function(data,progress,resolve,reject){
    let maxid=0;
    let newcar=refcar.push();
    refcar.once('value',function(snapshot){
      snapshot.forEach(function(childSnap){
          car=childSnap.val();
          console.log(car)
          if(car.id>maxid){
              maxid=car.id;
          }

          
      })
      maxid=maxid+1
       newcar.set({id:maxid,make:data.make,model:data.model})
       progress(50);
    });
    
   
   
    setTimeout(function(){resolve()},10000);
})
router.get('/', function(req, res, next) {
  
  res.render('queue', { title: 'Queue' });
});

module.exports = router;