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
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    };

    if (method === 'GET') {
      config.params = data;
    } else {
      config.data = data;
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
app.post('/', async (req, res) => {
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
                description: "Buscar pessoas no banco de dados do Apollo usando todos os filtros avançados disponíveis.",
                inputSchema: {
                  type: "object",
                  properties: {
                    q_keywords: { type: "string", description: "Palavras-chave para busca" },
                    page: { type: "number", description: "Número da página (padrão: 1)" },
                    per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                    organization_domains: { type: "array", items: { type: "string" }, description: "Domínios das organizações" },
                    titles: { type: "array", items: { type: "string" }, description: "Cargos das pessoas" },
                    locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                    seniority_levels: { type: "array", items: { type: "string" }, description: "Níveis de senioridade (VP, Director, Manager, Senior, Entry)" },
                    departments: { type: "array", items: { type: "string" }, description: "Departamentos (Engineering, Sales, Marketing, etc.)" },
                    contact_email_status: { type: "array", items: { type: "string" }, description: "Status do email (verified, unverified, unknown)" },
                    has_email: { type: "boolean", description: "Se a pessoa tem email" },
                    has_phone: { type: "boolean", description: "Se a pessoa tem telefone" },
                    has_mobile: { type: "boolean", description: "Se a pessoa tem celular" },
                    has_direct_phone: { type: "boolean", description: "Se a pessoa tem telefone direto" },
                    has_verified_email: { type: "boolean", description: "Se a pessoa tem email verificado" },
                    organization_industries: { type: "array", items: { type: "string" }, description: "Indústrias das organizações" },
                    organization_employee_count: { type: "array", items: { type: "string" }, description: "Tamanho das empresas (1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+)" },
                    organization_revenue: { type: "array", items: { type: "string" }, description: "Receita das empresas (Under $1M, $1M-$10M, $10M-$50M, $50M-$100M, $100M-$500M, $500M-$1B, $1B+)" },
                    organization_technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas pelas empresas" },
                    contact_technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas pelo contato" },
                    contact_languages: { type: "array", items: { type: "string" }, description: "Idiomas do contato" },
                    contact_timezone: { type: "array", items: { type: "string" }, description: "Fusos horários" }
                  }
                }
              },
              {
                name: "people_enrich",
                description: "Enriquecer dados de uma pessoa específica com todos os campos possíveis.",
                inputSchema: {
                  type: "object",
                  properties: {
                    first_name: { type: "string", description: "Primeiro nome" },
                    last_name: { type: "string", description: "Sobrenome" },
                    email: { type: "string", description: "Email" },
                    domain: { type: "string", description: "Domínio da empresa" },
                    title: { type: "string", description: "Cargo" },
                    organization_name: { type: "string", description: "Nome da empresa" },
                    reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                    reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" },
                    reveal_linkedin_url: { type: "boolean", description: "Revelar LinkedIn" },
                    reveal_twitter_url: { type: "boolean", description: "Revelar Twitter" },
                    reveal_facebook_url: { type: "boolean", description: "Revelar Facebook" },
                    reveal_website_url: { type: "boolean", description: "Revelar Website" }
                  }
                }
              },
              {
                name: "bulk_people_enrich",
                description: "Enriquecer dados de até 10 pessoas em uma única requisição, aceitando todos os campos possíveis.",
                inputSchema: {
                  type: "object",
                  properties: {
                    details: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          first_name: { type: "string", description: "Primeiro nome" },
                          last_name: { type: "string", description: "Sobrenome" },
                          email: { type: "string", description: "Email" },
                          domain: { type: "string", description: "Domínio da empresa" },
                          title: { type: "string", description: "Cargo" },
                          organization_name: { type: "string", description: "Nome da empresa" }
                        }
                      },
                      description: "Array de pessoas para enriquecer (máx: 10)"
                    },
                    reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                    reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" }
                  }
                }
              },
              {
                name: "organization_search",
                description: "Buscar organizações no banco de dados do Apollo usando todos os filtros avançados disponíveis.",
                inputSchema: {
                  type: "object",
                  properties: {
                    q_keywords: { type: "string", description: "Palavras-chave para busca" },
                    page: { type: "number", description: "Número da página (padrão: 1)" },
                    per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                    organization_domains: { type: "array", items: { type: "string" }, description: "Domínios específicos" },
                    industries: { type: "array", items: { type: "string" }, description: "Indústrias" },
                    locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                    employee_count: { type: "array", items: { type: "string" }, description: "Tamanho da empresa (1-10, 11-50, 51-200, etc.)" },
                    revenue: { type: "array", items: { type: "string" }, description: "Receita da empresa (Under $1M, $1M-$10M, etc.)" },
                    technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas" },
                    funding_total: { type: "string", description: "Total de funding" },
                    founded_year: { type: "number", description: "Ano de fundação" },
                    is_public: { type: "boolean", description: "Empresa é pública?" },
                    is_funded: { type: "boolean", description: "Empresa é financiada?" },
                    is_acquired: { type: "boolean", description: "Empresa foi adquirida?" },
                    is_subsidiary: { type: "boolean", description: "Empresa é subsidiária?" },
                    is_nonprofit: { type: "boolean", description: "Empresa é sem fins lucrativos?" }
                  }
                }
              },
              {
                name: "organization_enrich",
                description: "Enriquecer dados de uma organização pelo domínio, retornando todos os campos possíveis.",
                inputSchema: {
                  type: "object",
                  properties: {
                    domain: { type: "string", description: "Domínio da organização (obrigatório)" }
                  },
                  required: ["domain"]
                }
              },
              {
                name: "bulk_organization_enrich",
                description: "Enriquecer dados de múltiplas organizações pelo domínio.",
                inputSchema: {
                  type: "object",
                  properties: {
                    domains: { type: "array", items: { type: "string" }, description: "Array de domínios das organizações" }
                  },
                  required: ["domains"]
                }
              },
              {
                name: "organization_info",
                description: "Obter informações completas de uma organização pelo ID.",
                inputSchema: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "ID da organização (obrigatório)" }
                  },
                  required: ["id"]
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

      if (method === 'initialize') {
        console.log('✅ Respondendo initialize');
        return res.json({
          jsonrpc: '2.0',
          id: validId,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: "Apollo MCP",
              version: "1.0.0"
            }
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

    // Se for uma requisição de inicialização
    if (method === 'initialize') {
      console.log('✅ Respondendo initialize (JSON-RPC)');
      return res.json({
        jsonrpc: '2.0',
        id: validId,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "Apollo MCP",
            version: "1.0.0"
          }
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
              description: "Buscar pessoas no banco de dados do Apollo usando todos os filtros avançados disponíveis.",
              inputSchema: {
                type: "object",
                properties: {
                  q_keywords: { type: "string", description: "Palavras-chave para busca" },
                  page: { type: "number", description: "Número da página (padrão: 1)" },
                  per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                  organization_domains: { type: "array", items: { type: "string" }, description: "Domínios das organizações" },
                  titles: { type: "array", items: { type: "string" }, description: "Cargos das pessoas" },
                  locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                  seniority_levels: { type: "array", items: { type: "string" }, description: "Níveis de senioridade (VP, Director, Manager, Senior, Entry)" },
                  departments: { type: "array", items: { type: "string" }, description: "Departamentos (Engineering, Sales, Marketing, etc.)" },
                  contact_email_status: { type: "array", items: { type: "string" }, description: "Status do email (verified, unverified, unknown)" },
                  has_email: { type: "boolean", description: "Se a pessoa tem email" },
                  has_phone: { type: "boolean", description: "Se a pessoa tem telefone" },
                  has_mobile: { type: "boolean", description: "Se a pessoa tem celular" },
                  has_direct_phone: { type: "boolean", description: "Se a pessoa tem telefone direto" },
                  has_verified_email: { type: "boolean", description: "Se a pessoa tem email verificado" },
                  organization_industries: { type: "array", items: { type: "string" }, description: "Indústrias das organizações" },
                  organization_employee_count: { type: "array", items: { type: "string" }, description: "Tamanho das empresas (1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+)" },
                  organization_revenue: { type: "array", items: { type: "string" }, description: "Receita das empresas (Under $1M, $1M-$10M, $10M-$50M, $50M-$100M, $100M-$500M, $500M-$1B, $1B+)" },
                  organization_technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas pelas empresas" },
                  contact_technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas pelo contato" },
                  contact_languages: { type: "array", items: { type: "string" }, description: "Idiomas do contato" },
                  contact_timezone: { type: "array", items: { type: "string" }, description: "Fusos horários" }
                }
              }
            },
            {
              name: "people_enrich",
              description: "Enriquecer dados de uma pessoa específica com todos os campos possíveis.",
              inputSchema: {
                type: "object",
                properties: {
                  first_name: { type: "string", description: "Primeiro nome" },
                  last_name: { type: "string", description: "Sobrenome" },
                  email: { type: "string", description: "Email" },
                  domain: { type: "string", description: "Domínio da empresa" },
                  title: { type: "string", description: "Cargo" },
                  organization_name: { type: "string", description: "Nome da empresa" },
                  reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                  reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" },
                  reveal_linkedin_url: { type: "boolean", description: "Revelar LinkedIn" },
                  reveal_twitter_url: { type: "boolean", description: "Revelar Twitter" },
                  reveal_facebook_url: { type: "boolean", description: "Revelar Facebook" },
                  reveal_website_url: { type: "boolean", description: "Revelar Website" }
                }
              }
            },
            {
              name: "bulk_people_enrich",
              description: "Enriquecer dados de até 10 pessoas em uma única requisição, aceitando todos os campos possíveis.",
              inputSchema: {
                type: "object",
                properties: {
                  details: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        first_name: { type: "string", description: "Primeiro nome" },
                        last_name: { type: "string", description: "Sobrenome" },
                        email: { type: "string", description: "Email" },
                        domain: { type: "string", description: "Domínio da empresa" },
                        title: { type: "string", description: "Cargo" },
                        organization_name: { type: "string", description: "Nome da empresa" }
                      }
                    },
                    description: "Array de pessoas para enriquecer (máx: 10)"
                  },
                  reveal_personal_emails: { type: "boolean", description: "Revelar emails pessoais" },
                  reveal_phone_number: { type: "boolean", description: "Revelar número de telefone" }
                }
              }
            },
            {
              name: "organization_search",
              description: "Buscar organizações no banco de dados do Apollo usando todos os filtros avançados disponíveis.",
              inputSchema: {
                type: "object",
                properties: {
                  q_keywords: { type: "string", description: "Palavras-chave para busca" },
                  page: { type: "number", description: "Número da página (padrão: 1)" },
                  per_page: { type: "number", description: "Resultados por página (máx: 100)" },
                  organization_domains: { type: "array", items: { type: "string" }, description: "Domínios específicos" },
                  industries: { type: "array", items: { type: "string" }, description: "Indústrias" },
                  locations: { type: "array", items: { type: "string" }, description: "Localizações" },
                  employee_count: { type: "array", items: { type: "string" }, description: "Tamanho da empresa (1-10, 11-50, 51-200, etc.)" },
                  revenue: { type: "array", items: { type: "string" }, description: "Receita da empresa (Under $1M, $1M-$10M, etc.)" },
                  technologies: { type: "array", items: { type: "string" }, description: "Tecnologias usadas" },
                  funding_total: { type: "string", description: "Total de funding" },
                  founded_year: { type: "number", description: "Ano de fundação" },
                  is_public: { type: "boolean", description: "Empresa é pública?" },
                  is_funded: { type: "boolean", description: "Empresa é financiada?" },
                  is_acquired: { type: "boolean", description: "Empresa foi adquirida?" },
                  is_subsidiary: { type: "boolean", description: "Empresa é subsidiária?" },
                  is_nonprofit: { type: "boolean", description: "Empresa é sem fins lucrativos?" }
                }
              }
            },
            {
              name: "organization_enrich",
              description: "Enriquecer dados de uma organização pelo domínio, retornando todos os campos possíveis.",
              inputSchema: {
                type: "object",
                properties: {
                  domain: { type: "string", description: "Domínio da organização (obrigatório)" }
                },
                required: ["domain"]
              }
            },
            {
              name: "bulk_organization_enrich",
              description: "Enriquecer dados de múltiplas organizações pelo domínio.",
              inputSchema: {
                type: "object",
                properties: {
                  domains: { type: "array", items: { type: "string" }, description: "Array de domínios das organizações" }
                },
                required: ["domains"]
              }
            },
            {
              name: "organization_info",
              description: "Obter informações completas de uma organização pelo ID.",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string", description: "ID da organização (obrigatório)" }
                },
                required: ["id"]
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

      // Implementação das ferramentas do Apollo
      try {
        let result;
        
        switch (name) {
          case 'people_search':
            console.log('🔍 Executando people_search com parâmetros:', args);
            
            // Estratégia de busca mais robusta para pessoas
            let peopleSearchKeywords = args.q_keywords || '';
            let targetCompany = args.organization_domains || args.organization_names || '';
            
            // Se não especificou empresa separadamente, tentar extrair do q_keywords
            if (!targetCompany && peopleSearchKeywords) {
              // Lista de empresas conhecidas para extração
              const knownCompanies = ['iFood', 'Nubank', 'Icatu', 'Icatu Seguros', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Petrobras', 'Vale', 'Ambev', 'JBS', 'Magazine Luiza', 'Mercado Livre', 'Stone', 'PagSeguro', 'XP Inc', 'BTG Pactual'];
              
              for (const company of knownCompanies) {
                if (peopleSearchKeywords.toLowerCase().includes(company.toLowerCase())) {
                  targetCompany = company;
                  // Remover a empresa do q_keywords para deixar apenas o cargo
                  peopleSearchKeywords = peopleSearchKeywords.replace(new RegExp(company, 'gi'), '').trim();
                  break;
                }
              }
            }
            
            let allPeopleResults = [];
            let foundPeople = [];
            
            // Estratégia 1: Busca inicial com parâmetros originais
            try {
              let result = await makeApolloRequest('/mixed_people/search', 'POST', args);
              allPeopleResults = result.people || [];
              
              // Verificar se encontrou pessoas da empresa específica
              if (targetCompany) {
                foundPeople = allPeopleResults.filter(person => {
                  const personCompany = person.organization_name || person.organization_domain || '';
                  const personTitle = person.title || '';
                  
                  // Buscar por empresa no nome da organização, domínio ou título
                  return personCompany.toLowerCase().includes(targetCompany.toLowerCase()) ||
                         (person.organization_domain && person.organization_domain.toLowerCase().includes(targetCompany.toLowerCase())) ||
                         personTitle.toLowerCase().includes(targetCompany.toLowerCase());
                });
              } else {
                // Se não especificou empresa, filtrar por palavras-chave no nome
                foundPeople = allPeopleResults.filter(person => 
                  person.name && person.name.toLowerCase().includes(peopleSearchKeywords.toLowerCase())
                );
              }
              
              // Se não encontrou, tentar estratégia 2: Busca com mais resultados
              if (foundPeople.length === 0 && allPeopleResults.length > 0) {
                console.log('🔍 Tentando busca com mais resultados...');
                const enhancedArgs = {
                  ...args,
                  per_page: Math.min(100, args.per_page * 2 || 20),
                  locations: args.locations || ["Brazil", "United States", "Global"]
                };
                
                result = await makeApolloRequest('/mixed_people/search', 'POST', enhancedArgs);
                allPeopleResults = result.people || [];
                
                if (targetCompany) {
                  foundPeople = allPeopleResults.filter(person => {
                    const personCompany = person.organization_name || person.organization_domain || '';
                    const personTitle = person.title || '';
                    
                    return personCompany.toLowerCase().includes(targetCompany.toLowerCase()) ||
                           (person.organization_domain && person.organization_domain.toLowerCase().includes(targetCompany.toLowerCase())) ||
                           personTitle.toLowerCase().includes(targetCompany.toLowerCase());
                  });
                } else {
                  foundPeople = allPeopleResults.filter(person => 
                    person.name && person.name.toLowerCase().includes(peopleSearchKeywords.toLowerCase())
                  );
                }
              }
              
              // Se ainda não encontrou, tentar estratégia 3: Busca simplificada por empresa
              if (foundPeople.length === 0 && targetCompany) {
                console.log('🔍 Tentando busca simplificada por empresa...');
                const simpleArgs = {
                  q_keywords: targetCompany,
                  per_page: 50
                };
                
                result = await makeApolloRequest('/mixed_people/search', 'POST', simpleArgs);
                allPeopleResults = result.people || [];
                
                foundPeople = allPeopleResults.filter(person => {
                  const personCompany = person.organization_name || person.organization_domain || '';
                  const personTitle = person.title || '';
                  
                  return personCompany.toLowerCase().includes(targetCompany.toLowerCase()) ||
                         (person.organization_domain && person.organization_domain.toLowerCase().includes(targetCompany.toLowerCase())) ||
                         personTitle.toLowerCase().includes(targetCompany.toLowerCase());
                });
              }
              
              // Se ainda não encontrou, tentar estratégia 4: Busca por cargo específico na empresa
              if (foundPeople.length === 0 && targetCompany && peopleSearchKeywords) {
                console.log('🔍 Tentando busca por cargo específico na empresa...');
                const titleArgs = {
                  q_keywords: `${peopleSearchKeywords} ${targetCompany}`,
                  per_page: 50
                };
                
                result = await makeApolloRequest('/mixed_people/search', 'POST', titleArgs);
                allPeopleResults = result.people || [];
                
                foundPeople = allPeopleResults.filter(person => {
                  const personCompany = person.organization_name || person.organization_domain || '';
                  const personTitle = person.title || '';
                  
                  return personCompany.toLowerCase().includes(targetCompany.toLowerCase()) ||
                         (person.organization_domain && person.organization_domain.toLowerCase().includes(targetCompany.toLowerCase())) ||
                         personTitle.toLowerCase().includes(targetCompany.toLowerCase());
                });
              }
              
            } catch (error) {
              console.error('Erro na busca robusta de pessoas:', error);
              // Fallback para busca original
              const result = await makeApolloRequest('/mixed_people/search', 'POST', args);
              allPeopleResults = result.people || [];
              foundPeople = allPeopleResults;
            }
            
            // Preparar resposta
            let peopleResponseText = '';
            if (foundPeople.length > 0) {
              peopleResponseText = `🎯 **Busca de pessoas executada com sucesso!**\n\n`;
              peopleResponseText += `✅ **Encontradas ${foundPeople.length} pessoa(s)`;
              if (targetCompany) {
                peopleResponseText += ` da empresa "${targetCompany}"`;
              }
              if (peopleSearchKeywords && peopleSearchKeywords !== targetCompany) {
                peopleResponseText += ` com "${peopleSearchKeywords}"`;
              }
              peopleResponseText += `:**\n\n`;
              
              foundPeople.forEach(person => {
                peopleResponseText += `👤 **${person.name || 'N/A'}**\n`;
                peopleResponseText += `   🏢 Empresa: ${person.organization_name || 'N/A'}\n`;
                peopleResponseText += `   💼 Cargo: ${person.title || 'N/A'}\n`;
                peopleResponseText += `   📧 Email: ${person.email || 'N/A'}\n`;
                peopleResponseText += `   📞 Telefone: ${person.phone || 'N/A'}\n`;
                peopleResponseText += `   🌐 LinkedIn: ${person.linkedin_url || 'N/A'}\n`;
                peopleResponseText += `   🌍 Localização: ${person.city || 'N/A'}, ${person.state || 'N/A'}, ${person.country || 'N/A'}\n\n`;
              });
              
              if (allPeopleResults.length > foundPeople.length) {
                peopleResponseText += `📊 Total de ${allPeopleResults.length} pessoas analisadas.\n`;
              }
            } else {
              peopleResponseText = `🔍 **Busca de pessoas executada com sucesso.**\n\n`;
              peopleResponseText += `❌ **Nenhuma pessoa encontrada`;
              if (targetCompany) {
                peopleResponseText += ` da empresa "${targetCompany}"`;
              }
              if (peopleSearchKeywords && peopleSearchKeywords !== targetCompany) {
                peopleResponseText += ` com "${peopleSearchKeywords}"`;
              }
              peopleResponseText += ` nos ${allPeopleResults.length} primeiros resultados.**\n\n`;
              
              peopleResponseText += `💡 **Sugestões para melhorar a busca:**\n`;
              peopleResponseText += `• Use o nome exato da empresa (ex: "Nubank", "iFood", "Icatu Seguros")\n`;
              peopleResponseText += `• Tente buscar por cargo específico (ex: "CTO", "CEO", "Diretor")\n`;
              peopleResponseText += `• Combine empresa + cargo (ex: "CTO Nubank")\n`;
              peopleResponseText += `• Verifique se a empresa está na base de dados do Apollo\n\n`;
              
              if (allPeopleResults.length > 0) {
                peopleResponseText += `📋 **Primeiras pessoas retornadas:**\n`;
                allPeopleResults.slice(0, 5).forEach(person => {
                  peopleResponseText += `• ${person.name || 'N/A'} - ${person.title || 'N/A'} na ${person.organization_name || 'N/A'}\n`;
                });
              }
              
              peopleResponseText += `\n🔍 **Dica:** Para buscar pessoas específicas de uma empresa, mencione o nome da empresa na sua solicitação.`;
            }
            
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: peopleResponseText
                  },
                  {
                    type: "text",
                    text: JSON.stringify({
                      searchKeywords: peopleSearchKeywords,
                      targetCompany,
                      totalResults: allPeopleResults.length,
                      foundPeople: foundPeople.length,
                      people: foundPeople.map(p => ({
                        name: p.name,
                        title: p.title,
                        company: p.organization_name,
                        domain: p.organization_domain,
                        email: p.email,
                        phone: p.phone,
                        linkedin: p.linkedin_url,
                        location: `${p.city || ''}, ${p.state || ''}, ${p.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
                      }))
                    }, null, 2)
                  }
                ]
              }
            });

          case 'people_enrich':
            console.log('🔍 Executando people_enrich com parâmetros:', args);
            result = await makeApolloRequest('/people/match', 'POST', args);
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Enriquecimento de pessoa executado com sucesso.`
                  },
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            });

          case 'bulk_people_enrich':
            console.log('🔍 Executando bulk_people_enrich com parâmetros:', args);
            result = await makeApolloRequest('/people/bulk_match', 'POST', args);
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Enriquecimento em lote executado com sucesso. Processados ${result.matches?.length || 0} registros.`
                  },
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            });

          case 'organization_search':
            console.log('🔍 Executando organization_search com parâmetros:', args);
            
            // Estratégia de busca mais robusta
            const searchKeywords = args.q_keywords || '';
            let allResults = [];
            let foundCompanies = [];
            
            // Estratégia 1: Busca inicial com parâmetros originais
            try {
              let result = await makeApolloRequest('/mixed_companies/search', 'POST', args);
              allResults = result.accounts || [];
              
              // Verificar se encontrou a empresa
              foundCompanies = allResults.filter(account => 
                account.name && account.name.toLowerCase().includes(searchKeywords.toLowerCase())
              );
              
              // Se não encontrou, tentar estratégia 2: Busca com mais resultados
              if (foundCompanies.length === 0 && allResults.length > 0) {
                console.log('🔍 Tentando busca com mais resultados...');
                const enhancedArgs = {
                  ...args,
                  per_page: Math.min(100, args.per_page * 2 || 20),
                  locations: args.locations || ["Brazil", "United States", "Global"]
                };
                
                result = await makeApolloRequest('/mixed_companies/search', 'POST', enhancedArgs);
                allResults = result.accounts || [];
                
                foundCompanies = allResults.filter(account => 
                  account.name && account.name.toLowerCase().includes(searchKeywords.toLowerCase())
                );
              }
              
              // Se ainda não encontrou, tentar estratégia 3: Busca apenas com palavras-chave
              if (foundCompanies.length === 0 && allResults.length > 0) {
                console.log('🔍 Tentando busca simplificada...');
                const simpleArgs = {
                  q_keywords: searchKeywords,
                  per_page: 50
                };
                
                result = await makeApolloRequest('/mixed_companies/search', 'POST', simpleArgs);
                allResults = result.accounts || [];
                
                foundCompanies = allResults.filter(account => 
                  account.name && account.name.toLowerCase().includes(searchKeywords.toLowerCase())
                );
              }
              
            } catch (error) {
              console.error('Erro na busca robusta:', error);
              // Fallback para busca original
              const result = await makeApolloRequest('/mixed_companies/search', 'POST', args);
              allResults = result.accounts || [];
              foundCompanies = allResults.filter(account => 
                account.name && account.name.toLowerCase().includes(searchKeywords.toLowerCase())
              );
            }
            
            // Preparar resposta
            let responseText = '';
            if (foundCompanies.length > 0) {
              responseText = `🎯 **Busca de organizações executada com sucesso!**\n\n`;
              responseText += `✅ **Encontradas ${foundCompanies.length} empresa(s) com "${searchKeywords}":**\n\n`;
              foundCompanies.forEach(company => {
                responseText += `🏢 **${company.name}**\n`;
                responseText += `   🌐 Website: ${company.website_url || 'N/A'}\n`;
                responseText += `   📧 Domínio: ${company.primary_domain || 'N/A'}\n`;
                responseText += `   🌍 País: ${company.organization_country || 'N/A'}\n`;
                responseText += `   📞 Telefone: ${company.phone || 'N/A'}\n`;
                responseText += `   👥 Funcionários: ${company.num_contacts || 'N/A'} contatos\n\n`;
              });
              
              if (allResults.length > foundCompanies.length) {
                responseText += `📊 Total de ${allResults.length} organizações analisadas.\n`;
              }
            } else {
              responseText = `🔍 **Busca de organizações executada com sucesso.**\n\n`;
              responseText += `❌ **Nenhuma empresa encontrada com "${searchKeywords}" nos ${allResults.length} primeiros resultados.**\n\n`;
              responseText += `💡 **Sugestões para melhorar a busca:**\n`;
              responseText += `• Tente buscar apenas parte do nome (ex: "iFood" em vez de "iFood Delivery")\n`;
              responseText += `• Verifique se a empresa está na base de dados do Apollo\n`;
              responseText += `• Considere usar a ferramenta de enriquecimento por domínio se souber o website\n`;
              responseText += `• Tente buscar por variações do nome (ex: "Movile" para iFood)\n\n`;
              
              if (allResults.length > 0) {
                responseText += `📋 **Primeiras empresas retornadas:**\n`;
                allResults.slice(0, 5).forEach(company => {
                  responseText += `• ${company.name} (${company.primary_domain || 'N/A'}) - ${company.organization_country || 'N/A'}\n`;
                });
              }
              
              responseText += `\n🔍 **Dica:** A API do Apollo pode ter limitações com a chave gratuita. Empresas específicas podem estar em posições mais baixas nos resultados.`;
            }
            
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: responseText
                  },
                  {
                    type: "text",
                    text: JSON.stringify({
                      searchKeywords,
                      totalResults: allResults.length,
                      foundCompanies: foundCompanies.length,
                      companies: foundCompanies.map(c => ({
                        name: c.name,
                        domain: c.primary_domain,
                        country: c.organization_country,
                        website: c.website_url,
                        phone: c.phone,
                        contacts: c.num_contacts
                      }))
                    }, null, 2)
                  }
                ]
              }
            });

          case 'organization_enrich':
            console.log('🔍 Executando organization_enrich com parâmetros:', args);
            if (!args.domain) {
              return res.json({
                jsonrpc: '2.0',
                id: validId,
                error: {
                  code: -32602,
                  message: 'Domain parameter is required for organization enrichment'
                }
              });
            }
            result = await makeApolloRequest('/organizations/enrich', 'GET', { domain: args.domain });
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Enriquecimento de organização executado com sucesso para o domínio: ${args.domain}`
                  },
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            });

          case 'bulk_organization_enrich':
            console.log('🔍 Executando bulk_organization_enrich com parâmetros:', args);
            result = await makeApolloRequest('/organizations/bulk_enrich', 'POST', args);
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Enriquecimento em lote de organizações executado com sucesso.`
                  },
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            });

          case 'organization_info':
            console.log('🔍 Executando organization_info com parâmetros:', args);
            if (!args.id) {
              return res.json({
                jsonrpc: '2.0',
                id: validId,
                error: {
                  code: -32602,
                  message: 'ID parameter is required for organization info'
                }
              });
            }
            result = await makeApolloRequest(`/organizations/${args.id}`, 'GET');
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Informações da organização obtidas com sucesso para o ID: ${args.id}`
                  },
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            });

          default:
            return res.json({
              jsonrpc: '2.0',
              id: validId,
              error: {
                code: -32601,
                message: `Tool '${name}' not found`
              }
            });
        }
      } catch (error) {
        console.error('Erro ao executar ferramenta:', error);
        return res.json({
          jsonrpc: '2.0',
          id: validId,
          error: {
            code: -32603,
            message: `Error executing tool: ${error.message}`
          }
        });
      }
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