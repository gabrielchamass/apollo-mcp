// Exemplos de como testar o MCP do Apollo
// Execute este arquivo para testar os endpoints localmente

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Função auxiliar para fazer requisições
async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
  }
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes do Apollo MCP...\n');

  // 1. Testar se o servidor está funcionando
  console.log('1. Testando servidor...');
  await testEndpoint('/');

  // 2. Obter lista de ferramentas
  console.log('\n2. Obtendo lista de ferramentas...');
  await testEndpoint('/api/tools');

  // 3. Buscar pessoas (exemplo)
  console.log('\n3. Testando busca de pessoas...');
  await testEndpoint('/api/people/search', 'POST', {
    q_keywords: 'CEO',
    page: 1,
    per_page: 5,
    titles: ['CEO', 'Chief Executive Officer']
  });

  // 4. Enriquecer dados de uma pessoa (exemplo)
  console.log('\n4. Testando enriquecimento de pessoa...');
  await testEndpoint('/api/people/enrich', 'POST', {
    first_name: 'João',
    last_name: 'Silva',
    domain: 'exemplo.com',
    reveal_personal_emails: false,
    reveal_phone_number: false
  });

  // 5. Buscar organizações (exemplo)
  console.log('\n5. Testando busca de organizações...');
  await testEndpoint('/api/organizations/search', 'POST', {
    q_keywords: 'SaaS',
    page: 1,
    per_page: 5,
    industries: ['Software', 'Technology']
  });

  // 6. Enriquecer dados de uma organização (exemplo)
  console.log('\n6. Testando enriquecimento de organização...');
  await testEndpoint('/api/organizations/enrich', 'GET', {
    domain: 'google.com'
  });

  console.log('\n✅ Testes concluídos!');
}

// Executar testes se o arquivo for executado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint }; 