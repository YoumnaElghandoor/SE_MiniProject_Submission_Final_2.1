var express = require("express");               
var mongoose = require("mongoose");             
var path = require("path"); 
//var multer  =   require('multer');                    
var bodyParser = require("body-parser");        
var cookieParser = require("cookie-parser");    
var flash = require("connect-flash"); 
var passport=require("passport");
var session = require("express-session");            
var routes = require("./routes"); 
var http = require('http'),
    fs = require('fs'),
    path=require('path'),
    url = require('url');
    imageDir = '/Users/peng/ifs/ipic/x/'; 
//const fileUpload = require('express-fileupload');
var setUpPassport = require("./setuppassport"); 


var app = express();

mongoose.connect("mongodb://localhost:27017/test");
setUpPassport();

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(express.static(__dirname+'/uploads'));
app.use(session({                                        
  secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX", 
  resave: true,                                          
  saveUninitialized: true                                
})); 

var multer = require('multer'),
	bodyParser = require('body-parser'),
	path = require('path');

app.use(bodyParser.json());



//app.use(multer({dest:'./uploads/'}));

//app.use(fileUpload());
app.use(flash());                                                                                                        
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);



// http.createServer(function (req, res) {
//     //use the url to parse the requested url and get the image name
//     var query = url.parse(req.url,true).query;
//         pic = query.image;
 
//     if (typeof pic === 'undefined') {
//         getImages(imageDir, function (err, files) {
//             var imageLists = '<ul>';
//             for (var i=0; i<files.length; i++) {
//                 imageLists += '<li><a href="/?image=' + files[i] + '">' + files[i] + '</li>';
//             }
//             imageLists += '</ul>';
//             res.writeHead(200, {'Content-type':'text/html'});
//             res.end(imageLists);
//         });
//     } else {
//         //read the image using fs and send the image content back in the response
//         fs.readFile(imageDir + pic, function (err, content) {
//             if (err) {
//                 res.writeHead(400, {'Content-type':'text/html'})
//                 console.log(err);
//                 res.end("No such image");    
//             } else {
//                 //specify the content type in the response will be an image
//                 res.writeHead(200,{'Content-type':'image/jpg'});
//                 res.end(content);
//             }
//         });
//     }
 
// }).listen(3000);
// console.log("Server running at http://localhost:3000/");


// //get the list of jpg files in the image dir
// function getImages(uploads, callback) {
//     var fileType = '.jpg',
//         files = [], i;
//     fs.readdir(uploads, function (err, list) {
//         for(i=0; i<list.length; i++) {
//             if(path.extname(list[i]) === fileType) {
//                 files.push(list[i]); //store the file name into the array files
//             }
//         }
//         callback(err, files);
//     });
// }




app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});