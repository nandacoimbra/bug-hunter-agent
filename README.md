# 🎯 Bug Hunter - Agente & Skill de Testes Exploratórios Pré-QA

O **Bug Hunter** foi projetado para atuar como uma barreira de qualidade automatizada antes de entregar aplicações web para a equipe de QA. Ele navega no sistema web alvo, realiza validações de responsividade, campos, formulários, botões, console errors, persiste os scripts de teste gerados e cria um relatório interativo com prints.

---

## 🔒 Regras de Negócio e Restrições Atendidas

1. **Sem Navegador do VS Code:** O agente é instruído e configurado para ignorar as ferramentas internas de browser do VS Code, operando exclusivamente via **Playwright MCP** ou scripts Playwright.
2. **Restauração de Resolução Pós-Responsividade:** Após testar mobile (375x667) e tablet (768x1024), o viewport é **obrigatoriamente restaurado para Desktop padrão (1920x1080)** antes de continuar para campos e formulários.
3. **Fluxo de Login Interativo:** Se a aplicação exigir autenticação, o agente interrompe o teste e pergunta ao usuário se ele deseja:
   - Fazer login manualmente no navegador;
   - Fornecer credenciais/tokens de teste;
   - Pular os testes protegidos por login (registrando-os como "Testes Não Realizados").
4. **Persistência de Scripts:** Cada bateria de testes executada gera um script Playwright standalone em `tests/scripts/<nome-do-teste>.spec.ts`, permitindo que o time de QA e CI/CD execute regressão no futuro.
5. **Relatório em HTML (com suporte a PDF):**
   - Escolhemos **HTML** por ser muito superior: não requer binários pesados de compilação de PDF, possui **zoom interativo em lightbox para as imagens**, filtros de status e já conta com regras `@media print` para ser exportado como PDF com `Cmd+P` / `Ctrl+P`.
   - O template base fica salvo em `templates/report-template.html` para reuso.

---

## 📁 Estrutura do Projeto

```text
Bug Hunter/
├── .github/
│   ├── agents/
│   │   └── bug-hunter.agent.md            # Definição do Agente Customizado (@bug-hunter)
│   └── skills/
│       └── exploratory-testing/
│           ├── SKILL.md                   # Definição da Skill (/exploratory-testing)
│           ├── assets/
│           │   └── report-template.html   # Template de relatório empacotado na Skill
│           └── references/
│               └── test-checklist.md      # Matriz completa de testes exploratórios
├── .vscode/
│   └── mcp.json                           # Configuração do MCP Server do Playwright
├── templates/
│   ├── report-template.html               # Template reutilizável do relatório final
│   └── test-template.spec.ts              # Template base para geração de scripts de teste
├── reports/                               # Diretório onde os relatórios gerados são salvos
│   └── screenshots/                       # Prints capturados durante os testes
├── tests/
│   └── scripts/                           # Scripts Playwright gerados automaticamente
├── package.json                           # Configuração do projeto para rodar testes
└── README.md
```

---

## 🚀 Como Usar

### Opção 1: Usando o Agente no VS Code Chat
1. No painel do VS Code Copilot Chat, selecione o agente **Bug Hunter** (ou digite `@bug-hunter`).
2. Digite a URL que deseja testar:
   ```text
   @bug-hunter Teste a aplicação web https://exemplo.com
   ```
3. O agente fará as validações de responsividade, resetará a tela para 1920x1080, validará campos e formulários, perguntará caso haja login, salvará o script em `tests/scripts/` e gerará o relatório em `reports/relatorio_<site>_<timestamp>.html`.

### Opção 2: Usando o Comando de Barra (Skill)
1. No chat, digite:
   ```text
   /exploratory-testing https://exemplo.com
   ```

---

## 📊 O Que Contém no Relatório Gerado

- **Nome do site testado e URL**
- **Data, horário e tempo de execução**
- **Testes Realizados:** Status (Passou/Falhou), detalhes técnicos e miniaturas com clique para ampliar (modal)
- **Testes Que Não Pôde Realizar:** Motivos transparentes (ex: login recusado, captcha, regra de negócio bloqueada)
- **Outros Pontos & Observações Pré-QA:**
  - Erros capturados no console JavaScript (`console.error`)
  - Requisições HTTP com erro (4xx / 5xx)
  - Problemas de usabilidade (ausência de spinner em botões, quebra de texto)
  - Alertas de acessibilidade básica (campos sem label)
- **Galeria Completa de Evidências:** Todos os screenshots capturados em ordem de execução.
