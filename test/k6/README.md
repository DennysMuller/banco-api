# Testes de Performance — Banco API (K6)

## Introdução

Este diretório reúne os testes de performance da **Banco API (REST)**, escritos em JavaScript e executados com o [Grafana K6](https://grafana.com/docs/k6/latest/).

Os testes avaliam o comportamento dos endpoints de **login** e **transferências** sob diferentes perfis de carga (iterações fixas, usuários virtuais constantes e rampas com `stages`), validando respostas com `checks` e critérios de aceite de desempenho com `thresholds` (taxa de erro e tempo de resposta: média, máximo, p90 e p95).

> Projeto de estudos da **Mentoria 2.0**, baseado no repositório original do professor Júlio de Lima: [juliodelimas/banco-api-performance](https://github.com/juliodelimas/banco-api-performance).

---

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| [JavaScript (ES Modules)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) | Linguagem dos scripts de teste |
| [Grafana K6](https://grafana.com/docs/k6/latest/) | Execução dos testes de carga, `checks` e `thresholds` |
| K6 Web Dashboard | Acompanhamento em tempo real e exportação do relatório HTML |
| [Node.js / npm](https://nodejs.org/) | Execução da API sob teste e script `npm run test-k6-rest` |
| Express + MySQL | Stack da API REST sob teste |

---

## Estrutura do repositório

Arquivos relacionados aos testes de performance:

```plaintext
banco-api/
├── config/
│   └── config.local.json                 # URL base padrão (fallback da BASE_URL)
├── fixtures/
│   ├── postLogin.json                    # Payload de login
│   └── postTransferencias.json           # Payload de transferência
├── helpers/
│   └── k6/
│       ├── autenticacao.js               # obterToken() com URL fixa (localhost:3000)
│       └── autenticacao.uso.de.util.js   # obterToken() usando obterBaseURL()
├── utils/
│   └── variaveis.js                      # obterBaseURL(): lê __ENV.BASE_URL ou config.local.json
└── test/
    └── k6/
        ├── README.md
        └── rest/
            ├── login/
            │   ├── login.test.js                          # 1000 iterações
            │   ├── login.com.virtual.users.test.js        # 20 VUs por 30s
            │   ├── login.com.stages.test.js               # Rampa com stages (URL fixa)
            │   └── login.com.stages.uso.de.util.test.js   # Rampa com stages (usa BASE_URL)
            └── transferencias/
                ├── transferencias.com.helpers.test.js               # Helper de token (URL fixa)
                └── transferencias.com.helpers.uso.de.util.test.js   # Usa BASE_URL
```

---

## Objetivo de cada grupo de arquivos

| Grupo | Objetivo |
|---|---|
| `test/k6/rest/**` | Scripts de teste. Cada arquivo define `options` (perfil de carga e `thresholds`) e a função `default` executada por cada usuário virtual. |
| `fixtures/` | Massa de dados (payloads JSON) carregada com `open()`, separando dados da lógica do teste. |
| `helpers/k6/` | Funções reutilizáveis entre testes — ex.: `obterToken()`, que autentica e retorna o JWT usado no header `Authorization`. |
| `utils/` | Utilitários de configuração — `obterBaseURL()` centraliza a URL da API a partir da variável de ambiente `BASE_URL`. |
| `config/` | Configuração local com a URL padrão, usada quando `BASE_URL` não é informada. |

Arquivos com sufixo `.uso.de.util` são as versões que obtêm a URL via `obterBaseURL()`; os demais usam `http://localhost:3000` fixo no código.

---

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) e npm
- MySQL com o banco `banco` criado (ver [README principal](../../README.md))
- [K6](https://grafana.com/docs/k6/latest/set-up/install-k6/) — versão 0.49 ou superior (necessária para o Web Dashboard)

### Passos

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/juliodelimas/banco-api-performance.git
   cd banco-api-performance
   npm install
   ```

2. Instale o K6:

   ```bash
   # Windows
   winget install k6 --source winget
   # ou: choco install k6

   # macOS
   brew install k6
   ```

   Confirme a instalação:

   ```bash
   k6 version
   ```

3. Configure o `.env` e o banco de dados conforme o [README principal](../../README.md) e suba a API REST:

   ```bash
   npm run rest-api
   ```

---

## Execução do projeto

> Execute os comandos a partir da **raiz do repositório**.

### Variável de ambiente `BASE_URL`

A URL da API é informada ao K6 pela variável `BASE_URL`, passada com a flag `-e` (ou `--env`):

```bash
k6 run -e BASE_URL=http://localhost:3000 test/k6/rest/login/login.com.stages.uso.de.util.test.js
```

Se `BASE_URL` não for informada, `obterBaseURL()` usa o valor de `baseURL` em `config/config.local.json`.

### Executar um teste específico

```bash
k6 run -e BASE_URL=http://localhost:3000 test/k6/rest/transferencias/transferencias.com.helpers.uso.de.util.test.js
```

### Executar todos os testes K6 (Windows)

```bash
npm run test-k6-rest
```

> Este script não repassa `BASE_URL`; os testes `.uso.de.util` usarão o fallback de `config/config.local.json`.

### Relatório em tempo real e exportação (Web Dashboard)

O K6 possui um dashboard web nativo, habilitado por variáveis de ambiente do próprio K6:

| Variável | Função |
|---|---|
| `K6_WEB_DASHBOARD=true` | Habilita o dashboard em tempo real em [http://localhost:5665](http://localhost:5665) |
| `K6_WEB_DASHBOARD_EXPORT=<arquivo>.html` | Exporta o relatório HTML ao final da execução |
| `K6_WEB_DASHBOARD_PERIOD=<tempo>` | (Opcional) Intervalo de atualização do dashboard — padrão `10s` |
| `K6_WEB_DASHBOARD_OPEN=true` | (Opcional) Abre o navegador automaticamente |

**Linux / macOS / Git Bash:**

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run -e BASE_URL=http://localhost:3000 test/k6/rest/login/login.com.stages.uso.de.util.test.js
```

**Windows (PowerShell):**

```powershell
$env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="html-report.html"; k6 run -e BASE_URL=http://localhost:3000 test/k6/rest/login/login.com.stages.uso.de.util.test.js
```

**Windows (CMD):**

```cmd
set "K6_WEB_DASHBOARD=true" && set "K6_WEB_DASHBOARD_EXPORT=html-report.html" && k6 run -e BASE_URL=http://localhost:3000 test/k6/rest/login/login.com.stages.uso.de.util.test.js
```

Durante a execução, acompanhe as métricas em [http://localhost:5665](http://localhost:5665). Ao final, o arquivo `html-report.html` é gerado na raiz do repositório (arquivos `*.html` já estão no `.gitignore`).
