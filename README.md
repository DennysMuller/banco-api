# urBanco API - Documentação

> **Nota:** Este repositório é um clone do projeto original criado pelo professor [Júlio de Lima](https://github.com/juliodelimas), utilizado para estudos do curso **Mentoria 2.0**.

## Visão Geral

O projeto é composto por duas APIs independentes que oferecem suporte a operações financeiras, com uma arquitetura baseada em REST e GraphQL.

- **API REST**: Roda na porta `3000` e gerencia endpoints de contas e transferências.
- **API GraphQL**: Roda na porta `3001` e fornece operações para consultas e mutações no domínio financeiro.

---

## Regras de Negócio

### Serviço de Contas

#### Regras para obter contas:

- A consulta de contas retorna uma lista paginada de contas, com um limite por página e uma página especificada.

#### Regras para obter conta por ID:

- A consulta de uma conta por ID deve retornar os detalhes da conta correspondente.

### Serviço de Autenticação de Usuário

#### Regras de autenticação:

- O nome de usuário e a senha são obrigatórios.
- O sistema valida se o nome de usuário e a senha fornecidos são corretos.
- Se as credenciais estiverem incorretas, o sistema retorna um erro informando que o usuário ou senha são inválidos.

#### Regras de geração de token:

- O token gerado deve ter um tempo de expiração de 1 hora.

#### Regras de verificação de token:

- O token de autenticação deve ser verificado para garantir que seja válido.
- Se o token for inválido ou expirado, o sistema retorna um erro de autenticação.

### Serviço de Transferências

#### Regras para realizar transferência:

- O valor mínimo para transferências é de R$10,00.
- Transferências acima de R$5.000,00 requerem um token de autenticação (token específico '123456').
- As contas de origem e destino devem estar ativas.
- A conta de origem deve ter saldo suficiente para realizar a transferência.

#### Regras para buscar transferências:

- As transferências podem ser consultadas de forma paginada, com limite de itens por página e página especificada.
- Deve ser possível consultar todas as transferências realizadas.

#### Regras para atualizar transferências:

- Transferências podem ser atualizadas, mas o valor de atualização não pode ser inferior a R$10,00.
- Deve ser validado se as contas de origem e destino existem e estão ativas.
- O saldo da conta de origem deve ser verificado antes de realizar a atualização.
- Transferências acima de R$5.000,00 também requerem autenticação.

#### Regras para modificar transferências:

- O valor de uma transferência pode ser modificado, mas o novo valor deve ser superior ou igual a R$10,00.
- As contas de origem e destino devem estar ativas e existir.
- O saldo das contas de origem e destino deve ser verificado antes da modificação.

#### Regras para remover transferências:

- A remoção de uma transferência deve reverter os saldos das contas de origem e destino.
- Caso a transferência não seja encontrada, o sistema retorna um erro.
- A conta de origem e a conta de destino devem existir e estar ativas.

#### Outras Regras Gerais

- Em todos os casos de falha (como saldo insuficiente ou contas inativas), o sistema deve retornar uma mensagem de erro detalhada e apropriada.
- As transferências são realizadas de forma síncrona e qualquer falha no processo de transferência gera um erro com uma mensagem explicativa.

## Pré-requisitos

Antes de iniciar, certifique-se de que você tenha as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- Gerenciador de pacotes npm (vem com o Node.js)

---

## Instruções de Configuração

### 1. Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=banco
JWT_SECRET=sua_chave_secreta
PORT=3000
GRAPHQLPORT=3001
API_URL="http://localhost:3000"
```

### 2. Inicialização do Banco de Dados

1. Crie o banco de dados e suas tabelas executando o script abaixo no MySQL:

   ```sql
   CREATE DATABASE banco;
   USE banco;

   CREATE TABLE contas (
       id INT AUTO_INCREMENT PRIMARY KEY,
       titular VARCHAR(100) NOT NULL,
       saldo DECIMAL(10, 2) NOT NULL,
       ativa BOOLEAN DEFAULT TRUE
   );

   CREATE TABLE transferencias (
       id INT AUTO_INCREMENT PRIMARY KEY,
       conta_origem_id INT NOT NULL,
       conta_destino_id INT NOT NULL,
       valor DECIMAL(10, 2) NOT NULL,
       data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
       autenticada BOOLEAN DEFAULT FALSE,
       FOREIGN KEY (conta_origem_id) REFERENCES contas(id),
       FOREIGN KEY (conta_destino_id) REFERENCES contas(id)
   );

   CREATE TABLE usuarios (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50) NOT NULL UNIQUE,
       senha VARCHAR(255) NOT NULL
   );
   ```
2. Verifique se as tabelas foram criadas corretamente:

   ```sql
   USE banco;
   SHOW TABLES;
   ```

---

## Instruções de Execução

### 1. Instalar Dependências

Execute o comando abaixo na raiz do projeto:

```bash
npm install
```

### 2. Executar APIs

- Para iniciar a **API REST**:
  ```bash
  npm run rest-api
  ```
- Para iniciar a **API GraphQL**:
  ```bash
  npm run graphql-api
  ```

---

## Serviços Disponíveis Após a Inicialização

### ApolloServer

Depois de iniciar a API GraphQL, o ApolloServer estará disponível na porta `3001`. Ele oferece uma interface interativa no endereço [http://localhost:3001/graphql](http://localhost:3001/graphql), onde é possível explorar o schema, testar queries e mutações, e visualizar resultados em tempo real.

O ApolloServer é uma biblioteca amplamente utilizada para implementar servidores GraphQL. Ele simplifica o desenvolvimento, fornecendo suporte para definir schemas, resolvers, autenticação, entre outros recursos.

### Swagger

Após a inicialização da API REST, a documentação interativa estará disponível no Swagger, no endereço [http://localhost:3000/api-docs](http://localhost:3000/api-docs). Essa documentação permite:

- Explorar os endpoints disponíveis.
- Testar requisições diretamente pelo navegador.
- Obter informações detalhadas sobre parâmetros, respostas e erros.

Para visualizar o Swagger, certifique-se de que a API REST esteja em execução.

---

## Estrutura do Projeto

```plaintext
project/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── contaModel.js
│   ├── services/
│   │   ├── contaService.js
│   │   ├── loginService.js
│   │   └── transferenciaService.js
│   └── utils/
│       └── errorHandler.js
├── rest/
│   ├── app.js
│   ├── controllers/
│   │   ├── contaController.js
│   │   ├── loginController.js
│   │   └── transferenciaController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── contaRoutes.js
│   │   ├── loginRoutes.js
│   │   └── transferenciaRoutes.js
├── graphql/
│   ├── app.js
│   ├── resolvers/
│   │   ├── index.js
│   │   ├── queryResolvers.js
│   │   └── mutationResolvers.js
│   ├── schema/
│   │   └── index.js
│   ├── typeDefs.js
├── config/
│   └── serverConfig.js
├── .env
├── package.json
└── README.md
```

---

## GraphQL API

### Endpoints

- URL da API GraphQL: `http://localhost:3001/graphql`

### Definições do Schema (`typeDefs`)

- **Queries**:
  - `contas`: Retorna a lista de contas.
  - `transferencias(page: Int, limit: Int)`: Retorna uma lista paginada de transferências.
- **Mutations**:
  - `login(username: String!, senha: String!)`: Autentica um usuário e retorna um token JWT.
  - `transferir(contaOrigem: Int!, contaDestino: Int!, valor: Float!, mfaToken: String!)`: Realiza uma transferência.

### Exemplo de Requisição com `curl`

#### Consulta de Contas

```bash
curl -X POST http://localhost:3001/graphql -H "Content-Type: application/json" -d '{"query": "{ contas { id titular saldo ativa } }"}'
```

#### Transferência de Fundos

```bash
curl -X POST http://localhost:3001/graphql -H "Content-Type: application/json" -d '{"query": "mutation { transferir(contaOrigem: 1, contaDestino: 2, valor: 100.0, mfaToken: \"123456\") }"}'
```

---

## REST API

### Endpoints

Base URL: `http://localhost:3000`

- **GET /contas**: Retorna todas as contas.
- **POST /login**: Realiza a autenticação de um usuário.
- **POST /transferencias**: Realiza uma transferência entre contas.
