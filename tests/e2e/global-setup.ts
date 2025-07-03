import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

async function globalSetup(_config: FullConfig) {
  // Charger les variables d'environnement
  dotenv.config({ path: '.env.local' });
  
  // Démarrer le serveur de développement si nécessaire
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Attendre que le serveur soit prêt
  try {
    await page.goto('http://localhost:5173');
    console.log('✅ Serveur de développement prêt');
  } catch (error) {
    console.log('⚠️ Serveur de développement non accessible, les tests vont le démarrer automatiquement');
  }
  
  await browser.close();
}

export default globalSetup; 