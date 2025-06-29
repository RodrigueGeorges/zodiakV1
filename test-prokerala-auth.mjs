// Test script for Prokerala API authentication
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const baseUrl = process.env.ASTRO_API_URL || process.env.VITE_ASTRO_API_URL;
const clientId = process.env.ASTRO_CLIENT_ID || process.env.VITE_ASTRO_CLIENT_ID;
const clientSecret = process.env.ASTRO_CLIENT_SECRET || process.env.VITE_ASTRO_CLIENT_SECRET;

console.log('🔍 Testing Prokerala API Authentication');
console.log('=====================================');
console.log('Base URL:', baseUrl);
console.log('Client ID:', clientId ? `${clientId.slice(0, 4)}***` : 'MISSING');
console.log('Client Secret:', clientSecret ? `${clientSecret.slice(0, 4)}***` : 'MISSING');

if (!baseUrl || !clientId || !clientSecret) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Test URL
const testUrl = `${baseUrl}/natal-chart?chart_type=western&datetime=1988-06-13T13:03:00&latitude=48.6137734&longitude=2.4818087&house_system=placidus&orb=default&birth_time_rectification=flat-chart&aspect_filter=major&la=en&ayanamsa=0`;

console.log('\n🌐 Test URL:', testUrl);

// Test different authentication methods
async function testAuth() {
  const methods = [
    {
      name: 'Basic Auth (client_id:client_secret)',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Bearer Token (client_secret as token)',
      headers: {
        'Authorization': `Bearer ${clientSecret}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'API Key Header',
      headers: {
        'X-API-Key': clientSecret,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Client ID Header',
      headers: {
        'X-Client-ID': clientId,
        'X-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      }
    }
  ];

  for (const method of methods) {
    console.log(`\n🧪 Testing: ${method.name}`);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: method.headers
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS! Response keys:', Object.keys(data));
        return method.name;
      } else {
        const errorText = await response.text();
        console.log('❌ Error:', errorText.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
  }
  
  return null;
}

testAuth().then(workingMethod => {
  if (workingMethod) {
    console.log(`\n🎉 Working method found: ${workingMethod}`);
  } else {
    console.log('\n💡 No working method found. Check your Prokerala credentials and API access.');
  }
}); 