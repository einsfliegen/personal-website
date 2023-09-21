const Hash = require('../../models/hash');
const Mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const { sendConfirmEmail } = require('../../utils/sendEmail');

jest.mock('../../models/hash');
jest.mock("nodemailer");

const req = {
    body: {
        username: 'einsfliegen',
        email: 'limyifei0115@gmail.com',
    },
    get: jest.fn(() => "localhost:3100"),
};

const user = {
    __id: Mongoose.Types.ObjectId(12),
}

const hash = {
    hash: "fake_token",
    user: Mongoose.Types.ObjectId(15),
    save: jest.fn(),
}

const info = {
    accepted: ['limyifei0115@einsfliegen.com'],
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
        to: ['limyifei0115@einsfliegen.com']
    },
    messageId: '<6827170b-6bf2-3763-06e1-1f11e0446a3c@einsfliegen.com>'
}

const transporter = {
    sendMail: jest.fn(() => info),
}

it('should send email successfully', async () => {
    Hash.mockReturnValueOnce(hash);
    nodemailer.createTransport.mockImplementationOnce(() => transporter)
    //await sendConfirmEmail(req, user);
    const data = await sendConfirmEmail(req, user);
    expect(data.response).toMatch(/250 2.0.0 OK/);
    expect(link).toMatch("");
})