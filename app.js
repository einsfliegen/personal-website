if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Hash = require('./models/hash');
const helmet = require('helmet');
const cors = require('cors');
const catchAsync = require('./utils/catchAsync');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const siteRoutes = require('./routes/sites');
const reviewRoutes = require('./routes/reviews');

mongoose.set('strictQuery', false);

//process.env.DB_URL;
//'mongodb://localhost:27017/yelp-camp'
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'einsfliegen'
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    dbName: 'einsfliegen',
    crypto: {
        secret
    },
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
//app.use(helmet({contentSecurityPolicy: false}));
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "http://ajax.googleapis.com/",
    "https://code.jquery.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgux66ig0/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://lh3.googleusercontent.com/pw/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    next();
})

app.use('/', userRoutes);
app.use('/sites', siteRoutes);
app.use('/sites/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/api', (req, res) => {
    res.json({ message: "hello from server!!" })
})

app.get('/verify', catchAsync(async (req, res) => {
    const { id } = req.query;
    console.log(id);
    
    const hash = await Hash.findOne({hash : id}).exec();
    console.log(hash)
    if (!hash) {
        req.flash('warning', 'You already activated your account. The link is not valid anymore.');
        res.redirect('/login');
    }
    const user = await User.findById(hash.user._id);
    await User.findByIdAndUpdate(user._id, {$set: { active : true}});
    await Hash.findByIdAndDelete(hash._id);
    req.flash('success', 'You have successfully activated your account!');
    res.redirect('/login');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3100;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
