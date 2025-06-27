const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuração da API do Apollo
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || 'Jq7TbdOPdpxHQOvdqHbEIQ';
const APOLLO_BASE_URL = 'https://api.apollo.io/api/v1';

// Função auxiliar para fazer requisições para a API do Apollo
async function makeApolloRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${APOLLO_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    };

    if (method === 'GET') {
      config.params = { ...data, api_key: APOLLO_API_KEY };
    } else {
      config.data = { ...data, api_key: APOLLO_API_KEY };
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Erro na requisição Apollo:', error.response?.data || error.message);
    throw error;
  }
}

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    jsonrpc: '2.0',
    id: 0,
    error: {
      code: -32603,
      message: 'Internal error'
    }
  });
});

// Rota principal para verificar se o MCP está funcionando
app.get('/', (req, res) => {
  res.json({
    message: 'Apollo MCP está funcionando!',
    version: '1.0.0',
    availableEndpoints: [
      '/api/people/search',
      '/api/people/enrich',
      '/api/people/bulk-enrich',
      '/api/organizations/search',
      '/api/organizations/enrich',
      '/api/organizations/bulk-enrich',
      '/api/organizations/info'
    ]
  });
});

// Rota POST na raiz para compatibilidade com deco.chat (JSON-RPC 2.0)
app.post('/', (req, res) => {
  try {
    console.log('📥 Requisição recebida:', JSON.stringify(req.body, null, 2));
    
    const { jsonrpc, id, method, params } = req.body || {};
    
    // Garantir que sempre temos um id válido (aceitar null e undefined)
    const validId = (id === null || id === undefined) ? 0 : id;
    
    console.log('🔍 Dados processados:', { jsonrpc, id, validId, method, params });
    
    // Se não tem jsonrpc, pode ser uma requisição diferente
    if (!jsonrpc) {
      console.log('⚠️ Requisição sem jsonrpc, tentando processar como MCP padrão');
      
      // Se tem method, pode ser uma requisição MCP
      if (method === 'tools/list') {
        console.log('✅ Respondendo tools/list');
        return res.json({
          jsonrpc: '2.0',
          id: validId,
          result: {
            tools: [
              {
                name: "people_search",
                description: "Buscar pessoas no banco de dados do Apollo usando filtros",
                inputSchema: {
                  type: "object",
                  properties: {
                    q_keywords: { type: "string", description: "Palavras-chave para busca" },
                    page: { type: "number", description: "Número da página (padrão: 1)" },
                    per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                    organization_domains: { type: "array", items: { type: "string" }, description: "Domínios das organizações" },
                    titles: { type: "array", items: { type: "string" }, description: "Cargos das pessoas" },
                    locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                    seniority_levels: { type: "array", items: { type: "string" }, description: "Níveis de senioridade" }
                  }
                }
              },
              {
                name: "people_enrich",
                description: "Enriquecer dados de uma pessoa específica",
                inputSchema: {
                  type: "object",
                  properties: {
                    first_name: { type: "string", description: "Primeiro nome" },
                    last_name: { type: "string", description: "Sobrenome" },
                    email: { type: "string", description: "Email" },
                    domain: { type: "string", description: "Domínio da empresa" },
                    reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                    reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" }
                  }
                }
              },
              {
                name: "organization_search",
                description: "Buscar organizações no banco de dados do Apollo",
                inputSchema: {
                  type: "object",
                  properties: {
                    q_keywords: { type: "string", description: "Palavras-chave para busca" },
                    page: { type: "number", description: "Número da página (padrão: 1)" },
                    per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                    organization_domains: { type: "array", items: { type: "string" }, description: "Domínios específicos" },
                    industries: { type: "array", items: { type: "string" }, description: "Indústrias" },
                    locations: { type: "array", items: { type: "string" }, description: "Localizações" }
                  }
                }
              },
              {
                name: "organization_enrich",
                description: "Enriquecer dados de uma organização pelo domínio",
                inputSchema: {
                  type: "object",
                  properties: {
                    domain: { type: "string", description: "Domínio da organização (obrigatório)" }
                  },
                  required: ["domain"]
                }
              }
            ]
          }
        });
      }
      
      if (method === 'tools/call') {
        console.log('✅ Respondendo tools/call');
        const { name, arguments: args } = params || {};
        
        if (!name) {
          return res.json({
            jsonrpc: '2.0',
            id: validId,
            error: {
              code: -32602,
              message: 'Invalid params: tool name is required'
            }
          });
        }

        return res.json({
          jsonrpc: '2.0',
          id: validId,
          result: {
            content: [
              {
                type: "text",
                text: `Ferramenta ${name} executada com sucesso. Parâmetros: ${JSON.stringify(args)}`
              }
            ]
          }
        });
      }
    }
    
    // Validar se é uma requisição JSON-RPC válida
    if (jsonrpc !== '2.0') {
      console.log('❌ JSON-RPC inválido:', jsonrpc);
      return res.json({
        jsonrpc: '2.0',
        id: validId,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      });
    }

    // Se for uma requisição de listagem de ferramentas
    if (method === 'tools/list') {
      console.log('✅ Respondendo tools/list (JSON-RPC)');
      return res.json({
        jsonrpc: '2.0',
        id: validId,
        result: {
          tools: [
            {
              name: "people_search",
              description: "Buscar pessoas no banco de dados do Apollo usando filtros",
              inputSchema: {
                type: "object",
                properties: {
                  q_keywords: { type: "string", description: "Palavras-chave para busca" },
                  page: { type: "number", description: "Número da página (padrão: 1)" },
                  per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                  organization_domains: { type: "array", items: { type: "string" }, description: "Domínios das organizações" },
                  titles: { type: "array", items: { type: "string" }, description: "Cargos das pessoas" },
                  locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                  seniority_levels: { type: "array", items: { type: "string" }, description: "Níveis de senioridade" }
                }
              }
            },
            {
              name: "people_enrich",
              description: "Enriquecer dados de uma pessoa específica",
              inputSchema: {
                type: "object",
                properties: {
                  first_name: { type: "string", description: "Primeiro nome" },
                  last_name: { type: "string", description: "Sobrenome" },
                  email: { type: "string", description: "Email" },
                  domain: { type: "string", description: "Domínio da empresa" },
                  reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                  reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" }
                }
              }
            },
            {
              name: "organization_search",
              description: "Buscar organizações no banco de dados do Apollo",
              inputSchema: {
                type: "object",
                properties: {
                  q_keywords: { type: "string", description: "Palavras-chave para busca" },
                  page: { type: "number", description: "Número da página (padrão: 1)" },
                  per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                  organization_domains: { type: "array", items: { type: "string" }, description: "Domínios específicos" },
                  industries: { type: "array", items: { type: "string" }, description: "Indústrias" },
                  locations: { type: "array", items: { type: "string" }, description: "Localizações" }
                }
              }
            },
            {
              name: "organization_enrich",
              description: "Enriquecer dados de uma organização pelo domínio",
              inputSchema: {
                type: "object",
                properties: {
                  domain: { type: "string", description: "Domínio da organização (obrigatório)" }
                },
                required: ["domain"]
              }
            }
          ]
        }
      });
    }

    // Se for uma requisição de execução de ferramenta
    if (method === 'tools/call') {
      console.log('✅ Respondendo tools/call (JSON-RPC)');
      const { name, arguments: args } = params || {};
      
      if (!name) {
        return res.json({
          jsonrpc: '2.0',
          id: validId,
          error: {
            code: -32602,
            message: 'Invalid params: tool name is required'
          }
        });
      }

      // Aqui você pode implementar a lógica para cada ferramenta
      // Por enquanto, retornamos uma resposta de sucesso
      return res.json({
        jsonrpc: '2.0',
        id: validId,
        result: {
          content: [
            {
              type: "text",
              text: `Ferramenta ${name} executada com sucesso. Parâmetros: ${JSON.stringify(args)}`
            }
          ]
        }
      });
    }

    // Método não reconhecido
    console.log('❌ Método não reconhecido:', method);
    return res.json({
      jsonrpc: '2.0',
      id: validId,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    });
  } catch (error) {
    console.error('Erro no processamento da requisição:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32603,
        message: 'Internal error'
      }
    });
  }
});

// Rota de teste específica para MCP
app.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'MCP Apollo está funcionando corretamente',
    timestamp: new Date().toISOString(),
    apiKey: APOLLO_API_KEY ? 'Configurada' : 'Não configurada'
  });
});

// Rota para verificar se a API do Apollo está acessível
app.get('/api/test', async (req, res) => {
  try {
    // Teste simples da API do Apollo
    const result = await makeApolloRequest('/organizations/enrich', 'GET', { domain: 'google.com' });
    res.json({
      status: 'success',
      message: 'API do Apollo está funcionando',
      testResult: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao testar API do Apollo',
      error: error.response?.data || error.message
    });
  }
});

// 1. People Search
app.post('/api/people/search', async (req, res) => {
  try {
    const searchData = req.body;
    console.log('People search request:', searchData);
    const result = await makeApolloRequest('/mixed_people/search', 'POST', searchData);
    res.json(result);
  } catch (error) {
    console.error('People search error:', error);
    res.status(500).json({
      error: 'Erro ao buscar pessoas',
      details: error.response?.data || error.message
    });
  }
});

// 2. People Enrichment
app.post('/api/people/enrich', async (req, res) => {
  try {
    const enrichData = req.body;
    console.log('People enrich request:', enrichData);
    const result = await makeApolloRequest('/people/match', 'POST', enrichData);
    res.json(result);
  } catch (error) {
    console.error('People enrich error:', error);
    res.status(500).json({
      error: 'Erro ao enriquecer dados da pessoa',
      details: error.response?.data || error.message
    });
  }
});

// 3. Bulk People Enrichment
app.post('/api/people/bulk-enrich', async (req, res) => {
  try {
    const bulkEnrichData = req.body;
    console.log('Bulk people enrich request:', bulkEnrichData);
    const result = await makeApolloRequest('/people/bulk_match', 'POST', bulkEnrichData);
    res.json(result);
  } catch (error) {
    console.error('Bulk people enrich error:', error);
    res.status(500).json({
      error: 'Erro ao enriquecer dados em lote',
      details: error.response?.data || error.message
    });
  }
});

// 4. Organization Search
app.post('/api/organizations/search', async (req, res) => {
  try {
    const searchData = req.body;
    console.log('Organization search request:', searchData);
    const result = await makeApolloRequest('/mixed_companies/search', 'POST', searchData);
    res.json(result);
  } catch (error) {
    console.error('Organization search error:', error);
    res.status(500).json({
      error: 'Erro ao buscar organizações',
      details: error.response?.data || error.message
    });
  }
});

// 5. Organization Enrichment
app.get('/api/organizations/enrich', async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) {
      return res.status(400).json({ error: 'Parâmetro domain é obrigatório' });
    }
    
    console.log('Organization enrich request for domain:', domain);
    const result = await makeApolloRequest('/organizations/enrich', 'GET', { domain });
    res.json(result);
  } catch (error) {
    console.error('Organization enrich error:', error);
    res.status(500).json({
      error: 'Erro ao enriquecer dados da organização',
      details: error.response?.data || error.message
    });
  }
});

// 6. Bulk Organization Enrichment
app.post('/api/organizations/bulk-enrich', async (req, res) => {
  try {
    const bulkEnrichData = req.body;
    console.log('Bulk organization enrich request:', bulkEnrichData);
    const result = await makeApolloRequest('/organizations/bulk_enrich', 'POST', bulkEnrichData);
    res.json(result);
  } catch (error) {
    console.error('Bulk organization enrich error:', error);
    res.status(500).json({
      error: 'Erro ao enriquecer dados de organizações em lote',
      details: error.response?.data || error.message
    });
  }
});

// 7. Get Complete Organization Info
app.get('/api/organizations/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Organization info request for ID:', id);
    const result = await makeApolloRequest(`/organizations/${id}`, 'GET');
    res.json(result);
  } catch (error) {
    console.error('Organization info error:', error);
    res.status(500).json({
      error: 'Erro ao obter informações completas da organização',
      details: error.response?.data || error.message
    });
  }
});

// Rota para obter informações sobre as ferramentas disponíveis (para MCP)
app.get('/api/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: "people_search",
        description: "Buscar pessoas no banco de dados do Apollo usando filtros",
        endpoint: "/api/people/search",
        method: "POST",
        parameters: {
          q_keywords: "Palavras-chave para busca",
          page: "Número da página (padrão: 1)",
          per_page: "Resultados por página (máx: 100)",
          organization_domains: "Domínios das organizações",
          titles: "Cargos das pessoas",
          locations: "Localizações",
          seniority_levels: "Níveis de senioridade"
        }
      },
      {
        name: "people_enrich",
        description: "Enriquecer dados de uma pessoa específica",
        endpoint: "/api/people/enrich",
        method: "POST",
        parameters: {
          first_name: "Primeiro nome",
          last_name: "Sobrenome",
          email: "Email",
          domain: "Domínio da empresa",
          reveal_personal_emails: "Revelar emails pessoais (boolean)",
          reveal_phone_number: "Revelar número de telefone (boolean)"
        }
      },
      {
        name: "bulk_people_enrich",
        description: "Enriquecer dados de até 10 pessoas em uma única requisição",
        endpoint: "/api/people/bulk-enrich",
        method: "POST",
        parameters: {
          details: "Array com detalhes das pessoas",
          reveal_personal_emails: "Revelar emails pessoais (boolean)",
          reveal_phone_number: "Revelar número de telefone (boolean)"
        }
      },
      {
        name: "organization_search",
        description: "Buscar organizações no banco de dados do Apollo",
        endpoint: "/api/organizations/search",
        method: "POST",
        parameters: {
          q_keywords: "Palavras-chave para busca",
          page: "Número da página (padrão: 1)",
          per_page: "Resultados por página (máx: 100)",
          organization_domains: "Domínios específicos",
          industries: "Indústrias",
          locations: "Localizações"
        }
      },
      {
        name: "organization_enrich",
        description: "Enriquecer dados de uma organização pelo domínio",
        endpoint: "/api/organizations/enrich",
        method: "GET",
        parameters: {
          domain: "Domínio da organização (obrigatório)"
        }
      },
      {
        name: "bulk_organization_enrich",
        description: "Enriquecer dados de múltiplas organizações",
        endpoint: "/api/organizations/bulk-enrich",
        method: "POST",
        parameters: {
          domains: "Array de domínios das organizações"
        }
      },
      {
        name: "organization_info",
        description: "Obter informações completas de uma organização pelo ID",
        endpoint: "/api/organizations/info/:id",
        method: "GET",
        parameters: {
          id: "ID da organização (obrigatório)"
        }
      }
    ]
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log('Rota não encontrada:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint não encontrado',
    method: req.method,
    url: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /test',
      'GET /api/test',
      'GET /api/tools',
      'POST /api/people/search',
      'POST /api/people/enrich',
      'POST /api/people/bulk-enrich',
      'POST /api/organizations/search',
      'GET /api/organizations/enrich',
      'POST /api/organizations/bulk-enrich',
      'GET /api/organizations/info/:id'
    ]
  });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Apollo MCP rodando na porta ${PORT}`);
    console.log(`📚 Documentação disponível em: http://localhost:${PORT}/api/tools`);
    console.log(`🔑 API Key configurada: ${APOLLO_API_KEY ? 'Sim' : 'Não'}`);
  });
}

module.exports = app; 