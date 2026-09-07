#!/usr/bin/env node

const { startMcpServer } = require('../src/index.js');

startMcpServer().catch((err) => {
  console.error('Fatal MCP Error:', err);
  process.exit(1);
});
