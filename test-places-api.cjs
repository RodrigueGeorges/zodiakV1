const https = require('https');

const url = 'https://zodiakv1.netlify.app/api/places?q=paris';

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);

  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Body (début):', data.slice(0, 200));
    try {
      const json = JSON.parse(data);
      console.log('✅ Réponse JSON valide');
    } catch (e) {
      console.log('❌ Réponse NON JSON (probablement HTML)');
    }
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('Erreur réseau:', e);
  process.exit(1);
});

// Timeout de sécurité
setTimeout(() => {
  console.error('❌ Timeout: aucune réponse reçue après 10s');
  process.exit(1);
}, 10000); 