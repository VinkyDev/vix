import { MCPMarketCategory, MCPMarketTemplate } from "@/types/mcp";

/** MCP 市场分类数据 */
export const mcpCategories: MCPMarketCategory[] = [
  {
    id: 'development',
    name: '开发工具',
    description: '代码管理、版本控制等开发相关工具',
    icon: '💻'
  },
  {
    id: 'productivity',
    name: '生产力工具',
    description: '文档处理、任务管理等提升效率的工具',
    icon: '⚡'
  },
  {
    id: 'ai',
    name: 'AI 助手',
    description: '人工智能相关的服务和工具',
    icon: '🤖'
  },
  {
    id: 'integration',
    name: '集成服务',
    description: '第三方平台和服务的集成',
    icon: '🔗'
  }
];

/** MCP 市场模板数据 */
export const mcpTemplates: MCPMarketTemplate[] = [
  {
    id: 'github',
    name: 'github',
    displayName: 'GitHub',
    description: 'GitHub 仓库管理工具，支持查看仓库信息、创建 issues、管理 PR 等功能',
    icon: '🐙',
    category: 'development',
    tags: ['代码托管', 'Git', '版本控制', '协作'],
    version: '1.0.0',
    author: 'Model Context Protocol',
    repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    documentation: 'https://github.com/modelcontextprotocol/servers/blob/main/src/github/README.md',
    template: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {}
    },
    params: [
      {
        key: 'GITHUB_PERSONAL_ACCESS_TOKEN',
        label: 'GitHub Personal Access Token',
        description: '用于访问 GitHub API 的个人访问令牌',
        type: 'string',
        position: 'env',
        required: true,
        placeholder: 'github_pat_xxx...',
        validation: {
          pattern: '^github_pat_[a-zA-Z0-9_]+$',
          message: '请输入有效的 GitHub Personal Access Token'
        }
      }
    ],
    features: [
      '查看仓库信息',
      '创建和管理 Issues',
      '管理 Pull Requests',
      '查看提交历史',
      '搜索代码',
      '管理分支'
    ],
    popular: true,
    official: true,
    guide: {
      title: '如何获取 GitHub Personal Access Token',
      description: '配置 GitHub 服务需要一个个人访问令牌来访问 GitHub API',
      steps: [
        '登录 GitHub 账户',
        '点击右上角头像，选择 "Settings"',
        '在左侧菜单中点击 "Developer settings"',
        '选择 "Personal access tokens" → "Tokens (classic)"',
        '点击 "Generate new token" → "Generate new token (classic)"',
        '输入 token 名称，选择过期时间',
        '勾选所需权限（建议至少选择 repo、read:user）',
        '点击 "Generate token" 并复制生成的 token'
      ],
      links: [
        {
          text: '官方文档：创建个人访问令牌',
          url: 'https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
        }
      ]
    }
  },
  {
    id: 'context7',
    name: 'context7',
    displayName: 'Context7',
    description: '基于 Upstash 的智能上下文管理服务，提供高效的对话上下文存储和检索',
    icon: '🧠',
    category: 'ai',
    tags: ['上下文管理', 'AI', '智能检索', '云服务'],
    version: '1.0.0',
    author: 'Upstash',
    repository: 'https://github.com/upstash/context7-mcp',
    documentation: 'https://github.com/upstash/context7-mcp#readme',
    template: {
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
      env: {}
    },
    params: [],
    features: [
      '智能上下文存储',
      '快速上下文检索',
      '多会话管理',
      '云端同步',
      '零配置启动'
    ],
    popular: true,
    official: false
  },
  {
    id: 'filesystem',
    name: 'filesystem',
    displayName: '文件系统',
    description: '本地文件系统访问工具，支持文件读写、目录管理等基础文件操作',
    icon: '📁',
    category: 'productivity',
    tags: ['文件管理', '本地存储', '文件操作'],
    version: '1.0.0',
    author: 'Model Context Protocol',
    repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    documentation: 'https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/README.md',
    template: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem'],
      env: {}
    },
    params: [
      {
        key: 'ALLOWED_DIRECTORIES',
        label: '允许访问的目录',
        description: '指定允许访问的目录路径，多个路径用逗号分隔',
        type: 'string',
        position: 'args',
        required: true,
        multiple: true,
        separator: ',',
        placeholder: '/home/user/documents,/home/user/projects',
        validation: {
          message: '请输入有效的目录路径'
        }
      }
    ],
    features: [
      '读取文件内容',
      '写入文件',
      '创建目录',
      '删除文件和目录',
      '列出目录内容',
      '文件权限管理'
    ],
    popular: false,
    official: true,
    guide: {
      title: '如何配置允许访问的目录',
      description: '配置文件系统服务需要指定允许访问的目录路径',
      steps: [
        '确定需要 MCP 服务访问的目录路径',
        '使用绝对路径（如 /home/user/documents）',
        'Windows 系统使用反斜杠（如 C:\\Users\\username\\Documents）',
        '多个目录用英文逗号分隔',
        '建议只授权必要的目录以确保安全性'
      ]
    }
  },
  {
    id: 'brave-search',
    name: 'brave-search',
    displayName: 'Brave Search',
    description: 'Brave Search API 集成，提供隐私友好的网络搜索功能',
    icon: '🔍',
    category: 'integration',
    tags: ['搜索', '隐私', 'API', '网络'],
    version: '1.0.0',
    author: 'Model Context Protocol',
    repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    documentation: 'https://github.com/modelcontextprotocol/servers/blob/main/src/brave-search/README.md',
    template: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {}
    },
    params: [
      {
        key: 'BRAVE_API_KEY',
        label: 'Brave Search API Key',
        description: '从 Brave Search API 获取的 API 密钥',
        type: 'string',
        position: 'env',
        required: true,
        placeholder: 'BSA-xxx...',
        validation: {
          pattern: '^BSA-[a-zA-Z0-9]+$',
          message: '请输入有效的 Brave Search API Key'
        }
      }
    ],
    features: [
      '网络搜索',
      '新闻搜索',
      '图片搜索',
      '视频搜索',
      '隐私保护',
      '实时结果'
    ],
    popular: false,
    official: true,
    guide: {
      title: '如何获取 Brave Search API Key',
      description: '配置 Brave Search 服务需要一个 API 密钥来访问搜索 API',
      steps: [
        '访问 Brave Search API 官方网站',
        '点击 "Get API Key" 或 "Sign Up"',
        '创建账户或登录现有账户',
        '在控制台中创建新的 API 项目',
        '复制生成的 API Key（格式为 BSA-xxx）'
      ],
      links: [
        {
          text: 'Brave Search API 官网',
          url: 'https://brave.com/search/api/'
        }
      ]
    }
  },
  {
    id: 'postgres',
    name: 'postgres',
    displayName: 'PostgreSQL',
    description: 'PostgreSQL 数据库连接工具，支持 SQL 查询、表管理等数据库操作',
    icon: '🐘',
    category: 'development',
    tags: ['数据库', 'SQL', 'PostgreSQL', '数据管理'],
    version: '1.0.0',
    author: 'Model Context Protocol',
    repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    documentation: 'https://github.com/modelcontextprotocol/servers/blob/main/src/postgres/README.md',
    template: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: {}
    },
    params: [
      {
        key: 'POSTGRES_CONNECTION_STRING',
        label: 'PostgreSQL 连接字符串',
        description: 'PostgreSQL 数据库连接字符串',
        type: 'string',
        position: 'env',
        required: true,
        placeholder: 'postgresql://username:password@localhost:5432/database',
        validation: {
          pattern: '^postgresql://.*',
          message: '请输入有效的 PostgreSQL 连接字符串'
        }
      }
    ],
    features: [
      'SQL 查询执行',
      '表结构查看',
      '数据导入导出',
      '索引管理',
      '权限控制',
      '事务支持'
    ],
    popular: false,
    official: true,
    guide: {
      title: '如何构建 PostgreSQL 连接字符串',
      description: '配置 PostgreSQL 服务需要一个数据库连接字符串',
      steps: [
        '确保已安装并启动 PostgreSQL 数据库',
        '获取数据库连接信息：主机地址、端口号、数据库名',
        '确认用户名和密码',
        '按格式组装：postgresql://用户名:密码@主机:端口/数据库名',
        '示例：postgresql://myuser:mypass@localhost:5432/mydatabase'
      ],
      links: [
        {
          text: 'PostgreSQL 连接 URI 文档',
          url: 'https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING'
        }
      ]
    }
  }
];

/** 根据分类获取模板 */
export function getTemplatesByCategory(categoryId: string): MCPMarketTemplate[] {
  return mcpTemplates.filter(template => template.category === categoryId);
}

/** 搜索模板 */
export function searchTemplates(query: string): MCPMarketTemplate[] {
  const lowerQuery = query.toLowerCase();
  return mcpTemplates.filter(template => 
    template.displayName.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/** 获取热门模板 */
export function getPopularTemplates(): MCPMarketTemplate[] {
  return mcpTemplates.filter(template => template.popular);
}

/** 获取官方模板 */
export function getOfficialTemplates(): MCPMarketTemplate[] {
  return mcpTemplates.filter(template => template.official);
} 