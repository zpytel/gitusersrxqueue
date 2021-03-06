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
function checkUsers(data,progress,resolve,reject){
    let checkadmin=admin.database().ref('/admins/' + data.user );
    
    checkadmin.once('value',function(snap){
        if(snap.val()!=null){
            resolve(data)
        }else{
        checkUser(data,progress,resolve,reject);
        
        }
    })
    
    
}
function checkUser(data,progress,resolve,reject){
 let illness=data.part + '|' + data.illness;
 let illnesskeymsg=admin.database().ref('/items/illnesskeymsg/' + illness + '/' + data.keyword +'/' + data.user );
 illnesskeymsg.once('value',function(snapshot){
         var exists=(snapshot.val()!=null);
         
         console.log("Exists:" + exists)
         if (exists==true){
             console.log("user exists")
             resolve({'notvalid':true})
             
         }else{
           var refnew=illnesskeymsg.push();
           refnew.set({howto:data.message})
           resolve(data);
         }
         
    });

}


var options={
    'specId':'verify_user'
}
var verifyqueue=new Queue(ref,options,function(data,progress,resolve,reject){
   checkUsers(data,progress,resolve,reject)
})
var optionsMain={
    'specId':'add_items'
}

process.on('SIGINT', function() {
  console.log('Starting queue shutdown');
  queue.shutdown().then(function() {
    console.log('Finished queue shutdown');
    process.exit(0);
  });
});
var queue=new Queue(ref,optionsMain,function(data,progress,resolve,reject){
    if(!data.notvalid){
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

    }//process data
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