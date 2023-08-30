const User = require('../models/user');
const transporter = require('../public/javascripts/sendMail.js');
const Hash = require('../models/hash.js');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const queryUsername = await User.findOne({ username: username }).exec();
        const isUserNameExist = queryUsername ? true : false;
        if (isUserNameExist) {
            throw { name: "UsernameExistError", message: "User name existed!" };
        }
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        await sendConfirmEmail(req, registeredUser);
        req.flash('success', `Successfully registered! Please verify your email using the link sent to ${user.email}.`);
        res.redirect('/sites');
        // req.login(registeredUser, err => {
        //     if(err) return next(err);
        //     req.flash('success', 'Welcome to Food Sites!');
        //     res.redirect('/sites');
        // })
    } catch (e) {
        if (e.code === 11000) {
            req.flash('error', "The e-mail address you specified is already in use. (Do you already have an account?");
            res.redirect('/register');
        }
        else {
            req.flash('error', e.message);
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

async function sendConfirmEmail(req, user) {
    try {
        const { email, username } = req.body;
        const encodedToken = Buffer.from(username).toString('base64url');
        //const rand = Math.floor((Math.rand() * 100) + 54);
        const link = process.env.NODE_ENV !== "production" ? "http://" + req.get('host') + "/verify?id=" + encodedToken : "https://" + req.get('host') + "/verify?id=" + encodedToken;
        const hash = new Hash({ 'hash': encodedToken });
        hash.user = user._id;
        await hash.save();
        const info = await transporter.sendMail({
            from: '"Team Einsfliegen" <limyifei0115@einsfliegen.com>',
            to: email,
            subject: "Activate your Einsfliegen account",
            html: `<h1>Hello</h1> ${username} 
            <br /> 
            <br> Please click on the link to verify your email:</br> 
            <br /> 
            <a href="${link}">Click here to verify</a> 
            <br />
            <br>Thanks,</br>
            <p>Einsfliegen</p>`
        })
        console.log(info);

    } catch (e) {
        console.log(e);
    }
}