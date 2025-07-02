// test/request.test.js
const { request, requestBodyOnly } = require('../index');

async function runTests() {
  try {
    console.log('🔍 Test: GET simple JSON');
    const body = await requestBodyOnly('https://jsonplaceholder.typicode.com/todos/1');
    if (!body || body.id !== 1) throw new Error('Invalid JSON response');
    console.log('✅ Passed');

    console.log('🔍 Test: GET with query');
    const { body: data } = await request('https://jsonplaceholder.typicode.com/comments', {
      query: { postId: 1 }
    });
    if (!Array.isArray(data) || data.length === 0) throw new Error('Query failed');
    console.log('✅ Passed');

    console.log('🔍 Test: POST with JSON body');
    const post = await requestBodyOnly('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { title: 'foo', body: 'bar', userId: 1 }
    });
    if (!post || !post.id) throw new Error('POST failed');
    console.log('✅ Passed');

    console.log('🎉 Semua test berhasil');
  } catch (err) {
    console.error('❌ Test gagal:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
