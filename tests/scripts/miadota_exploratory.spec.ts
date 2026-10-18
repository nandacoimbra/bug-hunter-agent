import { test, expect } from '@playwright/test';

/**
 * Suite de Testes Exploratórios Pré-QA - Miadota
 * Gerado por: Bug Hunter (Playwright Engine)
 * Alvo: https://miadota-seven.vercel.app/
 * Data: 2026-10-15
 */

test.describe('Testes Exploratórios - Miadota', () => {
  const TARGET_URL = 'https://miadota-seven.vercel.app';

  test.beforeEach(async ({ page }) => {
    // Monitorar erros e exceções não tratadas no console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error]: ${msg.text()}`);
      }
    });

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  test('01. Responsividade e Reset de Viewport (Mobile 375x667, Tablet 768x1024, Desktop 1920x1080)', async ({ page }) => {
    // 1. Mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'reports/screenshots/miadota_01_mobile_375.png', fullPage: true });

    const mobileScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(mobileScroll).toBeTruthy();

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'reports/screenshots/miadota_02_tablet_768.png', fullPage: true });

    // 3. RESTAURAÇÃO OBRIGATÓRIA DE VIEWPORT: Desktop (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'reports/screenshots/miadota_03_desktop_1920.png', fullPage: true });

    const currentViewport = page.viewportSize();
    expect(currentViewport).toEqual({ width: 1920, height: 1080 });
  });

  test('02. Menu Hamburguer no Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const toggler = page.locator('.navbar-toggler');
    await expect(toggler).toBeVisible();

    const collapseMenu = page.locator('#navbarScroll');
    await expect(collapseMenu).not.toHaveClass(/show/);

    await toggler.click();
    await expect(collapseMenu).toHaveClass(/show/);
    await page.screenshot({ path: 'reports/screenshots/miadota_04_mobile_nav_open.png' });

    // Restaurar viewport para desktop padrão
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('03. Formulário de Contato: Submissão Vazia e Atributos Obrigatórios', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const nomeInput = page.locator('#nome');
    const emailInput = page.locator('#email');
    const msgInput = page.locator('#msg');

    // Validação da ausência de 'required' nos campos (Bug encontrado)
    const isNomeRequired = await nomeInput.getAttribute('required');
    const isEmailRequired = await emailInput.getAttribute('required');
    const isMsgRequired = await msgInput.getAttribute('required');

    // Submissão vazia
    await page.click('.contact-button');
    await page.waitForLoadState('networkidle');

    // O sistema recarrega a página passando parâmetros vazios na URL
    expect(page.url()).toContain('?nome=&email=&mensagem=');
    await page.screenshot({ path: 'reports/screenshots/miadota_05_form_empty_submit.png' });

    // Registrar expectativa de qualidade: campos deveriam ser required
    console.log('Validação de campos obrigatórios:', { isNomeRequired, isEmailRequired, isMsgRequired });
  });

  test('04. Formulário de Contato: Validação de Formato de E-mail', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const emailInput = page.locator('#email');
    const inputType = await emailInput.getAttribute('type');

    // Detectar bug: campo de e-mail possui type="text" em vez de type="email"
    console.log('Tipo do campo de e-mail:', inputType);

    await page.fill('#nome', 'Carlos Eduardo');
    await page.fill('#email', 'email_sem_arroba_nem_dominio');
    await page.fill('#msg', 'Teste de e-mail sem validação de sintaxe');

    await page.click('.contact-button');
    await page.waitForLoadState('networkidle');

    // Submissão indevida aceita sem bloqueio
    expect(page.url()).toContain('email=email_sem_arroba_nem_dominio');
    await page.screenshot({ path: 'reports/screenshots/miadota_06_form_invalid_email.png' });
  });

  test('05. Formulário de Contato: Boundary Testing e Prevenção XSS', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const longText = 'A'.repeat(300);
    const xssString = '<script>alert("XSS")</script>';

    await page.fill('#nome', xssString);
    await page.fill('#email', 'teste@seguro.com');
    await page.fill('#msg', longText);

    await page.click('.contact-button');
    await page.waitForLoadState('networkidle');

    // O payload é repassado diretamente na query string da URL
    expect(page.url()).toContain('nome=%3Cscript%3Ealert');
    await page.screenshot({ path: 'reports/screenshots/miadota_07_form_boundary_xss.png' });
  });

  test('06. Verificação de Rotas e Links Internos (/adotar, /cadastro, /login)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const routesToCheck = [
      { name: 'Adotar', path: '/adotar', screenshot: 'miadota_08_404_adotar.png' },
      { name: 'Cadastrar Pet', path: '/cadastro', screenshot: 'miadota_09_404_cadastro.png' },
      { name: 'Login', path: '/login', screenshot: 'miadota_10_404_login.png' }
    ];

    for (const route of routesToCheck) {
      const response = await page.goto(TARGET_URL + route.path, { waitUntil: 'networkidle' });
      const status = response ? response.status() : 0;
      await page.screenshot({ path: `reports/screenshots/${route.screenshot}` });

      // Registro de falha: rotas retornam 404
      console.log(`Rota ${route.path} retornou status HTTP: ${status}`);
      expect(status).toBe(404);
    }
  });

  test('07. Acessibilidade e SEO Básico (Idioma e Imagens)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Verificar idioma do documento
    const htmlLang = await page.locator('html').getAttribute('lang');
    console.log('Idioma configurado na tag <html>:', htmlLang);

    // Verificar imagens sem texto alternativo
    const imagesWithoutAlt = await page.$$eval('img', imgs => {
      return imgs.filter(img => !img.getAttribute('alt') || img.getAttribute('alt')?.trim() === '').map(img => img.src);
    });
    console.log('Imagens sem alt válido:', imagesWithoutAlt);
  });
});
