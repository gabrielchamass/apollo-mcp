# 🚀 Deploy Rápido - Apollo MCP

## ⚡ Deploy em 5 Minutos

### 1. 📁 Prepare o Código
Todos os arquivos necessários já estão criados:
- ✅ `index.js` - Servidor principal
- ✅ `package.json` - Dependências
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `README.md` - Documentação

### 2. 🔗 Faça Upload para GitHub
```bash
# Se você não tem git instalado, use o GitHub Desktop ou faça upload manual

# Opção 1: GitHub Desktop
1. Abra o GitHub Desktop
2. Clique em "Add" → "Add existing repository"
3. Selecione a pasta "MCP Apollo"
4. Publique no GitHub

# Opção 2: Upload Manual
1. Acesse github.com
2. Crie um novo repositório chamado "apollo-mcp"
3. Faça upload de todos os arquivos
```

### 3. 🚀 Deploy no Vercel
1. Acesse: https://vercel.com/
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe o repositório `apollo-mcp`
5. Configure a variável de ambiente:
   - **Nome:** `APOLLO_API_KEY`
   - **Valor:** `Jq7TbdOPdpxHQOvdqHbEIQ`
6. Clique em "Deploy"

### 4. 🔗 Obtenha a URL
Após o deploy, você receberá uma URL como:
```
https://apollo-mcp-seu-usuario.vercel.app
```

### 5. ⚙️ Configure no deco.chat
1. Acesse sua conta no deco.chat
2. Vá para configurações do agente
3. Adicione conexão HTTP
4. Cole a URL do Vercel
5. Salve

## ✅ Teste Rápido

### Teste 1: Verificar se está funcionando
Acesse no navegador:
```
https://seu-projeto.vercel.app
```

Deve mostrar:
```json
{
  "message": "Apollo MCP está funcionando!",
  "version": "1.0.0"
}
```

### Teste 2: Ver ferramentas disponíveis
```
https://seu-projeto.vercel.app/api/tools
```

### Teste 3: Testar busca de pessoas
```bash
curl -X POST https://seu-projeto.vercel.app/api/people/search \
  -H "Content-Type: application/json" \
  -d '{"q_keywords": "CEO", "page": 1, "per_page": 5}'
```

## 🎯 Pronto para Usar!

Agora seu agente no deco.chat pode usar comandos como:
- "Busque CEOs de startups de tecnologia"
- "Enriqueça os dados de João Silva"
- "Encontre empresas de SaaS"

## 🆘 Se Algo Der Errado

### Erro: "Build failed"
- Verifique se o `package.json` está correto
- Confirme se o `vercel.json` está presente

### Erro: "API key inválida"
- Verifique se a variável `APOLLO_API_KEY` está configurada no Vercel
- Confirme se a API key está correta

### Erro: "CORS"
- O CORS já está configurado no código
- Verifique se a URL está correta no deco.chat

## 📞 Suporte

- 📖 Documentação completa: `README.md`
- 🔧 Setup detalhado: `SETUP.md`
- 🎯 Configuração deco.chat: `deco-chat-config.md`
- 📝 Exemplos práticos: `exemplos-deco-chat.md`

## 🎉 Parabéns!

Seu MCP do Apollo está pronto e funcionando! 🚀 