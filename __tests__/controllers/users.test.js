const { register } = require('../../controllers/users');
const User = require('../../models/user');
const { sendConfirmEmail } = require('../../utils/sendEmail');

jest.mock('../../models/user');
jest.mock('../../utils/sendEmail');

const req = {
    body: {
        username: 'einsfliegen',
        password: 'fake_password',
        email: 'fake_email',
    },
    flash: jest.fn((x) => x),
};

const res = {
    redirect: jest.fn((x) => x),
}

it('should throw an error when user exists', async () => {
    User.findOne.mockImplementationOnce(() => ({
        username: 'einsfliegen',
        email: 'email',
        password: 'password',
    }));

    await register(req, res);

    expect(req.flash).toHaveBeenCalledWith('error', 'User name existed!');
    expect(res.redirect).toHaveBeenCalledWith('/register');
})

it('should register successful and redirect to site', async () => {
    User.findOne.mockImplementationOnce(() => undefined);
    User.mockReturnValueOnce({
        username: 'einsfliegen',
        email: 'fake_email', //Constructor returns email value will be shown in flash
    })
    User.register.mockReturnValueOnce({
        username: 'einsfliegen',
        email: 'fake_email',
    })
    sendConfirmEmail.mockImplementationOnce(() => undefined);

    await register(req, res);
    
    const user = {email: req.body.email};
    expect(req.flash).toHaveBeenCalledWith('success', `Successfully registered! Please verify your email using the link sent to ${user.email}.`);
    expect(res.redirect).toHaveBeenCalledWith('/sites');
})