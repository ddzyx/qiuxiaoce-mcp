const { spawn } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, 'bin/cli.js');
const child = spawn('node', [cliPath]);

child.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (!line) continue;
    const msg = JSON.parse(line);
    console.log('Received MCP message:', msg.id, msg.result ? 'SUCCESS' : msg.error);
    if (msg.id === 2) {
      console.log('✅ Tools count:', msg.result.tools.length);
      console.log('🎉 MCP Server test passed!');
      child.kill();
      process.exit(0);
    }
  }
});

// 1. 发送 initialize
child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {} }
}) + '\n');

// 2. 发送 tools/list
child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
}) + '\n');
