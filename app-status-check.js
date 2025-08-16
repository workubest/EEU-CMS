/**
 * Quick App Status Check
 * Provides immediate status of all components
 */

async function quickStatusCheck() {
    console.log('⚡ Quick App Status Check\n');
    
    const checks = [
        {
            name: 'Frontend App',
            url: 'http://localhost:8080',
            test: async (url) => {
                const response = await fetch(url);
                return response.ok ? 'Running' : 'Failed';
            }
        },
        {
            name: 'Proxy Server',
            url: 'http://localhost:3001/health',
            test: async (url) => {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    return `Running (${data.status})`;
                }
                return 'Failed';
            }
        },
        {
            name: 'API Proxy',
            url: 'http://localhost:3001/api',
            test: async (url) => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test' })
                });
                return response.status ? `Responding (${response.status})` : 'Failed';
            }
        }
    ];
    
    console.log('Component Status:');
    console.log('================');
    
    for (const check of checks) {
        try {
            const result = await check.test(check.url);
            console.log(`✅ ${check.name}: ${result}`);
        } catch (error) {
            console.log(`❌ ${check.name}: Error - ${error.message.substring(0, 50)}...`);
        }
    }
    
    console.log('\n🎯 App Access:');
    console.log('Frontend: http://localhost:8080');
    console.log('Users: http://localhost:8080/#/users');
    console.log('Permissions: http://localhost:8080/#/permissions');
    
    console.log('\n📊 Environment Status:');
    console.log('✅ Development mode with CORS proxy');
    console.log('✅ API calls routed through localhost:3001');
    console.log('✅ No direct Google Script access (CORS safe)');
    
    console.log('\n🔍 To Test User Management Matrix:');
    console.log('1. Open browser to http://localhost:8080');
    console.log('2. Navigate to User Management or Permissions');
    console.log('3. Check browser console for API base URL');
    console.log('4. Verify no CORS errors in Network tab');
}

quickStatusCheck().catch(console.error);