import { test, expect } from '@playwright/test';

/**
 * Script gerado automaticamente pelo Bug Hunter
 * Data: {{GENERATED_DATE}}
 * Alvo: {{TARGET_URL}}
 * Cenário: {{SCENARIO_NAME}}
 */

test.describe('Testes Exploratórios - {{SITE_NAME}}', () => {
  const TARGET_URL = '{{TARGET_URL}}';

  test.beforeEach(async ({ page }) => {
    // Monitorar erros no console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error]: ${msg.text()}`);
      }
    });

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  test('Responsividade: Mobile, Tablet e Desktop com Viewport Reset', async ({ page }) => {
    // 1. Mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'reports/screenshots/01_mobile.png', fullPage: true });
    
    // Validar ausência de scroll horizontal indesejado
    const hasHorizontalScrollMobile = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScrollMobile).toBeFalsy();

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'reports/screenshots/02_tablet.png', fullPage: true });

    // 3. RESTAURAR VIEWPORT PARA PADRÃO DESKTOP (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'reports/screenshots/03_desktop_normal.png' });
  });

  test('Validação de Formulários e Campos Obrigatórios', async ({ page }) => {
    // Restaurar viewport padrão
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Exemplo de submissão vazia
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.screenshot({ path: 'reports/screenshots/04_empty_form_submit.png' });
    }
  });
});
