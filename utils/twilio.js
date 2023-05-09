const router = require('../routes/users');
require("dotenv").config()

const authToken = "d03f7a8fb82c5b076b5836108546bcd8";
const accountSid= "AC4dbc5ee09c1902c8d09ad3cf24fd2765";
const verifySid = "VA78b8b449952ff5208bf0bf5c400beea3";
const client = require('twilio')(accountSid, authToken);

module.exports = {
    
    sendOtp(mobileNo) {
        client.verify.v2.services(verifySid)
            .verifications
            .create({ to: '+91' + mobileNo, channel: 'sms' })
            .then(verification => console.log(verification.sid));
    },

    verifyOtp(mobileNo, otp) {
        return client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: '+91' + mobileNo, code: otp })
            .then(verification_check => {
                console.log(verification_check.status)
                if (verification_check.status == 'approved') {
                    return true
                } else {
                    return false
                }
            })
    }
}