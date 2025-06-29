import { test, expect } from '@playwright/test';

test.describe('Zodiak - Tests de Navigation', () => {
  test('Navigation entre les onglets principaux', async ({ page }) => {
    // 1. Accès à la page d'accueil
    await page.goto('/');
    
    // Vérifier que l'application se charge
    await expect(page.locator('body')).toBeVisible();
    
    // 2. Vérifier la présence des éléments de navigation
    const header = page.locator('header');
    const bottomNav = page.locator('nav[class*="fixed bottom-0"]');
    
    // Vérifier que la navigation est présente
    await expect(header).toBeVisible();
    await expect(bottomNav).toBeVisible();
    
    // 3. Vérifier les onglets dans le header
    const profileTab = page.locator('button:has-text("Profil")');
    const guidanceTab = page.locator('button:has-text("Guidance")');
    const natalTab = page.locator('button:has-text("Thème Natal")');
    
    await expect(profileTab).toBeVisible();
    await expect(guidanceTab).toBeVisible();
    await expect(natalTab).toBeVisible();
    
    // 4. Vérifier les onglets dans la navigation mobile
    const mobileProfileTab = page.locator('button:has-text("Profil")').nth(1);
    const mobileGuidanceTab = page.locator('button:has-text("Guidance")').nth(1);
    const mobileThemeTab = page.locator('button:has-text("Thème")');
    
    await expect(mobileProfileTab).toBeVisible();
    await expect(mobileGuidanceTab).toBeVisible();
    await expect(mobileThemeTab).toBeVisible();
  });

  test('Structure de l\'application', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier les éléments principaux
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[class*="fixed bottom-0"]')).toBeVisible();
    
    // Vérifier que le contenu principal se charge
    const mainContent = page.locator('main, div[class*="min-h-screen"]');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Zodiak - Parcours Utilisateur', () => {
  test('Onboarding, guidance automatique, profil et navigation', async ({ page }) => {
    // 1. Accès à la page d'accueil
    await page.goto('http://localhost:5173/');

    // 2. Authentification (remplace par un user de test)
    await page.click('text=Connexion');
    await page.fill('input[type="email"]', 'testuser@zodiak.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button:has-text("Se connecter")');
    await expect(page).toHaveURL(/profile|guidance/);

    // 3. Navigation vers la guidance
    await page.click('text=Guidance');
    await expect(page.locator('h2')).toContainText('Votre Guidance');

    // 4. Vérification de l'affichage automatique de la guidance du jour
    await expect(page.locator('text=Résumé du Jour')).toBeVisible();
    await expect(page.locator('text=Nouveau')).toBeVisible();

    // 5. Navigation vers le profil
    await page.click('text=Profil');
    await expect(page.locator('h2')).toContainText('Informations Personnelles');

    // 6. Modification du téléphone
    await page.click('button[aria-label="Modifier le profil"]');
    await page.fill('input#phone', '+33600000000');
    await page.click('button:has-text("Sauvegarder")');
    await expect(page.locator('text=Profil mis à jour')).toBeVisible();

    // 7. Test SMS
    await page.click('text=Tester l\'envoi');
    await expect(page.locator('text=SMS de test envoyé')).toBeVisible();

    // 8. Sécurité : accès guidance sans login
    await page.context().clearCookies();
    await page.goto('http://localhost:5173/guidance');
    await expect(page).toHaveURL(/login/);
  });
}); 