import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const TARGET_URL = 'https://daily-to-do-list-rho.vercel.app/';
const SCREENSHOT_DIR = path.resolve('reports/screenshots');

// Garantir que a pasta de screenshots existe
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('Testes Exploratórios Pré-QA - Daily To-Do List', () => {

  test('01. Responsividade e Quebra de Layout (Mobile, Tablet e Desktop com Viewport Reset)', async ({ page }) => {
    // 1. Mobile Pequeno / Médio (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const hasHorizontalOverflowMobile = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_mobile_375.png'), fullPage: true });
    expect(hasHorizontalOverflowMobile).toBeFalsy();

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const hasHorizontalOverflowTablet = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_tablet_768.png'), fullPage: true });
    expect(hasHorizontalOverflowTablet).toBeFalsy();

    // 3. RESTAURAÇÃO OBRIGATÓRIA PARA DESKTOP PADRÃO (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const hasHorizontalOverflowDesktop = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_1920.png'), fullPage: true });
    expect(hasHorizontalOverflowDesktop).toBeFalsy();
  });

  test('02. Validação de Submissão com Campo Vazio', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    let dialogMessage = '';
    page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const addButton = page.locator('.add-task-button');
    await addButton.click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_empty_input_validation.png') });
    expect(dialogMessage).toBe('digite o nome da tarefa');

    const tasksCount = await page.locator('.tasks .task-item').count();
    expect(tasksCount).toBe(0);
  });

  test('03. Validação de Submissão com Apenas Espaços em Branco (Whitespace Bug)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    let dialogTriggered = false;
    page.on('dialog', async dialog => {
      dialogTriggered = true;
      await dialog.accept();
    });

    const taskInput = page.locator('#add-task-input');
    await taskInput.fill('     ');
    const addButton = page.locator('.add-task-button');
    await addButton.click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_whitespace_input.png') });

    // Avaliar se uma tarefa vazia foi criada indevidamente por ausência de .trim()
    const tasksCount = await page.locator('.tasks .task-item').count();
    // Registra falha se aceitar whitespace
    expect(tasksCount, 'O sistema não deveria permitir criar tarefas compostas apenas de espaços em branco').toBe(0);
  });

  test('04. Boundary Testing - Texto Longo (300+ Caracteres)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const longText = 'Tarefa com texto excessivamente longo para teste de boundary ' + 'A'.repeat(250) + ' final do texto boundary';
    const taskInput = page.locator('#add-task-input');
    await taskInput.fill(longText);
    await page.locator('.add-task-button').click();

    const taskItem = page.locator('.tasks .task-item').first();
    await expect(taskItem).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_boundary_long_text.png') });

    // Validar se não estourou a largura do container
    const isOverflowing = await page.evaluate(() => {
      const el = document.querySelector('.task-text');
      return el ? el.scrollWidth > el.clientWidth : false;
    });
    expect(isOverflowing).toBeFalsy();
  });

  test('05. Sanitização de Caracteres Especiais e Prevenção de XSS', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    let xssExecuted = false;
    await page.exposeFunction('onXssExecuted', () => {
      xssExecuted = true;
    });

    const dangerousText = '<script>window.onXssExecuted && window.onXssExecuted();</script><b>Texto Negrito</b> & "aspas" \'simples\'';
    const taskInput = page.locator('#add-task-input');
    await taskInput.fill(dangerousText);
    await page.keyboard.press('Enter'); // Testa adição via teclado Enter

    const taskSpan = page.locator('.tasks .task-item .task-text').first();
    await expect(taskSpan).toBeVisible();

    // Validar se renderizou como texto puro e não como HTML interpretado
    const innerHtml = await taskSpan.innerHTML();
    expect(innerHtml).not.toContain('<b>');
    expect(xssExecuted).toBeFalsy();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_special_chars_xss.png') });
  });

  test('06. Fluxo Completo: Adicionar, Concluir, Editar e Excluir Tarefa', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // 1. Adicionar Tarefa Normal
    const taskInput = page.locator('#add-task-input');
    await taskInput.fill('Comprar café e frutas');
    await page.locator('.add-task-button').click();

    const taskItem = page.locator('.tasks .task-item').first();
    await expect(taskItem).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_task_added.png') });

    // 2. Marcar como Concluída
    const checkBtn = taskItem.locator('.checkTask');
    await checkBtn.click();
    await expect(taskItem).toHaveClass(/line/);
    await expect(checkBtn).toHaveClass(/marked/);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_task_completed.png') });

    // 3. Abrir Janela de Edição
    const editBtn = taskItem.locator('.edit-task');
    await editBtn.click();
    const editWindow = page.locator('#edit-window');
    await expect(editWindow).toHaveClass(/open/);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_task_edit_modal.png') });

    // Salvar alteração válida
    await page.locator('#edit-window-input').fill('Comprar café premium e frutas frescas');
    await page.locator('#btn-save-edit').click();
    await expect(editWindow).not.toHaveClass(/open/);

    const updatedText = await taskItem.locator('.task-text').textContent();
    expect(updatedText).toBe('Comprar café premium e frutas frescas');

    // 4. Excluir Tarefa com confirmação
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Deseja excluir a tarefa?');
      await dialog.accept();
    });

    const removeBtn = taskItem.locator('.remove-task');
    await removeBtn.click();
    await expect(page.locator('.tasks .task-item')).toHaveCount(0);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_task_deleted.png') });
  });

  test('07. Validação de Edição com Texto Vazio (Bug no Modal)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const taskInput = page.locator('#add-task-input');
    await taskInput.fill('Tarefa antes da edição vazia');
    await page.locator('.add-task-button').click();

    const taskItem = page.locator('.tasks .task-item').first();
    await taskItem.locator('.edit-task').click();

    // Limpar o input no modal e tentar salvar
    await page.locator('#edit-window-input').fill('');
    await page.locator('#btn-save-edit').click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_empty_edit_saved.png') });

    const currentText = await taskItem.locator('.task-text').textContent();
    // O sistema não deveria permitir salvar tarefa sem texto
    expect(currentText?.trim().length, 'Falha: O sistema permitiu salvar edição com texto vazio').toBeGreaterThan(0);
  });

  test('08. Persistência de Dados no LocalStorage após Reload', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Criar duas tarefas
    const taskInput = page.locator('#add-task-input');
    await taskInput.fill('Tarefa Persistente 1');
    await page.keyboard.press('Enter');

    await taskInput.fill('Tarefa Persistente 2');
    await page.keyboard.press('Enter');

    // Marcar primeira como concluída
    const firstTask = page.locator('.tasks .task-item').first();
    await firstTask.locator('.checkTask').click();

    // Recarregar a página
    await page.reload({ waitUntil: 'networkidle' });

    // Verificar se as duas tarefas foram restauradas com os mesmos estados
    const tasks = page.locator('.tasks .task-item');
    await expect(tasks).toHaveCount(2);

    const firstRestored = tasks.first();
    await expect(firstRestored).toHaveClass(/line/);

    const secondRestored = tasks.nth(1);
    await expect(secondRestored).not.toHaveClass(/line/);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_localstorage_persistence.png') });
  });

  test('09. Diagnóstico de Acessibilidade e Elementos Sem Label', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    // Avaliar botões sem texto acessível ou aria-label
    const accessibilityReport = await page.evaluate(() => {
      const issues: Array<{ type: string; selector?: string; id?: string }> = [];
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        const hasText = btn.innerText.trim().length > 0;
        const hasAria = btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby');
        const hasTitle = btn.getAttribute('title');
        if (!hasText && !hasAria && !hasTitle) {
          issues.push({
            type: 'button-no-accessible-name',
            selector: btn.className || btn.id || btn.tagName
          });
        }
      });

      const inputs = document.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])');
      inputs.forEach(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const hasAria = input.getAttribute('aria-label');
        if (!label && !hasAria) {
          issues.push({
            type: 'input-no-associated-label',
            id: input.id || input.name
          });
        }
      });

      return issues;
    });

    console.log('Problemas de Acessibilidade Encontrados:', JSON.stringify(accessibilityReport, null, 2));
    // Teste informativo
    expect(accessibilityReport.length).toBeGreaterThan(0);
  });
});
