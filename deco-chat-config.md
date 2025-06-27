# Configuração do Apollo MCP no deco.chat

## 🎯 Resumo Rápido

Este MCP permite que seu agente no deco.chat acesse todas as funcionalidades da API do Apollo.io, incluindo busca de prospects, enriquecimento de dados e informações de empresas.

## 🔗 URL do MCP

Após fazer o deploy no Vercel, use esta URL:
```
https://seu-projeto.vercel.app
```

## 🛠️ Ferramentas Disponíveis

### 1. **people_search** - Busca de Pessoas
**Descrição:** Encontre prospects usando filtros avançados

**Parâmetros:**
- `q_keywords`: Palavras-chave para busca
- `page`: Número da página (padrão: 1)
- `per_page`: Resultados por página (máx: 100)
- `organization_domains`: Domínios das organizações
- `titles`: Cargos das pessoas
- `locations`: Localizações
- `seniority_levels`: Níveis de senioridade

**Exemplo de uso:**
```
Busque CEOs de startups de tecnologia em São Paulo
```

### 2. **people_enrich** - Enriquecimento de Pessoa
**Descrição:** Enriqueça dados de uma pessoa específica

**Parâmetros:**
- `first_name`: Primeiro nome
- `last_name`: Sobrenome
- `email`: Email
- `domain`: Domínio da empresa
- `reveal_personal_emails`: Revelar emails pessoais (boolean)
- `reveal_phone_number`: Revelar número de telefone (boolean)

**Exemplo de uso:**
```
Enriqueça os dados de Maria Silva que trabalha na empresa exemplo.com
```

### 3. **bulk_people_enrich** - Enriquecimento em Lote
**Descrição:** Enriqueça dados de até 10 pessoas simultaneamente

**Parâmetros:**
- `details`: Array com detalhes das pessoas
- `reveal_personal_emails`: Revelar emails pessoais (boolean)
- `reveal_phone_number`: Revelar número de telefone (boolean)

### 4. **organization_search** - Busca de Organizações
**Descrição:** Encontre empresas no banco de dados do Apollo

**Parâmetros:**
- `q_keywords`: Palavras-chave para busca
- `page`: Número da página (padrão: 1)
- `per_page`: Resultados por página (máx: 100)
- `organization_domains`: Domínios específicos
- `industries`: Indústrias
- `locations`: Localizações

**Exemplo de uso:**
```
Encontre empresas de SaaS com mais de 100 funcionários nos Estados Unidos
```

### 5. **organization_enrich** - Enriquecimento de Organização
**Descrição:** Enriqueça dados de uma organização pelo domínio

**Parâmetros:**
- `domain`: Domínio da organização (obrigatório)

**Exemplo de uso:**
```
Enriqueça os dados da empresa google.com
```

### 6. **bulk_organization_enrich** - Enriquecimento de Organizações em Lote
**Descrição:** Enriqueça dados de múltiplas organizações

**Parâmetros:**
- `domains`: Array de domínios das organizações

### 7. **organization_info** - Informações Completas
**Descrição:** Obtenha dados detalhados de uma organização pelo ID

**Parâmetros:**
- `id`: ID da organização (obrigatório)

## 📋 Passo a Passo para Configuração

### 1. Deploy no Vercel
1. Faça upload do código para o GitHub
2. Acesse https://vercel.com/
3. Importe o repositório
4. Configure a variável de ambiente `APOLLO_API_KEY`
5. Faça o deploy

### 2. Configuração no deco.chat
1. Acesse sua conta no deco.chat
2. Vá para as configurações do seu agente
3. Clique em "Adicionar Conexão"
4. Selecione "HTTP"
5. Cole a URL do Vercel
6. Salve a configuração

### 3. Teste as Ferramentas
Agora seu agente pode usar comandos como:
- "Busque CEOs de startups de tecnologia"
- "Enriqueça os dados de João Silva"
- "Encontre empresas de SaaS"

## 🎯 Casos de Uso Comuns

### Prospecção de Vendas
```
Busque diretores de marketing de empresas de e-commerce em São Paulo
```

### Enriquecimento de Lista
```
Enriqueça os dados de todos os contatos da minha lista de prospects
```

### Pesquisa de Mercado
```
Encontre empresas de fintech com mais de 50 funcionários
```

### Análise de Concorrência
```
Enriqueça os dados da empresa concorrente.com
```

## ⚠️ Limitações e Considerações

### Rate Limits
- O Apollo tem limites de taxa por minuto
- Aguarde entre requisições se necessário

### Créditos
- Cada operação consome créditos da sua conta Apollo
- Monitore o uso no dashboard do Apollo

### Dados Sensíveis
- Emails pessoais e telefones só são revelados se solicitado
- Use com responsabilidade e respeito à privacidade

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se a URL do MCP está correta
2. Confirme se a API key está configurada
3. Teste os endpoints diretamente no navegador
4. Consulte os logs do Vercel

## 📞 Contato

Para dúvidas sobre o MCP:
- Verifique a documentação da API do Apollo: https://docs.apollo.io/
- Consulte o README.md do projeto
- Teste localmente antes de usar em produção 