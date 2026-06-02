const express = require('express');
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/posts.js");
const session = require("express-session");
const Flash = require("connect-flash");
const path = require("path");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionOptions = ({
        secret:"mysecretstring",
        resave:false,
        saveUninitialized:true,
    });
app.use(session(sessionOptions));
app.use(Flash());

app.use((req,res,next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorsMsg = req.flash("error");
    next();
});

app.get("/register", (req, res) => {
    let {name="anonymous"} = req.query;
    req.session.name = name;
    // req.flash("success","User registered successfully!");
    if(name === "anonymous"){
        req.flash("error","user not registerd");
    }else {
        req.flash("success","You are registered as a regular user!");
    }
    res.redirect("/hello");

});
//hello
app.get("/hello",(req,res) => {
    res.render("page.ejs", { name: req.session.name });
});
// app.get("/reqcount",(req,res) => {
//     if(req.session.count){
//         req.session.count++;
//     }else   {
//         req.session.count= 1;
//     }

//     res.send(`you sent request ${req.session.count} times`);
// });

// app.get("/test",( req, res) => {
//     res.send("test suuccessful");
// });
// const cookieParser = require("cookie-parser");

// app.use(cookieParser("mysecretcode"));


// //signed cookies
// app.get("/getsignedcookies",(req,res) => {
//     res.cookie("greet","nameste",{signed:true});
//     res.cookie("madin","india",{signed:true});
//     res.send("sent you some signed cookies!");
// })

// app.get("/verify",(req,res) => {
//     console.log(req.signedCookies);
//     res.send("checking signed cookies!");
// });

// app.get("/getcookies",(req,res) => {
//     res.cookie("greet","nameste");
//     res.cookie("madin","india");
//     res.send("sent you some cookies!");
// })

// app.get("/greet",(req,res) => {
//     let {name = "anonymous"} = req.cookies;
//     res.send(`hi ${name}`);
// })

// app.get("/",(req,res) => {
//     console.dir(req.cookies);
//     res.send("hi i am a root");
// });

// app.use("/users", users);

// app.use("/posts", posts);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});