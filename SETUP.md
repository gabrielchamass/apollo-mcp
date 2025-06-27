# Setup e Deploy do Apollo MCP

## 🔧 Instalação do Node.js

### Opção 1: Usando Homebrew (Recomendado)
```bash
# Instalar Homebrew primeiro (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node
```

### Opção 2: Download direto
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador

### Opção 3: Usando nvm (Node Version Manager)
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal ou executar
source ~/.zshrc

# Instalar Node.js
nvm install --lts
nvm use --lts
```

## 🚀 Deploy no Vercel (Sem Node.js local)

### 1. Faça upload do código para o GitHub
```bash
# Inicializar git (se não existir)
git init
git add .
git commit -m "Initial commit: Apollo MCP"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/apollo-mcp.git
git push -u origin main
```

### 2. Deploy via Vercel Dashboard
1. Acesse: https://vercel.com/
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório `apollo-mcp`
5. Configure as variáveis de ambiente:
   - Nome: `APOLLO_API_KEY`
   - Valor: `Jq7TbdOPdpxHQOvdqHbEIQ`
6. Clique em "Deploy"

### 3. Obtenha a URL do MCP
Após o deploy, você receberá uma URL como:
`https://apollo-mcp-seu-usuario.vercel.app`

## 🧪 Teste Local (Se tiver Node.js)

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar arquivo .env
```bash
echo "APOLLO_API_KEY=Jq7TbdOPdpxHQOvdqHbEIQ" > .env
echo "PORT=3000" >> .env
```

### 3. Executar servidor
```bash
npm start
```

### 4. Testar endpoints
```bash
# Testar se está funcionando
curl http://localhost:3000

# Ver ferramentas disponíveis
curl http://localhost:3000/api/tools
```

## 🔗 Configuração no deco.chat

### 1. Acesse o deco.chat
Faça login na sua conta

### 2. Configure o MCP
- Vá para as configurações do seu agente
- Adicione uma nova conexão HTTP
- URL: `https://apollo-mcp-seu-usuario.vercel.app`
- Tipo: HTTP

### 3. Teste as ferramentas
Agora seu agente pode usar:
- Busca de pessoas
- Enriquecimento de dados
- Busca de organizações
- E muito mais!

## 📝 Exemplos de Uso no deco.chat

### Buscar CEOs de startups
```
Busque CEOs de startups de tecnologia nos Estados Unidos
```

### Enriquecer dados de um contato
```
Enriqueça os dados de João Silva que trabalha na empresa exemplo.com
```

### Buscar empresas de SaaS
```
Encontre empresas de SaaS com mais de 100 funcionários
```

## 🐛 Troubleshooting

### Erro: "command not found: npm"
- Instale o Node.js seguindo as instruções acima

### Erro: "API key inválida"
- Verifique se a API key está correta
- Confirme se você tem uma conta paga no Apollo

### Erro: "Rate limit exceeded"
- Aguarde alguns segundos antes de fazer nova requisição
- O Apollo tem limites de taxa por minuto

### Erro no Vercel
- Verifique os logs no dashboard do Vercel
- Confirme se as variáveis de ambiente estão configuradas 