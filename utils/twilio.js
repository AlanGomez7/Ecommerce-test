const authToken = "9f3664de8c95d6de563ccc971b1734aa";
const accountSid= "ACa6a40fcfec29d6c7d08fb0e5af9e463f";
const verifySid = "VA969247167a9ac06fc06b04146f637e11";

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