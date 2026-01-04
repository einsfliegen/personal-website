const {siteSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Site = require('./models/site.js');
const Review = require('./models/review.js');
const User = require('./models/user.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) =>{
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateSite = (req, res, next) =>{

    const {error} = siteSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const site = await Site.findById(id);
    if (!site.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/sites/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.checkActive = async (req, res, next) => {
    const { username } = req.body;
    const user = await User.findOne({username : username}).exec();
    if (user.active == false) {
        return res.redirect('/logininactive');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    // If not authenticated, redirect for HTML requests, JSON for API
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        if (req.originalUrl && req.originalUrl.startsWith('/admin/api')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        //req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    // Only allow users with role 'Admin'
    if (!req.user || req.user.role !== 'Admin') {
        if (req.originalUrl && req.originalUrl.startsWith('/admin/api')) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.flash('error', 'You do not have permission to access that page!');
        return res.redirect('/sites');
    }
    next();
}
