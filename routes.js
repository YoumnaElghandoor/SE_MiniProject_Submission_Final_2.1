var express = require("express");
var User = require("./models/user");
var session = require("express-session"); 
var mongoose=require('mongoose');
const fileUpload = require('express-fileupload');
// var $ = require('jQuery');
// var jsdom = require("jsdom").jsdom;
// var jsdom = require("node-jsdom");
// var doc = jsdom();
// var window = doc.defaultView;

// var window = jsdom.jsdom(...).defaultView;
// window.onModulesLoaded = function () {
//   console.log("ready to roll!");
// };
// Load jQuery with the simulated jsdom window.
// $ = require('jquery')(window);
global.str;
global.str="";
var router = express.Router();

var multer = require('multer');  


 var ObjectId = mongoose.Types.ObjectId;
 var id1 = new ObjectId;

var storage = multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,"./uploads/");
    },
    filename:function(req,file,cb){
      cb(null,file.originalname+id1);
    }

});

var upload =multer({ storage : storage});



router.use(session({                                        
  secret: "AJFHSDFSFAHSDKLH,>>MXsjhdsdklad",    
  resave: true,                                          
  saveUninitialized: true                                
})); 




router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.searchString="";    
  res.locals.errors = req.flash("error");     
  res.locals.infos = req.flash("info");       
  next();
});



router.get("/", function(req, res, next) {
  
  if(req.query.search){
    // console.log('queryyyyy ');
   global.str=req.query.search;
     User.find().sort({ createdAt: "descending" }).exec(function(err, users) {                
    if (err) { return next(err); }
    res.render("search-results", { users: users });
  });

  }
  else{
   console.log('else parttt');
    User.find().sort({ createdAt: "descending" }).exec(function(err, users) {                
    if (err) { return next(err); }
    res.render("index", { users: users });
  });

  }
  
});





var passport = require("passport");


router.get("/login", function(req, res) {
   res.render("login");
});

router.post("/login",passport.authenticate("login", {
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
 
  var username = req.body.username;                  
  var password = req.body.password; 
  var  isStudent=req.body.optradio;  
  var first_portfolio=req.file.originalname+id1;
  var images=[];
  // var image="default.png";
 images.push(first_portfolio);

  // console.log('hiiii images');
  // console.log(images);

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
      image:"default.png",
      images:images
    });                              
    newUser.save(next);                       
  });
}
,passport.authenticate("login", {   
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


//    $(function() {
//    $('form').submit(function() {
//       if(!$("form input[type=file]").val()) {
//          alert('You must select a file!');
//          return false;
//       }
//    });
// });
   var image = req.file.originalname+id1;
   currentUser.images.push(image);
    req.flash("info", 'Your portfolio was successfully updated');


   // if(req.body.link!="youmna"){
   //   var link=req.body.link;
   // currentUser.links.push(link);
   // }
   
  
   currentUser.save();
   res.redirect('/');
});



router.get("/profile-pic",ensureAuthenticated,function(req,res,next){

  res.render("profile-pic");

});

router.post('/profile-pic', upload.single('upl2'), function(req, res) {

 var image = req.file.originalname+id1;
 
 var query = {'username':req.user.username};
  req.user.image = image;

  User.findOneAndUpdate(query, req.user, {upsert:true}, function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.redirect("/");
});
   
});


router.get("/work-link",ensureAuthenticated,function(req,res,next){

  res.render("work-link");

});


router.post('/work-link', upload.single('upl'), function(req, res) {

     var currentUser=req.user; 
     var link=req.body.link;
     currentUser.links.push(link);
     currentUser.save();
     req.flash("info","Your portfolio was successfully created");
     res.redirect('/');
});


router.get("/search-results",function(req,res,next){

  res.render("search-results");

});
router.post("/search-results",function(req,res,next){
  console.log(req);
    global.str=req.body.search;
  res.render("search-results");

});




module.exports = router;