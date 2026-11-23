/**
 * 球小策 (QiuXiaoCe) 官方 MCP (Model Context Protocol) Server v0.2.0
 *
 * 官方主站: https://www.qiuxiaoce.com
 * 每日报告速览: https://www.qiuxiaoce.com/mei-ri-bao-gao-su-lan/
 * 开发者控制台: https://www.qiuxiaoce.com/data-account/
 */

const readline = require('readline');

const BASE_URL = 'https://www.qiuxiaoce.com/wp-json/abv2-creator/v1';

async function apiFetch(endpoint, params = {}) {
  let url = `${BASE_URL}/${endpoint.replace(/^\/+/, '')}`;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  }
  const qStr = query.toString();
  if (qStr) {
    url += (url.includes('?') ? '&' : '?') + qStr;
  }

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'QiuXiaoCe-MCP-Server/0.2.0'
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
    name: 'get_public_today_fixtures',
    description: '获取今日公开纯技战术赛程列表（免费免密钥，最多 60 场，支持按日期、联赛 ID、状态过滤）。',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: '可选日期 YYYY-MM-DD（默认今日）' },
        league_id: { type: 'number', description: '可选联赛 ID（如 39=英超, 140=西甲）' },
        status: { type: 'string', description: '可选状态过滤（如 NS, FT, LIVE）' },
        limit: { type: 'number', description: '返回条数上限（1-60）' }
      }
    }
  },
  {
    name: 'get_standings',
    description: '获取欧洲五大联赛及全球主流赛事实时积分榜数据（免费免密钥）。包含排名、球队中英文名、场次、胜平负、净胜球与积分。',
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
    description: '中英文足球俱乐部智能检索（免费免密钥）。返回球队官方规范 ID、中文译名、英文全称及国家。',
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
    description: '足球联赛与赛事检索（免费免密钥）。返回联赛 ID、中英文名称与国家。',
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
    name: 'get_topscorers',
    description: '获取指定联赛射手榜数据（免费免密钥）。',
    inputSchema: {
      type: 'object',
      properties: {
        league_id: { type: 'number', description: '联赛 ID，默认 39（英超）' },
        season: { type: 'number', description: '可选赛季起始年份' }
      },
      required: ['league_id']
    }
  },
  {
    name: 'get_topassists',
    description: '获取指定联赛助攻榜数据（免费免密钥）。',
    inputSchema: {
      type: 'object',
      properties: {
        league_id: { type: 'number', description: '联赛 ID，默认 39（英超）' },
        season: { type: 'number', description: '可选赛季起始年份' }
      },
      required: ['league_id']
    }
  },
  {
    name: 'get_team_form',
    description: '获取球队近期战绩走势与攻防均值统计（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        team_id: { type: 'number', description: '球队规范 ID' }
      },
      required: ['team_id']
    }
  },
  {
    name: 'get_h2h',
    description: '查询两支球队历史交锋战绩与攻防对比（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        home_team_id: { type: 'number', description: '主队 ID' },
        away_team_id: { type: 'number', description: '客队 ID' }
      },
      required: ['home_team_id', 'away_team_id']
    }
  },
  {
    name: 'get_match_pack',
    description: '获取旗舰单场技战术全景数据包，涵盖基本面、攻防均值、xG、伤停、球队排名与交锋汇总（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        fixture_id: { type: 'number', description: '比赛场次 ID' }
      },
      required: ['fixture_id']
    }
  },
  {
    name: 'get_fixture_stats',
    description: '获取单场比赛主客队全场技术统计（控球率、射门、角球、预期进球 xG 等，需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        fixture_id: { type: 'number', description: '比赛场次 ID' }
      },
      required: ['fixture_id']
    }
  },
  {
    name: 'get_fixture_lineups',
    description: '获取单场比赛双方首发阵容、阵型与替补名单（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        fixture_id: { type: 'number', description: '比赛场次 ID' }
      },
      required: ['fixture_id']
    }
  },
  {
    name: 'search_players',
    description: '按球员中文或英文姓名检索球员档案与 ID（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '球员姓名（至少 2 个字符）' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_today_digest',
    description: '获取今日重点赛事列表与赛程全景摘要（需 QIUXIAOCE_API_KEY）。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

function wrapText(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

async function handleToolCall(name, args) {
  switch (name) {
    case 'get_public_today_fixtures':
      return wrapText(await apiFetch('public/today-fixtures', {
        date: args?.date,
        league: args?.league_id,
        status: args?.status,
        limit: args?.limit
      }));
    case 'get_standings':
      return wrapText(await apiFetch('standings', {
        league: args?.league_id || 39,
        season: args?.season
      }));
    case 'search_teams':
      return wrapText(await apiFetch('teams', { q: args?.query }));
    case 'search_leagues':
      return wrapText(await apiFetch('leagues', { q: args?.query }));
    case 'get_topscorers':
      return wrapText(await apiFetch(`leagues/${args?.league_id || 39}/topscorers`, { season: args?.season }));
    case 'get_topassists':
      return wrapText(await apiFetch(`leagues/${args?.league_id || 39}/topassists`, { season: args?.season }));
    case 'get_team_form':
      return wrapText(await apiFetch(`teams/${args?.team_id}/form`));
    case 'get_h2h':
      return wrapText(await apiFetch('h2h', { home_id: args?.home_team_id, away_id: args?.away_team_id }));
    case 'get_match_pack':
      return wrapText(await apiFetch(`match-pack/${args?.fixture_id}`));
    case 'get_fixture_stats':
      return wrapText(await apiFetch(`fixtures/${args?.fixture_id}/stats`));
    case 'get_fixture_lineups':
      return wrapText(await apiFetch(`fixtures/${args?.fixture_id}/lineups`));
    case 'search_players':
      return wrapText(await apiFetch('players', { q: args?.query }));
    case 'get_today_digest':
      return wrapText(await apiFetch('today/digest'));
    default:
      throw new Error(`Tool not found: ${name}`);
  }
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
            version: '0.2.0'
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
