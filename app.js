var express = require("express");
var app = express();

var method = require("method-override");

//for authentication============================================================

var passport              = require("passport");
var localstrategy         = require("passport-local");
var passportlocalmongoose = require("passport-local-mongoose");
var user                  = require("./models/user");

//==============================================================================

// var bodyparser = require("body-parser");
// app.use(bodyparser.urlencoded({extented:true}));

var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));



//for authentication============================================================

app.use(require("express-session")({                             //for auth
    secret : "Rusty",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());                                 //for auth  
app.use(passport.session());                                    //for auth

passport.use(new localstrategy(user.authenticate()));           //for auth
passport.serializeUser(user.serializeUser());                   //for auth(used to take take sessions and encrypt it and decrypt it afterwards to send it back  
passport.deserializeUser(user.deserializeUser()); 

//==============================================================================

app.use(method("_method"));

//APP Config--------------------------------------------------------------------
app.set("view engine","ejs");

app.use(express.static("views" + "/public"));

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/to_do");



//MONGOOSE MODEL CONFIG---------------------------------------------------------

var todoSchema = new mongoose.Schema({
    name: String
    // date: {type :Date , default :Date.now}
});

var todo = mongoose.model("todo",todoSchema);

// .create({
//     name: "Go For A Walk"
// });

//RESTFUL ROUTES----------------------------------------------------------------

//INDEX-------------------------------------------------------------------------

app.get("/",function(req,res){
    res.redirect("/login");
});

app.get("/todo",isLoggedIn,function(req,res){
     todo.find({},function(err,list){
        if(err){
            console.log(err);
        }
        else {
            res.render("home",{todo:list});
        }
    });
    // res.render("home");
});


//NEW---------------------------------------------------------------------------

app.get("/todo/new",function(req,res){
    res.render("index");
});


app.post("/todo",function(req,res){
    todo.create(req.body.todo,function(err,id){
        if(err){
            console.log(err);
        }
        else {
            res.redirect("/todo");
        }
    });
});

//DELETE------------------------------------------------------------------------

app.delete("/todo/:id",function(req,res){
    todo.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
            console.log("Error");
        }
        else {
            console.log(req.params.id);
            console.log("no Error");
             res.redirect("/todo");
        }
    });
});


//AUTHENTICATION================================================================

//REGISTER ROUTES---------------------------------------------------------------

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    req.body.username
    req.body.password
    
     user.register(new user({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/todo");
            })
        }
    })
});

//LOGIN ROUTES------------------------------------------------------------------

app.get("/login",function(req,res){
    res.render("login");
})

app.post("/login",passport.authenticate("local",{
    successRedirect: "/todo",
    failureRedirect: "/login"
}), function(req,res){
    
});

//LOGOUT ROUTE------------------------------------------------------------------

app.get("/logout",function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


//==============================================================================

app.listen(process.env.PORT,process.env.IP,function(){
     console.log("Server is Running");
});