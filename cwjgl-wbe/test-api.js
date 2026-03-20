import http from 'http';

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test health
    console.log('1️⃣  Testing /api/health');
    let result = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log('');

    // Test session create
    console.log('2️⃣  Testing POST /api/chat/session/create');
    result = await makeRequest('POST', '/api/chat/session/create', {});
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    const sessionId = result.data?.data?.sessionId;
    console.log(`   Session ID: ${sessionId}`);
    console.log('');

    if (!sessionId) {
      console.error('❌ Failed to create session');
      return;
    }

    // Test get sessions
    console.log('3️⃣  Testing GET /api/chat/sessions');
    result = await makeRequest('GET', '/api/chat/sessions');
    console.log(`   Status: ${result.status}`);
    console.log(`   Sessions count:`, result.data?.data?.sessions?.length || 0);
    console.log('');

    // Test chat
    console.log('4️⃣  Testing POST /api/chat');
    result = await makeRequest('POST', '/api/chat', {
      sessionId: sessionId,
      message: '你好，请介绍一下你自己'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log('   ✅ Chat response received');
      console.log(`   Response length: ${JSON.stringify(result.data).length} bytes`);
    } else {
      console.log('   ❌ Chat request failed');
      console.log(`   Error: ${result.data?.msg || result.data}`);
    }
    console.log('');

    // Test history
    console.log('5️⃣  Testing GET /api/chat/history');
    result = await makeRequest('GET', `/api/chat/history?sessionId=${sessionId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Messages count:`, result.data?.data?.messages?.length || 0);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (err) {
    console.error('❌ Test error:', err.message);
  }

  process.exit(0);
}

testAPI();
