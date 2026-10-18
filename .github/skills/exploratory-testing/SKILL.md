---
name: exploratory-testing
description: 'Executa testes exploratórios automatizados pré-QA em qualquer sistema web via URL. Valida responsividade, campos, formulários, botões, console errors, salva scripts Playwright e gera relatório HTML com prints.'
argument-hint: 'URL do sistema web (ex: https://meusistema.com)'
user-invocable: true
disable-model-invocation: false
---

# Exploratory Testing Skill (Bug Hunter)

Habilidade especializada em executar testes exploratórios em aplicações web antes de encaminhar a versão para a equipe de QA.

## Recursos Integrados
- **Checklist detalhado de testes:** [test-checklist.md](./references/test-checklist.md)
- **Template HTML de relatório:** [report-template.html](./assets/report-template.html)

---

## 🚫 Restrições Rígidas (CRÍTICO)

1. **NÃO USE O NAVEGADOR DO VS CODE:**
   - Nunca chame ferramentas internas de browser do VS Code (`open_browser_page`, `click_element`, `read_page`, etc.).
   - Toda interação, navegação, captura de tela e validação deve ser realizada exclusivamente através do **Playwright MCP** (ex: `playwright/*`) ou executando scripts do Playwright via terminal.

2. **RESTAURAÇÃO OBRIGATÓRIA DE RESOLUÇÃO:**
   - Durante os testes de responsividade (mobile 375x667, tablet 768x1024), ao concluir a rodada de responsividade, **restaure imediatamente a resolução do viewport para Desktop padrão (1920x1080 ou 1280x720)** antes de continuar para os testes de formulários, campos ou botões.

3. **VERIFICAÇÃO DE LOGIN / AUTENTICAÇÃO:**
   - Se a página redirecionar para tela de login ou exigir autenticação para acessar as funcionalidades solicitadas:
     - **Pare imediatamente.**
     - Pergunte ao usuário (usando a ferramenta de perguntas ou chat interativo): *"O sistema exige login para continuar. Você deseja realizar o login manualmente no navegador ou fornecer credenciais, ou prefere pular os testes autenticados?"*
     - Respeite a decisão do usuário: se ele optar por pular, registre o teste como "Não Realizado / Bloqueado por Autenticação" no relatório.

4. **PERSISTÊNCIA DE SCRIPTS DE TESTE:**
   - Para cada novo teste ou conjunto de testes executado, gere e salve o script Playwright em `tests/scripts/<nome-do-teste>.spec.ts` ou `.js` na pasta do projeto. Isso permite que os testes sejam reutilizados pelo time de QA e CI/CD.

5. **GERAÇÃO DE RELATÓRIO FINAL:**
   - Salve os screenshots em `./reports/screenshots/`.
   - Gere o relatório preenchendo o template `./templates/report-template.html` (ou o template do asset) e salvando em `./reports/relatorio_<site>_<timestamp>.html`.

---

## Fluxo de Execução Passo a Passo

### Passo 1: Recebimento da URL e Planejamento
1. Obtenha a URL do sistema informada pelo usuário.
2. Crie as pastas de saída caso não existam:
   - `reports/screenshots/`
   - `tests/scripts/`
3. Planeje os cenários a executar seguindo o [test-checklist.md](./references/test-checklist.md).

### Passo 2: Testes de Responsividade (com reset de viewport)
1. Navegue até a URL em modo mobile (375x667):
   - Verifique overflow horizontal (`scrollWidth > innerWidth`).
   - Verifique visibilidade de menus e legibilidade de textos.
   - Tire print: `reports/screenshots/01_mobile_375.png`.
2. Altere o viewport para tablet (768x1024):
   - Avalie quebra de colunas e grids.
   - Tire print: `reports/screenshots/02_tablet_768.png`.
3. **RESTAURE O VIEWPORT PARA DESKTOP (1920x1080)**:
   - Tire print: `reports/screenshots/03_desktop_1920.png`.

### Passo 3: Mapeamento de Elementos e Validação de Campos
1. Identifique formulários, inputs de texto, e-mails, senhas, selects e checkboxes.
2. Testes de campos:
   - Tentativa de submissão em branco (validação de obrigatórios).
   - E-mail inválido (ex: `teste@invalido`).
   - Boundary tests (strings longas, caracteres especiais `<script>`, aspas).
   - Tire print dos feedbacks de erro: `reports/screenshots/04_field_validations.png`.

### Passo 4: Validação de Botões e Interações
1. Teste cliques em botões principais (CTA, envio, cancelar).
2. Valide feedback visual (estados loading/spinner, disabled).
3. Teste modais, dropdowns e abas.
4. Colete erros no console (`console.error`) ou respostas HTTP 4xx/5xx na aba de rede.

### Passo 5: Salvamento do Script do Teste (Playwright)
Crie um arquivo `.spec.ts` em `tests/scripts/` contendo o código Playwright modular dos testes realizados.

### Passo 6: Compilação do Relatório HTML
1. Leia o template `templates/report-template.html` ou `assets/report-template.html`.
2. Substitua os placeholders:
   - `{{SITE_NAME}}`: Nome ou domínio do site.
   - `{{SITE_URL}}`: URL testada.
   - `{{TEST_DATE}}`: Data e horário da execução.
   - `{{TEST_DURATION}}`: Tempo gasto nos testes.
   - `{{EXECUTED_BY}}`: "Bug Hunter (Playwright MCP)".
   - `{{OVERALL_STATUS}}`: "Aprovado para QA" ou "Atenção: Inconsistências Detectadas".
   - `{{STATUS_BADGE_CLASS}}`: `badge-approved`, `badge-warning` ou `badge-danger`.
   - `{{TOTAL_TESTS}}`, `{{PASSED_TESTS}}`, `{{FAILED_TESTS}}`, `{{SKIPPED_TESTS}}`.
   - `{{TESTS_EXECUTED_LIST}}`: HTML dos testes executados com status e prints.
   - `{{TESTS_SKIPPED_LIST}}`: HTML dos testes não executados com justificativa.
   - `{{OBSERVATIONS_LIST}}`: Logs de console, acessibilidade, feedback de UX.
   - `{{SCREENSHOTS_GALLERY}}`: Cards com miniatura dos prints capturados.
3. Salve o arquivo em `reports/relatorio_<site>_<timestamp>.html`.
4. Apresente ao usuário o resumo executivo no chat com o link direto para o relatório gerado.
