const sendSms = async (phone, message) => {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(message)}&numbers=${phone}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Fast2SMS:', data);  // ← add
    return data;
}
module.exports = sendSms;