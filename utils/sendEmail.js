const nodemailer = require("nodemailer");
const Hash = require('../models/hash.js');

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.strato.de",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
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
    const transporter = getTransporter();
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
    return info;

  } catch (e) {
    return e;
  }
}

module.exports.sendConfirmEmail = sendConfirmEmail;

//Info response
/*
{
  accepted: [ 'limyifei0115@einsfliegen.com' ],
  rejected: [],
  ehlo: [
    'ENHANCEDSTATUSCODES',
    'PIPELINING',
    '8BITMIME',
    'DELIVERBY',
    'SIZE 104857600',
    'AUTH PLAIN LOGIN CRAM-MD5 DIGEST-MD5',
    'REQUIRETLS',
    'HELP'
  ],
  envelopeTime: 121,
  messageTime: 163,
  messageSize: 676,
  response: '250 2.0.0 OK queued with id 603d56z8JMLM7YZ',
  envelope: {
    from: 'limyifei0115@einsfliegen.com',
    to: [ 'limyifei0115@einsfliegen.com' ]
  },
  messageId: '<6827170b-6bf2-3763-06e1-1f11e0446a3c@einsfliegen.com>'
}

*/