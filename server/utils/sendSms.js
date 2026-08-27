const sendSms = async (phone, message) => {
    if (!phone || !process.env.FAST2SMS_API_KEY) {
        console.warn('Fast2SMS skipped: phone or FAST2SMS_API_KEY missing');
        return null;
    }
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(message)}&numbers=${encodeURIComponent(phone)}`;
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
            const data = await response.json();
            console.log('Fast2SMS output:', data);
            return data;
        }
    } catch (err) {
        console.error('Fast2SMS error:', err.message);
    }
    return null;
};

module.exports = sendSms;