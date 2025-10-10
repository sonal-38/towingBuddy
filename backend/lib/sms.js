function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;

  // Lazy-require Twilio so the server won't crash if the package isn't installed.
  try {
    // eslint-disable-next-line global-require
    const twilio = require('twilio');
    return twilio(sid, token);
  } catch (err) {
    console.warn('Twilio package is not installed or failed to load. SMS disabled.');
    return null;
  }
}

async function sendTowingSMS(toNumber, ownerName, vehicleNumber, towingInfo, overrideMessage) {
  const client = getClient();
  if (!client) {
    console.warn('Twilio not configured (missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)');
    return false;
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn('TWILIO_PHONE_NUMBER not set');
    return false;
  }

  // Template support: overrideMessage > env TWILIO_SMS_TEMPLATE > default
  const defaultTemplate = `Dear {ownerName},\n\nYour vehicle {vehicleNumber} ({model}) has been reported for illegal parking at {towedFrom}.\nPlease remove your vehicle immediately to avoid towing.\nIf already towed, check your vehicle location on the Towing Buddy app or visit: {appLink}\n\n— Towing Buddy Team`;

  const template = overrideMessage || process.env.TWILIO_SMS_TEMPLATE || defaultTemplate;

  const model = towingInfo.model || '';
  const appLink = process.env.TOWING_APP_LINK || 'www.towingbuddy.in';

  const body = template
    .replace(/\{ownerName\}/g, ownerName || 'Owner')
    .replace(/\{vehicleNumber\}/g, vehicleNumber || '')
    .replace(/\{model\}/g, model)
    .replace(/\{towedFrom\}/g, towingInfo.towedFrom || '')
    .replace(/\{towedTo\}/g, towingInfo.towedTo || '')
    .replace(/\{fine\}/g, String(towingInfo.fine || ''))
    .replace(/\{reason\}/g, towingInfo.reason || '')
    .replace(/\{appLink\}/g, appLink);

  try {
    const msg = await client.messages.create({
      from,
      to: toNumber,
      body,
    });
    console.log('Sent towing SMS', msg.sid);
    return true;
  } catch (err) {
    console.error('Twilio send error', err);
    return false;
  }
}

module.exports = { sendTowingSMS };
