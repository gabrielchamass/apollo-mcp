# Apollo MCP (Model Context Protocol)

Este é um MCP (Model Context Protocol) para integração com a API do Apollo.io, projetado para uso com o deco.chat.

## 🚀 Funcionalidades

O MCP oferece acesso completo às principais funcionalidades da API do Apollo.io:

### 👥 People (Pessoas)
- **Busca de Pessoas**: Encontre prospects usando filtros avançados
- **Enriquecimento Individual**: Enriqueça dados de uma pessoa específica
- **Enriquecimento em Lote**: Enriqueça dados de até 10 pessoas simultaneamente

### 🏢 Organizations (Organizações)
- **Busca de Organizações**: Encontre empresas no banco de dados do Apollo
- **Enriquecimento Individual**: Enriqueça dados de uma organização pelo domínio
- **Enriquecimento em Lote**: Enriqueça dados de múltiplas organizações
- **Informações Completas**: Obtenha dados detalhados de uma organização pelo ID

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Apollo.io com API Master Key
- Conta no Vercel (para deploy)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd apollo-mcp
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
APOLLO_API_KEY=Jq7TbdOPdpxHQOvdqHbEIQ
PORT=3000
```

### 4. Teste localmente
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🚀 Deploy no Vercel

### 1. Conecte ao Vercel
```bash
npm install -g vercel
vercel login
```

### 2. Configure a variável de ambiente no Vercel
```bash
vercel env add APOLLO_API_KEY
# Digite sua API key quando solicitado
```

### 3. Faça o deploy
```bash
vercel --prod
```

### 4. Obtenha a URL do MCP
Após o deploy, você receberá uma URL como:
`https://seu-projeto.vercel.app`

## 🔧 Endpoints Disponíveis

### Base URL
```
https://seu-projeto.vercel.app
```

### Endpoints

#### 👥 People Search
```
POST /api/people/search
```
**Parâmetros:**
- `q_keywords`: Palavras-chave para busca
- `page`: Número da página (padrão: 1)
- `per_page`: Resultados por página (máx: 100)
- `organization_domains`: Domínios das organizações
- `titles`: Cargos das pessoas
- `locations`: Localizações
- `seniority_levels`: Níveis de senioridade

#### 👤 People Enrichment
```
POST /api/people/enrich
```
**Parâmetros:**
- `first_name`: Primeiro nome
- `last_name`: Sobrenome
- `email`: Email
- `domain`: Domínio da empresa
- `reveal_personal_emails`: Revelar emails pessoais (boolean)
- `reveal_phone_number`: Revelar número de telefone (boolean)

#### 👥 Bulk People Enrichment
```
POST /api/people/bulk-enrich
```
**Parâmetros:**
- `details`: Array com detalhes das pessoas
- `reveal_personal_emails`: Revelar emails pessoais (boolean)
- `reveal_phone_number`: Revelar número de telefone (boolean)

#### 🏢 Organization Search
```
POST /api/organizations/search
```
**Parâmetros:**
- `q_keywords`: Palavras-chave para busca
- `page`: Número da página (padrão: 1)
- `per_page`: Resultados por página (máx: 100)
- `organization_domains`: Domínios específicos
- `industries`: Indústrias
- `locations`: Localizações

#### 🏢 Organization Enrichment
```
GET /api/organizations/enrich?domain=exemplo.com
```
**Parâmetros:**
- `domain`: Domínio da organização (obrigatório)

#### 🏢 Bulk Organization Enrichment
```
POST /api/organizations/bulk-enrich
```
**Parâmetros:**
- `domains`: Array de domínios das organizações

#### 🏢 Organization Info
```
GET /api/organizations/info/:id
```
**Parâmetros:**
- `id`: ID da organização (obrigatório)

## 📚 Documentação das Ferramentas

Para ver todas as ferramentas disponíveis e seus parâmetros:
```
GET /api/tools
```

## 🔗 Integração com deco.chat

### 1. Acesse o deco.chat
Faça login na sua conta do deco.chat

### 2. Configure o MCP
- Vá para as configurações do seu agente
- Adicione uma nova conexão HTTP
- URL: `https://seu-projeto.vercel.app`
- Tipo: HTTP

### 3. Use as ferramentas
Agora seu agente pode usar todas as funcionalidades do Apollo.io através das tool calls!

## 📝 Exemplos de Uso

### Buscar CEOs de startups de tecnologia
```json
{
  "q_keywords": "CEO",
  "organization_domains": ["startup.com", "tech.com"],
  "titles": ["CEO", "Chief Executive Officer"],
  "seniority_levels": ["C-Level"]
}
```

### Enriquecer dados de uma pessoa
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@empresa.com",
  "reveal_personal_emails": true,
  "reveal_phone_number": true
}
```

### Buscar organizações de SaaS
```json
{
  "q_keywords": "SaaS software",
  "industries": ["Software", "Technology"],
  "locations": ["United States"]
}
```

## 🔒 Segurança

- A API key do Apollo é armazenada como variável de ambiente
- Todas as requisições são validadas
- CORS configurado para permitir requisições do deco.chat
- Tratamento de erros robusto

## 🐛 Troubleshooting

### Erro 403 - Forbidden
- Verifique se sua API key está correta
- Confirme se você tem uma conta paga no Apollo (free plans não têm acesso à API)

### Erro 429 - Rate Limit
- O Apollo tem limites de taxa por minuto
- Aguarde alguns segundos antes de fazer nova requisição

### Erro 500 - Internal Server Error
- Verifique os logs do Vercel
- Confirme se todas as variáveis de ambiente estão configuradas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação da API do Apollo: https://docs.apollo.io/
2. Consulte os logs do Vercel
3. Teste os endpoints localmente primeiro

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes. 
