import { MCPMarketCategory, MCPMarketTemplate } from "@/types/mcp";

/** MCP 市场分类数据 */
export const mcpCategories: MCPMarketCategory[] = [
  {
    id: "development",
    name: "开发工具",
    description: "代码管理、版本控制等开发相关工具",
    icon: "💻",
  },
  {
    id: "productivity",
    name: "生产力工具",
    description: "文档处理、任务管理等提升效率的工具",
    icon: "⚡",
  },
  {
    id: "ai",
    name: "AI 助手",
    description: "人工智能相关的服务和工具",
    icon: "🤖",
  },
  {
    id: "integration",
    name: "集成服务",
    description: "第三方平台和服务的集成",
    icon: "🔗",
  },
];

/** MCP 市场模板数据 */
export const mcpTemplates: MCPMarketTemplate[] = [
  {
    id: "filesystem",
    name: "filesystem",
    displayName: "文件系统",
    description: "本地文件系统访问工具，支持文件读写、目录管理等基础文件操作",
    icon: "📁",
    category: "productivity",
    tags: ["免费"],
    repository:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    documentation:
      "https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/README.md",
    template: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem"],
      env: {},
    },
    params: [
      {
        key: "ALLOWED_DIRECTORIES",
        label: "允许访问的目录",
        description: "指定允许访问的目录路径，多个路径用逗号分隔",
        type: "string",
        position: "args",
        required: true,
        multiple: true,
        separator: ",",
        placeholder: "/home/user/documents,/home/user/projects",
        validation: {
          message: "请输入有效的目录路径",
        },
      },
    ],
    popular: false,
    official: true,
    guide: {
      title: "如何配置允许访问的目录",
      description: "配置文件系统服务需要指定允许访问的目录路径",
      steps: [
        "确定需要 MCP 服务访问的目录路径",
        "使用绝对路径（如 /home/user/documents）",
        "Windows 系统使用反斜杠（如 C:\\Users\\username\\Documents）",
        "多个目录用英文逗号分隔",
        "建议只授权必要的目录以确保安全性",
      ],
    },
  },
  {
    id: "github",
    name: "github",
    displayName: "GitHub",
    description:
      "GitHub 仓库管理工具，支持查看仓库信息、创建 issues、管理 PR 等功能",
    icon: "🐙",
    category: "development",
    tags: ["免费"],
    repository:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    documentation:
      "https://github.com/modelcontextprotocol/servers/blob/main/src/github/README.md",
    template: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {},
    },
    params: [
      {
        key: "GITHUB_PERSONAL_ACCESS_TOKEN",
        label: "GitHub Personal Access Token",
        description: "用于访问 GitHub API 的个人访问令牌",
        type: "string",
        position: "env",
        required: true,
        placeholder: "github_pat_xxx...",
        validation: {
          pattern: "^github_pat_[a-zA-Z0-9_]+$",
          message: "请输入有效的 GitHub Personal Access Token",
        },
      },
    ],
    popular: true,
    official: true,
    guide: {
      title: "如何获取 GitHub Personal Access Token",
      description: "配置 GitHub 服务需要一个个人访问令牌来访问 GitHub API",
      steps: [
        "登录 GitHub 账户",
        '点击右上角头像，选择 "Settings"',
        '在左侧菜单中点击 "Developer settings"',
        '选择 "Personal access tokens" → "Tokens (classic)"',
        '点击 "Generate new token" → "Generate new token (classic)"',
        "输入 token 名称，选择过期时间",
        "勾选所需权限（建议至少选择 repo、read:user）",
        '点击 "Generate token" 并复制生成的 token',
      ],
      links: [
        {
          text: "官方文档：创建个人访问令牌",
          url: "https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token",
        },
      ],
    },
  },
  {
    id: "playwright-mcp",
    name: "playwright-mcp",
    displayName: "浏览器能力",
    description: "让模型拥有浏览器能力，支持自动化联网操作",
    icon: "🌐",
    category: "integration",
    tags: ["免费", "微软", "免配置"],
    repository: "https://github.com/microsoft/playwright-mcp",
    documentation: "https://github.com/microsoft/playwright-mcp#readme",
    template: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
      env: {},
    },
    params: [],
    popular: true,
    official: true,
  },
  {
    id: "mcp-server-chart",
    name: "mcp-server-chart",
    displayName: "图表能力",
    description: "让模型拥有画图表能力，支持多种图表类型",
    icon: "📈",
    category: "productivity",
    tags: ["免费", "免配置"],
    repository: "https://github.com/antvis/mcp-server-chart",
    documentation: "https://github.com/antvis/mcp-server-chart#readme",
    template: {
      command: "npx",
      args: ["-y", "@antv/mcp-server-chart"],
      env: {},
    },
    params: [],
    popular: true,
    official: true,
  },
  {
    id: "promptx",
    name: "promptx",
    displayName: "上下文&提示词增强",
    description:
      "领先的 AI 上下文工程平台，提供角色管理、记忆系统、结构化提示协议等功能",
    icon: "🧩",
    category: "ai",
    tags: ["免费", "免配置"],
    repository: "https://github.com/Deepractice/PromptX",
    documentation:
      "https://github.com/Deepractice/PromptX/wiki/PromptX-MCP-Install",
    template: {
      command: "npx",
      args: [
        "-y",
        "-f",
        "--registry",
        "https://registry.npmjs.org",
        "dpml-prompt@beta",
        "mcp-server",
      ],
      env: {},
    },
    params: [
      {
        key: "TRANSPORT",
        label: "Transport 模式",
        description: "选择传输模式（如 http 或 本地），默认为本地模式",
        type: "string",
        position: "args",
        required: false,
        multiple: false,
        placeholder: "可选：--transport http",
        validation: {
          message: "请输入有效的 transport 模式，例如 http",
        },
      },
      {
        key: "PORT",
        label: "HTTP 模式端口",
        description: "当启用 HTTP 模式时，指定服务监听端口",
        type: "number",
        position: "args",
        required: false,
        placeholder: "3000",
        validation: {
          pattern: "^[0-9]+$",
          message: "请输入有效的端口号，例如 3000",
        },
      },
    ],
    popular: true,
    official: false,
  },
  {
    id: "knowledge-graph-memory",
    name: "knowledge-graph-memory",
    displayName: "记忆增强",
    description: "记忆管理服务，让模型拥有结构化记忆能力",
    icon: "🧠",
    category: "ai",
    tags: ["免费", "免配置"],
    repository:
      "https://github.com/modelcontextprotocol/knowledge-graph-memory-server",
    documentation:
      "https://github.com/modelcontextprotocol/knowledge-graph-memory-server#readme",
    template: {
      command: "npx",
      args: [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/Users/shaneholloman/Dropbox/shane/db/memory.jsonl",
      ],
      env: {},
    },
    params: [],
    popular: false,
    official: false,
  },
  {
    id: "context7",
    name: "context7",
    displayName: "代码能力增强",
    description:
      "将最新版本、来源可靠的代码文档和示例注入到模型中, 提升开发效率和准确性",
    icon: "📦",
    category: "development",
    tags: ["免费", "免配置"],
    repository: "https://github.com/upstash/context7-mcp",
    documentation: "https://github.com/upstash/context7-mcp#readme",
    template: {
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {},
    },
    params: [],
    popular: true,
    official: false,
  },
  {
    id: "mcp-server-code-runner",
    name: "mcp-server-code-runner",
    displayName: "代码执行器",
    description: "安全的代码执行环境，支持多种编程语言的代码运行和测试",
    icon: "⚡",
    category: "development",
    tags: ["免费", "免配置"],
    repository: "https://github.com/cliid/mcp-server-code-runner",
    documentation: "https://github.com/cliid/mcp-server-code-runner#readme",
    template: {
      command: "npx",
      args: ["-y", "mcp-server-code-runner@latest"],
      env: {},
    },
    params: [],
    popular: true,
    official: false,
  },
  {
    id: "brave-search",
    name: "brave-search",
    displayName: "Brave联网搜索能力",
    description: "Brave Search API 集成，提供隐私友好的网络搜索功能",
    icon: "🔍",
    category: "integration",
    tags: ["送Token"],
    repository:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    documentation:
      "https://github.com/modelcontextprotocol/servers/blob/main/src/brave-search/README.md",
    template: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {},
    },
    params: [
      {
        key: "BRAVE_API_KEY",
        label: "Brave Search API Key",
        description: "从 Brave Search API 获取的 API 密钥",
        type: "string",
        position: "env",
        required: true,
        placeholder: "BSA-xxx...",
        validation: {
          pattern: "^BSA-[a-zA-Z0-9]+$",
          message: "请输入有效的 Brave Search API Key",
        },
      },
    ],
    popular: false,
    official: true,
    guide: {
      title: "如何获取 Brave Search API Key",
      description: "配置 Brave Search 服务需要一个 API 密钥来访问搜索 API",
      steps: [
        "访问 Brave Search API 官方网站",
        '点击 "Get API Key" 或 "Sign Up"',
        "创建账户或登录现有账户",
        "在控制台中创建新的 API 项目",
        "复制生成的 API Key（格式为 BSA-xxx）",
      ],
      links: [
        {
          text: "Brave Search API 官网",
          url: "https://brave.com/search/api/",
        },
      ],
    },
  },
  {
    id: "postgres",
    name: "postgres",
    displayName: "PostgreSQL数据库能力",
    description: "PostgreSQL 数据库连接工具，支持 SQL 查询、表管理等数据库操作",
    icon: "🐘",
    category: "development",
    tags: ["免费"],
    repository:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    documentation:
      "https://github.com/modelcontextprotocol/servers/blob/main/src/postgres/README.md",
    template: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: {},
    },
    params: [
      {
        key: "POSTGRES_CONNECTION_STRING",
        label: "PostgreSQL 连接字符串",
        description: "PostgreSQL 数据库连接字符串",
        type: "string",
        position: "env",
        required: true,
        placeholder: "postgresql://username:password@localhost:5432/database",
        validation: {
          pattern: "^postgresql://.*",
          message: "请输入有效的 PostgreSQL 连接字符串",
        },
      },
    ],
    popular: false,
    official: true,
    guide: {
      title: "如何构建 PostgreSQL 连接字符串",
      description: "配置 PostgreSQL 服务需要一个数据库连接字符串",
      steps: [
        "确保已安装并启动 PostgreSQL 数据库",
        "获取数据库连接信息：主机地址、端口号、数据库名",
        "确认用户名和密码",
        "按格式组装: postgresql://用户名:密码@主机:端口/数据库名",
        "示例: postgresql://myuser:mypass@localhost:5432/mydatabase",
      ],
      links: [
        {
          text: "PostgreSQL 连接 URI 文档",
          url: "https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING",
        },
      ],
    },
  },
  {
    id: "excel",
    name: "excel",
    displayName: "Excel 表格处理",
    description: "Excel 文件读写和处理工具，支持表格数据操作、格式化和分析功能",
    icon: "📊",
    category: "productivity",
    tags: ["免费", "办公"],
    repository: "https://github.com/zhiweixu/excel-mcp-server",
    documentation: "https://github.com/zhiweixu/excel-mcp-server#readme",
    template: {
      command: "npx",
      args: ["--yes", "@zhiweixu/excel-mcp-server"],
      env: {
        LOG_PATH: "/Users/bytedance/Desktop",
        CACHE_MAX_AGE: "1",
        CACHE_CLEANUP_INTERVAL: "4",
        LOG_RETENTION_DAYS: "7",
        LOG_CLEANUP_INTERVAL: "24",
      },
    },
    params: [
      {
        key: "LOG_PATH",
        label: "日志路径",
        description: "指定日志文件存储路径",
        type: "string",
        position: "env",
        required: true,
        defaultValue: "/Users/username/Desktop",
        placeholder: "/path/to/logs",
        validation: {
          message: "请输入有效的目录路径",
        },
      },
      {
        key: "CACHE_MAX_AGE",
        label: "缓存最大保存时间（小时）",
        description: "缓存文件最大保存时间，单位为小时",
        type: "number",
        position: "env",
        required: false,
        defaultValue: "1",
        placeholder: "1",
        validation: {
          pattern: "^[0-9]+$",
          message: "请输入有效的数字",
        },
      },
      {
        key: "CACHE_CLEANUP_INTERVAL",
        label: "缓存清理间隔（小时）",
        description: "缓存清理检查间隔，单位为小时",
        type: "number",
        position: "env",
        required: false,
        defaultValue: "4",
        placeholder: "4",
        validation: {
          pattern: "^[0-9]+$",
          message: "请输入有效的数字",
        },
      },
      {
        key: "LOG_RETENTION_DAYS",
        label: "日志保留天数",
        description: "日志文件保留天数，过期自动删除",
        type: "number",
        position: "env",
        required: false,
        defaultValue: "7",
        placeholder: "7",
        validation: {
          pattern: "^[0-9]+$",
          message: "请输入有效的数字",
        },
      },
      {
        key: "LOG_CLEANUP_INTERVAL",
        label: "日志清理间隔（小时）",
        description: "日志清理检查间隔，单位为小时",
        type: "number",
        position: "env",
        required: false,
        defaultValue: "24",
        placeholder: "24",
        validation: {
          pattern: "^[0-9]+$",
          message: "请输入有效的数字",
        },
      },
    ],
    popular: false,
    official: false,
    guide: {
      title: "Excel MCP 服务配置说明",
      description: "Excel MCP 服务用于处理Excel文件，支持读写、格式化等操作",
      steps: [
        "配置日志存储路径，确保目录存在且有写入权限",
        "根据使用频率调整缓存设置，频繁使用可增加缓存时间",
        "设置合适的清理间隔，避免磁盘空间不足",
        "日志保留天数可根据调试需要调整",
        "首次使用建议保持默认配置",
      ],
    },
  },
];

/** 根据分类获取模板 */
export function getTemplatesByCategory(
  categoryId: string
): MCPMarketTemplate[] {
  return mcpTemplates.filter((template) => template.category === categoryId);
}

/** 搜索模板 */
export function searchTemplates(query: string): MCPMarketTemplate[] {
  const lowerQuery = query.toLowerCase();
  return mcpTemplates.filter(
    (template) =>
      template.displayName.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/** 获取热门模板 */
export function getPopularTemplates(): MCPMarketTemplate[] {
  return mcpTemplates.filter((template) => template.popular);
}

/** 获取官方模板 */
export function getOfficialTemplates(): MCPMarketTemplate[] {
  return mcpTemplates.filter((template) => template.official);
}
