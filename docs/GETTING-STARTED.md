# Getting Started

## Pré-Requisitos

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en)

## Iniciando as dependências externas

Iniciar instância do Postgres

```
npm run dependencies:start
```

## Configurando variáveis de ambiente

Configurar variáveis de ambiente locais necessárias

```bash
echo GEMINI_API_KEY="sua_api_key" > .env
```


## Build da Aplicação

Instalação de dependências

```
npm ci
```

Gerar PrismaClient com base no schema

```
npm run generate
```

Aplicar migrations ao banco de dados

```
npm run migrate:deploy
```

Compilar a aplicação

```
npm run build
```

## Executando a Aplicação

Iniciando a aplicação

```
npm run start
```