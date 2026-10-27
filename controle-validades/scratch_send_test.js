require('dotenv').config();

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const to = '5514991395451';

console.log('Testing WhatsApp Send:');
console.log('Phone ID:', phoneId);
console.log('To:', to);

async function testSend() {
  // Try sending a template message (hello_world is standard on all Meta WABAs)
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  
  console.log('\n--- 1. Testing hello_world template ---');
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US'
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templatePayload)
    });
    const data = await res.json();
    console.log('Template Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Template Error:', err);
  }

  console.log('\n--- 2. Testing text message ---');
  const textPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      body: '🚨 Teste oficial do Artos - Controle de Validades via WhatsApp Cloud API!'
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(textPayload)
    });
    const data = await res.json();
    console.log('Text Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Text Error:', err);
  }
}

testSend();
