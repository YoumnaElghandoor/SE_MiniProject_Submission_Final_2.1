var express = require("express");
var User = require("./models/user");
var session = require("express-session"); 
var mongoose=require('mongoose');
const fileUpload = require('express-fileupload');


var router = express.Router();

var multer = require('multer');  


 var ObjectId = mongoose.Types.ObjectId;
 var id1 = new ObjectId;

var storage=multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,"./uploads/");
    },
    filename:function(req,file,cb){
      cb(null,file.originalname+id1);
    }

});
// var upload =multer({ dest :'./uploads/'});
var upload =multer({ storage : storage});

 // var storage = multer.diskStorage({
 //        destination: function (req, file, cb) {
 //            cb(null, './uploads/')
 //        },
 //        filename: function (req, file, cb) {

 //            var getFileExt = function(fileName){
 //                var fileExt = fileName.split(".");
 //                if( fileExt.length === 1 || ( fileExt[0] === "" && fileExt.length === 2 ) ) {
 //                    return "";
 //                }
 //                return fileExt.pop();
 //            }
 //            cb(null, Date.now() + '.' + getFileExt(file.originalname))
 //        }
 //    })

 //    var multerUpload = multer({ storage: storage })
 //    var uploadFile = multerUpload.single('upl');


router.use(session({                                        
  secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",    
  resave: true,                                          
  saveUninitialized: true                                
})); 


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '/views/uploads');
//   },
//   filename: function (req, file, callback) {
//     var extension = file.mimetype;
//     extension = extension.substring(extension.indexOf("/")+1, extension.length);
//     var filename = file.fieldname + '-' + Date.now() + "." + extension;
//     callback(null, filename);
// }
// });




router.use(function(req, res, next) {
  res.locals.currentUser = req.user;    
  res.locals.errors = req.flash("error");     
  res.locals.infos = req.flash("info");       
  next();
});



router.get("/", function(req, res, next) {
  User.find()                                 
  .sort({ createdAt: "descending" })          
  .exec(function(err, users) {                
    if (err) { return next(err); }
    res.render("index", { users: users });
  });
});


var passport = require("passport");


router.get("/login", function(req, res) {
   res.render("login");
});

router.post("/login", passport.authenticate("login", {
  successRedirect:"/",
  failureRedirect: "/login",
  failureFlash: true           
}));


router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});



router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", upload.single('upl1'),function(req, res, next) {
  console.log('sign up');
  var username = req.body.username;                  
  var password = req.body.password; 
  var  isStudent=req.body.optradio;  
  var image=req.file.originalname+id1;
  var images=[];

  User.findOne({ username: username }, function(err, user) {   
    if (err) { return next(err); }
    if (user) {                                      
      req.flash("error", "User already exists");     
      return res.redirect("/signup");                
    }                                                
    var newUser = new User({         
      username: username,            
      password: password,
      isStudent:isStudent,
      image:image,
      images:images
    });  
    console.log(newUser.image);                            
    newUser.save(next);                       
  });
},passport.authenticate("login", {   
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });

  });
});




function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {                   
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.get("/edit", ensureAuthenticated, function(req, res) {  
  res.render("edit");
});


router.post("/edit", ensureAuthenticated, function(req, res, next) {  
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});

// function ensureStudent(req,res,next){
//       console.log('Studenttttt');

//       var query=User.findOne({username:req.user.username});
//       console.log(User.find({}));
//       console.log(query);
//        var x=query.isStudent;
//       req.user.isStudent=query.isStudent;
//       console.log(req.user.isStudent);
//       console.log(req.user.username);
//   if(x==1){
//     console.log('hii');
    
//     next();
//   }
//   else {
//     req.flash("info", "Only  students can upload work.");
//     res.redirect("/");
//   }
// }

router.get("/create-portfolio", ensureAuthenticated,function(req,res,next){
  if(req.user.isStudent==0)
  {
    req.flash("info", "Only  students can upload work.");
    res.redirect("/");
  }
  else{
  res.render("create-portfolio");
}
});


var id2 = new ObjectId;

router.post('/create-portfolio', upload.single('upl'), function(req, res) {

 var currentUser=req.user; 
   // console.log('req: ');
   // console.log(req);

   var image = req.file.originalname+id1;
   
   currentUser.images.push(image);
  
   currentUser.save();
  // currentUser.markModified('images');
   res.redirect('/');
});
// router.post('/create-portfolio', upload.single('upl'), function(req, res) {
//   console.log(req.body);
//   console.log(req.files);
//    res.redirect('/');
// });

// router.post("/create-portfolio", ensureAuthenticated ,upload.any(),function(req,res,next){
//   console.log(req.file);
//   res.send(req.file);
// });


module.exports = router;