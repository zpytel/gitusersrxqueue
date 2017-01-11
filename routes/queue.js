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
//var refcar=admin.database().ref('/cars');
function keyillnessExists(illness,exists,snap,db,data){
    
     if(exists){
        let illness=data.part + '|' + data.illness;
        let key;
        for(k in snap.val()){
            key=k;
        }
        var updated=snap.val()[key].count+1;
         let fullPath=admin.database().ref('/items/keyillness/'  + data.keyword + '/' + illness + '/' + key )
        fullPath.update({count:updated})
        console.log('keyillnes: ' + illness + ' exists')
    }else{
        var refnew=db.push();
        refnew.set({count:1});
        console.log('keyillnes: ' + illness + ' not exists')
    }
}
function illnesskeyExists(illness,exists,snap,db,data){
    if(exists){
        let illness=data.part + '|' + data.illness;
        let key;
        for(k in snap.val()){
            key=k;
        }
        var updated=snap.val()[key].count+1;
        let fullPath=admin.database().ref('/items/illnesskey/' + illness + '/' + data.keyword + '/' + key )
        fullPath.update({count:updated})
        
        console.log('illnesskey: ' + illness + ' exists')
    }else{
        var refnew=db.push();
        refnew.set({count:1});
        console.log('illnesskey: ' + illness + ' not exists')
    }
}
var queue=new Queue(ref,function(data,progress,resolve,reject){
    let illness=data.part + '|' + data.illness;
    let illnesskey=admin.database().ref('/items/illnesskey/' + illness + '/' + data.keyword );
    let keyillness=admin.database().ref('/items/keyillness/' + data.keyword + '/' + illness);
    
    illnesskey.once('value',function(snapshot){
      var exists=(snapshot.val()!=null);
       console.log(snapshot.val())
       illnesskeyExists(illness,exists,snapshot,illnesskey,data)
    })
    keyillness.once('value',function(snapshot){
        var exists=(snapshot.val()!=null);
        console.log(snapshot.val())
       keyillnessExists(illness,exists,snapshot,keyillness,data)
    })
/*
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
    }); */
    
   
   
    setTimeout(function(){resolve()},10000);
})
router.get('/', function(req, res, next) {
  
  res.render('queue', { title: 'Queue' });
});

module.exports = router;