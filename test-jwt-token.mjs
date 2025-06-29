// Test script for Prokerala API with JWT token
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const baseUrl = process.env.ASTRO_API_URL || process.env.VITE_ASTRO_API_URL;
const jwtToken = process.env.PROKERALA_JWT_TOKEN; // Add this to your .env.local

console.log('🔍 Testing Prokerala API with JWT Token');
console.log('======================================');
console.log('Base URL:', baseUrl);
console.log('JWT Token:', jwtToken ? `${jwtToken.slice(0, 20)}***` : 'MISSING - Add PROKERALA_JWT_TOKEN to .env.local');

if (!baseUrl || !jwtToken) {
  console.error('❌ Missing JWT token. Add PROKERALA_JWT_TOKEN to your .env.local file');
  console.log('\n💡 Instructions:');
  console.log('1. Go to https://prokerala.com/account/api');
  console.log('2. Generate a JWT access token');
  console.log('3. Add to .env.local: PROKERALA_JWT_TOKEN=your_jwt_token_here');
  process.exit(1);
}

const testUrl = `${baseUrl}/natal-chart?chart_type=western&datetime=1988-06-13T13:03:00&latitude=48.6137734&longitude=2.4818087&house_system=placidus&orb=default&birth_time_rectification=flat-chart&aspect_filter=major&la=en&ayanamsa=0`;

console.log('\n🌐 Test URL:', testUrl);

async function testJWT() {
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Response keys:', Object.keys(data));
      console.log('Sample data:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testJWT(); 