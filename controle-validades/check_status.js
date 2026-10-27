require('dotenv').config();

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const wabaId = '1669563681344304';

async function checkStatus() {
  console.log('=== VERIFICAÇÃO DO STATUS DA META / WHATSAPP ===');
  console.log('Phone ID:', phoneId);
  console.log('WABA ID:', wabaId);

  // 1. Checar status da conta do WhatsApp (WABA)
  try {
    const resWaba = await fetch(`https://graph.facebook.com/v19.0/${wabaId}?fields=id,name,account_review_status,status,business_verification_status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataWaba = await resWaba.json();
    console.log('\n1. Status da Conta WABA (Artos Consultoria):');
    console.log(JSON.stringify(dataWaba, null, 2));

    if (dataWaba.account_review_status === 'APPROVED') {
      console.log('\n Conta Artos APROVADA pela Meta!');
    } else {
      console.log(`\n⏳ Conta Artos ainda em status: ${dataWaba.account_review_status}`);
    }
  } catch (e) {
    console.error('Erro ao consultar WABA:', e.message);
  }

  // 2. Checar status do número de telefone
  try {
    const resPhone = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataPhone = await resPhone.json();
    console.log('\n2. Status do Número de Telefone:');
    console.log(JSON.stringify(dataPhone, null, 2));
  } catch (e) {
    console.error('Erro ao consultar Telefone:', e.message);
  }
}

checkStatus();
