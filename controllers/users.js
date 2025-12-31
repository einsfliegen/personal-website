const User = require('../models/user');
const { sendConfirmEmail } = require('../utils/sendEmail.js');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY || '', process.env.RECAPTCHA_SECRET_KEY || '');

module.exports.renderRegister = (req, res) => {
    const captcha = recaptcha.render();
    res.render('users/register', { captcha });
}

module.exports.register = async (req, res, next) => {
    try {
        // verify recaptcha
        await new Promise((resolve, reject) => {
            recaptcha.verify(req, (err, data) => {
                if (err) {
                    req.flash('error', 'reCAPTCHA verification failed. Please try again.');
                    return reject(err);
                }
                resolve(data);
            });
        });

        const { email, username, password } = req.body;
        const queryUsername = await User.findOne({ username: username });
        const isUserNameExist = queryUsername ? true : false;
        if (isUserNameExist) {
            throw { name: "UsernameExistError", message: "User name existed!" };
        }
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        await sendConfirmEmail(req, registeredUser);
        req.flash('success', `Successfully registered! Please verify your email using the link sent to ${user.email}.`);
        res.redirect('/sites');
    } catch (e) {
        if (e && e.code === 11000) {
            req.flash('error', "The e-mail address you specified is already in use. (Do you already have an account?)");
            res.redirect('/register');
        }
        else {
            if (!req.flash || (e && e.message)) req.flash('error', e.message || 'Registration failed.');
            res.redirect('/register');
        }
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back ${req.user.username}`);
    const redirectUrl = res.locals.returnTo || '/sites';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    try {
        const username = req.user.username;
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', `${username} logged out!`);
            res.redirect('/sites');
        });
    } catch (e) {
        res.redirect('/sites');
    }
}

module.exports.logoutInActive = (req, res) => {
    try {
        const username = req.user.username;
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('error', 'Please activate your account first!');
            res.redirect('/login');
        });
    } catch (e) {
        res.redirect('/login');
    }
}
