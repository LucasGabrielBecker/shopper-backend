# Measurement system

---

# Visão Geral

O `Measurement system` é um serviço que gerencia a leitura individualizada de
consumo de água e gás. Para facilitar a coleta da informação, o serviço utiliza IA para
obter a medição através da foto de um medidor.

Features principais:

- Extração automática do valor do medidor utilizando IA
- Possibilidade de confirmar a leitura de um medidor


Para instruções de como executar a aplicação, verificar a seção [_`Getting Started`_](#getting-started).

## API Endpoints

Para informações detalhadas sobre requisições e respostas, bem como todos os endpoints disponíveis, verificar:

| Endpoint             | Method | Description                                 |
| -------------------- | ------ | ------------------------------------------- |
| `/upload  `          | POST   | Cria uma nova medição                       |
| `/confirm`           | PATCH  | Confirma uma medição existente              |
| `/:customer_code/list`| PATCH  | Lista medições de um determinado customer              |

### Health-Check

Para confirmar se o serviço está rodando, usar o endpoint raíz:

| Endpoint | Method | Description                                                    |
| -------- | ------ | -------------------------------------------------------------- |
| `/healthz`      | GET    | Reposta recebida com sucesso indica que o serviço está rodando |

# Relevância [CRÍTICO]

Se este serviço não estiver rodando:

- Os processos de medição de gás e água utilizando IA não estarão disponíveis.

# Sub-Componentes e Dependências Externas (Infraestrutura/Outros Serviços)

- [Postgres](https://www.postgresql.org/about/)

# Tecnologias

- **Linguagem de Programação**:

  - [**TypeScript**](https://www.typescriptlang.org/) (ver [tsconfig.json](./tsconfig.json)) com [Node.js](https://nodejs.dev/)

- **App Framework**:

    - **Server**: [Express](https://expressjs.com/)
    - **Request validation**: [zod](https://zod.dev/)

- **Persistência de Dados**:

  - [**Database Module**](./src/infraestructure/db/database.module.ts) com [Prisma Client](./src/infra/db/prisma/prisma-client.ts) usando [Prisma](https://www.prisma.io/)

- **Exceptions**:

  - [**Exceptions Customizadas**](./src/domain/exceptions/) com [ts-error](https://github.com/gfmio/ts-error)

- **Observability**:

  - [**Logger**](./src/logger.module.ts) com [Pino](https://getpino.io/#/)


- **Testing**

  - **Framework**: [jest](https://jestjs.io/) (ver [jest.config.json](./jest.config.json))
  - **Component testing**: [SuperTest](https://github.com/visionmedia/supertest#readme)

- **Code style**:

  - [**Prettier**](https://prettier.io/) (ver [.prettierrc](./.prettierrc))
  - [**ESLint**](https://eslint.org/) (ver [.eslintrc](./.eslintrc))

# Getting Started

Para iniciar a aplicação é rápido e simples, por favor seguir os passos [aqui](./docs/GETTING-STARTED.md).
