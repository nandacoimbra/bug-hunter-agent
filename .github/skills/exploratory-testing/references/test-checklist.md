# Checklist de Testes Exploratórios Pré-QA

Este documento define a esteira padrão de testes exploratórios que devem ser executados pelo Bug Hunter antes de liberar o sistema para a equipe de QA.

---

## 1. Responsividade e Quebra de Layout (Viewport Matrix)
Execute testes de renderização e overflow horizontal nas seguintes resoluções:
- **Mobile Pequeno / Médio:** 375x667 (iPhone SE / padrão iOS) e 390x844 (iPhone 12/13/14)
- **Tablet / iPad:** 768x1024 e 1024x768 (iPad portrait/landscape)
- **Desktop Médio / Padrão:** 1366x768 e 1920x1080 (Full HD)

### Regra Obrigatória de Resolução:
> **RESTORE VIEWPORT:** Ao finalizar os testes de responsividade, a resolução do navegador **DEVE SEMPRE ser restaurada para a resolução desktop padrão (1920x1080)** antes de prosseguir com qualquer outro teste.

### O que validar:
- Existência de scroll horizontal indesejado (`document.documentElement.scrollWidth > window.innerWidth`).
- Menu hambúrguer: abre, exibe links e fecha corretamente.
- Textos e títulos: quebras de linha estranhas, sobreposição (`z-index`) de elementos fixos.
- Imagens e banners que estouram a largura da tela.
- Capturar print em cada breakpoint.

---

## 2. Validação de Campos e Inputs
Para cada formulário ou tela com entradas de dados:

### 2.1 Campos Obrigatórios
- Tentar submeter o formulário vazio ou com campos em branco.
- Verificar mensagens de erro nativas (HTML5 validation) ou componentes visuais de erro.
- O campo recebe foco ou destaque visual vermelho?

### 2.2 Formatação de Dados e Máscaras
- **E-mail:** testar strings inválidas (`teste`, `teste@`, `teste@dominio`, `@dominio.com`).
- **Telefone / Celular:** testar preenchimento incompleto, letras em campos numéricos.
- **CPF / CNPJ / Documentos:** quando aplicável, testar dígitos repetidos ou inválidos.
- **Datas:** datas no futuro (quando proibidas), anos absurdos (ex: 1800 ou 2999).
- **Valores monetários / números:** caracteres especiais, números negativos.

### 2.3 Limites de Caracteres (Boundary Testing)
- Inserir textos muito longos (> 255 caracteres ou strings de teste com 500+ caracteres) para validar quebras de layout e truncamento adequado.
- Colar textos com espaços em branco no início e no fim (`trim` test).

### 2.4 Caracteres Especiais e Sanitização Básica
- Inserir aspas simples, aspas duplas, tags HTML (`<script>`, `<b>teste</b>`, `&'"<>`).
- Garantir que o sistema não crasha e sanitiza a exibição.

---

## 3. Validação de Formulários e Botões
- **Estados de Botão:**
  - Botão de envio desabilitado enquanto os campos obrigatórios não forem preenchidos (se essa for a regra).
  - Prevenção de duplo clique: após submissão, o botão exibe spinner/loading ou fica desabilitado temporariamente?
- **Feedback ao Usuário:**
  - Sucesso: toast, modal ou redirecionamento claro.
  - Erro: mensagem amigável, sem expor stacktrace do backend ou telas cruas de erro.
- **Links e Botões Quebrados:**
  - Links que apontam para `#`, rotas vazias ou páginas 404.
  - Botões que não disparam nenhuma ação ou evento visível.

---

## 4. Fluxo de Autenticação (Login)
> **REGRA FUNDAMENTAL:** Caso a aplicação necessite de login para acessar certas telas ou recursos:
> 1. O agente **NÃO deve tentar inventar credenciais sem permissão**.
> 2. Deve **perguntar interativamente ao usuário** se ele deseja:
>    - Realizar o login manualmente no navegador Playwright aberto;
>    - Fornecer credenciais de teste / cookies / token;
>    - Ou pular os testes que exigem autenticação (registrando-os na seção de "Testes Não Realizados").

---

## 5. Console & Network Diagnostics (Observações Relevantes)
Durante a navegação e execução:
- Coletar erros de console (`console.error`, uncaught exceptions).
- Coletar requisições de rede com falha (HTTP 4xx, 5xx).
- Verificar avisos graves de performance ou carregamento de recursos externos bloqueados (CORS, mixed content).
- Identificar ausência de labels de acessibilidade (`aria-label`, `<label>` órfãos).
