export const wikiCategories = ['全部', '道具', '技能', '释放', '头衔', '料理']
export const libraryCategories = [
  '阿尔卡纳',
  '奥甘',
  '蛋物',
  '外观',
  '精灵外观',
  '副本',
  '尔格',
  '黑暗尔格',
  '回音',
  '鉴定',
  '音乐'
]
export const recipeOperations = ['成品', '材料', '汇总']
export const wikiViews = ['完整资料', '制作浮动', '改造']
export const tabs = [
  { id: 'wiki', label: '百科' },
  { id: 'recipe', label: '配方' },
  { id: 'library', label: '资料' },
  { id: 'auction', label: '韩拍' },
  { id: 'simulation', label: '模拟' }
]

export const modes = {
  wiki: {
    title: '百科检索',
    description: '查道具、技能、释放与头衔，也能看制作浮动和改造。',
    placeholder: '名称、#编号或高级筛选条件',
    examples: ['女神像', '重击', '猎鼠者'],
    help: '选择分类后输入名称或 #编号。\n名称支持 % 通配符，例如：死神%双枪。\n选择“制作浮动”或“改造”查看装备专项资料。\n高级筛选可直接输入：\n--接头 --属性 最大伤害>=10 --排序 最大伤害:降\n--头衔 二次 --效果 魔法攻击力\n--地区 CN,KR,KRT；--列表 列出候选；--韩文 显示韩文名。\n多个结果可点击条目查看详情，查询记录保留15分钟。'
  },
  recipe: {
    title: '制作与材料',
    description: '查成品配方、反查材料用途，或合并制作所需的基础材料。',
    placeholder: '成品或材料名称，也可输入 #编号',
    examples: ['释魂者中型盾牌', '释魂者双手斧', '高档皮革'],
    help: '成品：查看制作材料、收尾材料与料理配比。\n材料：反查哪些成品需要该材料，结果中可点击成品继续查询。\n汇总：展开中间材料，合并重复的基础材料。\n数量为1～1000件；汇总还可填写每件制作次数（用于打铁、衣物制作，另含1次收尾）。\n含空格的名称可用英文引号括起；也支持 #道具编号。'
  },
  library: {
    title: '专题资料库',
    description: '阿尔卡纳、奥甘、副本、尔格，以及回音与鉴定概率等专题。',
    placeholder: '关键词或条件；留空浏览当前分类',
    examples: [''],
    help: '先选择专题，关键词留空可浏览该分类。\n阿尔卡纳：技能、成长与等级；奥甘：词条、组合。\n蛋物：道具在哪些蛋池；外观、精灵外观：外观来源；副本：奖励反查。\n尔格、黑暗尔格：效果、材料、经验。\n回音：词条出现率与等级范围、催化剂概率。\n鉴定：属性、部位、工具概率，也支持“所有工具 冰精通伤害”。\n音乐：乐器与演奏增益。\n参数可直接填写，如 --等级 30、--工具 精致、--部位 手。各专题可用参数不同，以查询提示为准。'
  },
  auction: {
    title: '韩服拍卖',
    description: '查实时挂单，或查看已采集的近30天成交记录。',
    placeholder: '中文／韩文道具名称或 #编号',
    examples: ['猎鼠者', '女神像'],
    help: '输入中文或韩文名称，名称有多项匹配时先选候选。\n默认查询实时挂单；“成交历史”查看已采集的近30天记录。\n也可填写 --历史 7 查看7天记录。\n成交记录受资料采集范围影响，不代表全服全部交易。'
  },
  egg: {
    title: '抽蛋模拟',
    description: '选择蛋池、批量抽取，或模拟直到获得目标道具。',
    placeholder: '留空抽最新一期；可填蛋名、组数或目标',
    examples: ['10组'],
    help: '留空：最新一期1组，每组60个蛋，只列S级出物。\n10组：最新一期抽10组；组数范围1～1000。\n蛋名 10组：指定蛋池批量模拟。\n蛋名 目标道具名：模拟抽到目标，统计本次蛋数。\n名称含空格时用英文引号括起。\n按网站公开规则模拟，并非真实抽取；S级单件概率按所在档位平均分配。'
  },
  relic: {
    title: '遗物复原模拟',
    description: '批量复原，或模拟直到出现指定技能与等级。',
    placeholder: '次数、技能或等级；如 爆炎箭 10级',
    examples: ['10次', '爆炎箭 10级'],
    help: '留空：复原一次，显示技能、等级与效果数值。\n10次：批量复原，次数范围1～10。\n爆炎箭：复原到该技能；爆炎箭 10级：复原到技能且恰好10级。\n技能与等级按等概率模拟，并非真实游戏概率。'
  },
  coin: {
    title: '硬币模拟与评分',
    description: '批量制作比较前五名，或计算一枚硬币的评分。',
    placeholder: '次数、目标等级或 计算 20 10 3',
    examples: ['100次', '钻石', '计算 20 10 3'],
    help: '留空：模拟一枚硬币。\n100次：制作100枚，按评分列前五名；次数范围1～100000。\n钻石：模拟直到指定等级；可选青铜、白银、黄金、铂金、钻石。\n计算 20 10 3：依次输入最大伤害、暴击伤害%、阿尔卡纳额外伤害%。\n评分 = 大伤 + 暴伤×6 + 阿尔卡纳额外伤害÷0.15×4。\n依网站参考分布划分等级，并非真实游戏掉落。'
  }
}

// Fixed modules only. User input never becomes a plugin command or model prompt.
export function queryPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const mode = body.mode || 'wiki'
  if (typeof mode !== 'string' || !Object.hasOwn(modes, mode)) return null
  const action = body.action || 'search'
  if (action === 'help' || action === 'source') return { action, mode }
  if (action === 'page') {
    return Number.isInteger(body.page) && body.page >= 1 && body.page <= 10000
      ? { action, mode, page: body.page }
      : null
  }
  if (action !== 'search') return null
  if (body.query != null && typeof body.query !== 'string') return null
  const query = (body.query || '').trim()
  if (query.length > 200 || /^[／/]/.test(query)) return null
  if (['wiki', 'recipe', 'auction'].includes(mode) && !query) return null
  const payload = { action, mode, query }
  if (mode === 'wiki') {
    const category = body.category || '全部'
    const view = body.wikiView || '完整资料'
    if (!wikiCategories.includes(category) || !wikiViews.includes(view))
      return null
    Object.assign(payload, { category, wikiView: view })
  }
  if (mode === 'library') {
    const category = body.category || '阿尔卡纳'
    if (!libraryCategories.includes(category)) return null
    payload.category = category
  }
  if (mode === 'recipe') {
    const operation = body.operation || '成品'
    const quantity = body.quantity ?? 1
    const runs = body.runs ?? 3
    if (
      !recipeOperations.includes(operation) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000 ||
      !Number.isInteger(runs) ||
      runs < 1 ||
      runs > 1000
    )
      return null
    Object.assign(payload, { operation, quantity, runs })
  }
  if (mode === 'auction') {
    const history = body.history ?? 0
    if (!Number.isInteger(history) || history < 0 || history > 30) return null
    payload.history = history
  }
  return payload
}
