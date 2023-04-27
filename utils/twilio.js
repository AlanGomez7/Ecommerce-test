const router = require('../routes/users');
require("dotenv").config()

const authToken = "cce9f41c149f3cd0b9becc8dba2d2d8f";
const accountSid= "AC4dbc5ee09c1902c8d09ad3cf24fd2765";
const verifySid = "VA78b8b449952ff5208bf0bf5c400beea3";
const client = require('twilio')(accountSid, authToken);

module.exports = {
    
    sendOtp(mobileNo) {
        console.log(mobileNo, "||||||||||||||||||")
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