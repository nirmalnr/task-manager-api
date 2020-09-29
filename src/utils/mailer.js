const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const senderMailId = 'nirmalmetallica@gmail.com'

const sendWelcomeMail = (name,email) => {
    const msg = {
        to: email,
        from: senderMailId,
        subject: 'Welcome to Taskinator 2000',
        text: `Welcome to the app, ${name}. Lets get some tasks done!`,
        html: `<strong>Welcome to the app, ${name}. Lets get some tasks done!</strong>`
    }
    sgMail.send(msg)
}

const sendGoodbyeMail = (name,email) => {
    const msg = {
        to: email,
        from: senderMailId,
        subject: `Goodbye ${name}`,
        text: `${name}, we hate to see you go! Let us know if we could have done anything differently.`,
        html: `${name}, we hate to see you go! Let us know if we could have done anything differently.`
    }
    sgMail.send(msg)
}

module.exports = {
    sendWelcomeMail,
    sendGoodbyeMail
}