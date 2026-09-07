/**
 * 球小策 (QiuXiaoCe) 官方 MCP (Model Context Protocol) Server
 * 
 * 官方主站: https://www.qiuxiaoce.com
 * 每日报告速览: https://www.qiuxiaoce.com/mei-ri-bao-gao-su-lan/
 */

const readline = require('readline');

const BASE_URL = 'https://www.qiuxiaoce.com/wp-json/abv2-creator/v1';

async function apiFetch(endpoint, params = {}) {
  let url = `${BASE_URL}/${endpoint.replace(/^\/+/, '')}`;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, v);
    }
  }
  const qStr = query.toString();
  if (qStr) {
    url += (url.includes('?') ? '&' : '?') + qStr;
  }

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'QiuXiaoCe-MCP-Server/0.1.0'
  };

  const apiKey = process.env.QIUXIAOCE_API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const resp = await fetch(url, { headers });
  if (!resp.ok && resp.status !== 200) {
    const errText = await resp.text();
    return { success: false, error: `HTTP ${resp.status}: ${errText}` };
  }
  return resp.json();
}

const TOOLS = [
  {
    name: 'get_standings',
    description: '获取欧洲五大联赛实时积分榜数据（免费开放）。包含排名、球队中英文名、场次、胜平负、积分等。',
    inputSchema: {
      type: 'object',
      properties: {
        league_id: {
          type: 'number',
          description: '联赛 ID。例如: 39 (英超), 140 (西甲), 135 (意甲), 78 (德甲), 61 (法甲)。默认 39。'
        },
        season: {
          type: 'number',
          description: '赛季起始年份（可选，如 2026）。'
        }
      }
    }
  },
  {
    name: 'search_teams',
    description: '中英文足球俱乐部与赛事智能检索（免费开放）。返回球队官方规范 ID、中文译名、英文全称及国家。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，如「曼联」、「阿森纳」、「Real Madrid」。'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'search_leagues',
    description: '足球联赛与赛事检索（免费开放）。返回联赛 ID、中英文名称与国家。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '赛事名称，如「英超」、「西甲」、「欧冠」。'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_today_digest',
    description: '获取今日重点足球赛事列表与彩票场次对应快讯。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function handleToolCall(name, args) {
  if (name === 'get_standings') {
    const lid = args?.league_id || 39;
    const season = args?.season;
    const res = await apiFetch('standings', { league: lid, season });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res, null, 2)
        }
      ]
    };
  }

  if (name === 'search_teams') {
    const res = await apiFetch('teams', { q: args.query });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res, null, 2)
        }
      ]
    };
  }

  if (name === 'search_leagues') {
    const res = await apiFetch('leagues', { q: args.query });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res, null, 2)
        }
      ]
    };
  }

  if (name === 'get_today_digest') {
    const res = await apiFetch('today/digest');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res, null, 2)
        }
      ]
    };
  }

  throw new Error(`Tool not found: ${name}`);
}

async function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const send = (msg) => {
    process.stdout.write(JSON.stringify(msg) + '\n');
  };

  rl.on('line', async (line) => {
    line = line.trim();
    if (!line) return;

    let req;
    try {
      req = JSON.parse(line);
    } catch {
      return;
    }

    const { id, method, params } = req;

    if (method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'qiuxiaoce-mcp',
            version: '0.1.0'
          }
        }
      });
      return;
    }

    if (method === 'notifications/initialized') {
      return;
    }

    if (method === 'tools/list') {
      send({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      });
      return;
    }

    if (method === 'tools/call') {
      try {
        const result = await handleToolCall(params?.name, params?.arguments || {});
        send({
          jsonrpc: '2.0',
          id,
          result
        });
      } catch (err) {
        send({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: err.message
          }
        });
      }
      return;
    }

    // 未知请求响应兜底
    if (id !== undefined) {
      send({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
    }
  });
}

module.exports = {
  startMcpServer,
  TOOLS
};
