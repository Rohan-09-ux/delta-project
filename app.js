const path = require('path');

// Force dotenv to load explicitly from your absolute project root path
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: path.resolve(__dirname, '.env') });
}

// Log check now that path configuration is forced
console.log("Environment Secret Status:", process.env.SECRET ? "✅ Loaded" : "❌ Missing");

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Map Token
const mapToken = process.env.MAP_TOKEN;

// Database Configuration
const dburl = process.env.ATLASDB_URL || "mongodb+srv://Rohand:rohand12345@cluster0.kor9cnh.mongodb.net/wanderlust?retryWrites=true&w=majority";

async function main() {
    try {
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        if (mongoose.connection.readyState >= 1) {
            console.log(' Using existing active MongoDB connection');
            return;
        }

        if (!dburl) {
            throw new Error("ATLASDB_URL connection string is missing or undefined.");
        }

        await mongoose.connect(dburl);
        console.log(' Connected to MongoDB Atlas Cloud');
    } catch (err) {
        console.error(' MongoDB connection error:', err.message);
    }
}

// View Engine Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));



const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 3600, 
});


store.on("error", function(e){
    console.log("Session Store Error:", e);
});
// Express Session Management
app.use(session({
    store: store,
    secret: process.env.SECRET || 'wanderlust-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
}));


app.use(flash());

// Authentication Configuration (Passport)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Locals Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
});

// Router Connections
app.use("/listings", listingRouter); 
app.use("/listings/:id/reviews", reviewRouter); 
app.use("/", userRouter); 

// 404 Catch Handler
app.use((req, res, next) => {
    res.status(404).render("error.ejs", { 
        statusCode: 404, 
        message: "Page Not Found", 
        title: "Page Not Found" 
    });
});

// Centralized Error Handling Engine
app.use((err, req, res, next) => {
    console.log("ERROR:", err.message);


    if (res.headersSent) {
        return next(err);
    }
    
    let statusCode = 500;
    let message = "Something went wrong";
    
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = "Invalid listing ID";
    } else {
        message = err.message || "Something went wrong";
    }

    res.status(statusCode).render("error.ejs", { 
        statusCode, 
        message, 
        title: "Error" 
    });
});

// Server Initialization Lifecycle
const startServer = async () => {
    try {
        await main();
        console.log('Server ready on http://localhost:8080');
        app.listen(8080, () => {
            console.log('Listening on port 8080');
        });
    } catch (err) {
        console.error('Server startup failed:', err);
    }
};

startServer();