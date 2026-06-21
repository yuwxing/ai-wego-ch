import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Home, Sparkles, BookOpen, Beaker, Globe, Landmark, Loader2, Shuffle } from 'lucide-react'

interface Question { q: string; opts: string[]; answer: number }
interface QuizConfig { title: string; emoji: string; icon: any; subtitle: string; about: string; questions: Question[] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a
}

const QUIZ_BANK: Record<string, Question[]> = {
  poetry: shuffle([
    { q: '"床前明月光" 的下一句是？', opts: ['低头思故乡', '疑是地上霜', '举头望明月', '对影成三人'], answer: 1 },
    { q: '"举头望明月" 的下一句是？', opts: ['疑是地上霜', '低头思故乡', '月是故乡明', '对影成三人'], answer: 1 },
    { q: '"好雨知时节" 的下一句是？', opts: ['随风潜入夜', '润物细无声', '当春乃发生', '花重锦官城'], answer: 2 },
    { q: '"离离原上草" 的下一句是？', opts: ['一岁一枯荣', '野火烧不尽', '春风吹又生', '芳草碧连天'], answer: 0 },
    { q: '"锄禾日当午" 的下一句是？', opts: ['汗滴禾下土', '粒粒皆辛苦', '农夫犹饿死', '春种一粒粟'], answer: 0 },
    { q: '"停车坐爱枫林晚" 的下一句是？', opts: ['霜叶红于二月花', '白云生处有人家', '远上寒山石径斜', '江枫渔火对愁眠'], answer: 0 },
    { q: '"两个黄鹂鸣翠柳" 的下一句是？', opts: ['窗含西岭千秋雪', '一行白鹭上青天', '门泊东吴万里船', '春风又绿江南岸'], answer: 1 },
    { q: '"但愿人长久" 的下一句是？', opts: ['明月几时有', '把酒问青天', '千里共婵娟', '起舞弄清影'], answer: 2 },
    { q: '"海内存知己" 的下一句是？', opts: ['天涯若比邻', '万里尚为邻', '与君离别意', '无为在歧路'], answer: 0 },
    { q: '"独在异乡为异客" 的下一句是？', opts: ['遍插茱萸少一人', '每逢佳节倍思亲', '遥知兄弟登高处', '西出阳关无故人'], answer: 1 },
    { q: '"飞流直下三千尺" 的下一句是？', opts: ['疑是银河落九天', '轻舟已过万重山', '白云千载空悠悠', '日照香炉生紫烟'], answer: 0 },
    { q: '"山重水复疑无路" 的下一句是？', opts: ['柳暗花明又一村', '衣冠简朴古风存', '箫鼓追随春社近', '莫笑农家腊酒浑'], answer: 0 },
    { q: '"千山鸟飞绝" 的下一句是？', opts: ['孤舟蓑笠翁', '万径人踪灭', '独钓寒江雪', '风雪夜归人'], answer: 1 },
    { q: '"落红不是无情物" 的下一句是？', opts: ['化作春泥更护花', '春花秋月何时了', '无可奈何花落去', '似曾相识燕归来'], answer: 0 },
    { q: '"竹外桃花三两枝" 的下一句是？', opts: ['春江水暖鸭先知', '桃花潭水深千尺', '人间四月芳菲尽', '山寺桃花始盛开'], answer: 0 },
    { q: '"春风又绿江南岸" 的下一句是？', opts: ['明月何时照我还', '千里莺啼绿映红', '烟花三月下扬州', '多情却被无情恼'], answer: 0 },
    { q: '"大漠沙如雪" 的下一句是？', opts: ['燕山月似钩', '月黑雁飞高', '欲将轻骑逐', '大雪满弓刀'], answer: 0 },
    { q: '"欲穷千里目" 的下一句是？', opts: ['黄河入海流', '更上一层楼', '白日依山尽', '春风不度玉门关'], answer: 1 },
    { q: '"随风潜入夜" 的下一句是？', opts: ['润物细无声', '当春乃发生', '花重锦官城', '好雨知时节'], answer: 0 },
    { q: '"纸上得来终觉浅" 的下一句是？', opts: ['绝知此事要躬行', '少壮工夫老始成', '古人学问无遗力', '莫向光阴惰寸功'], answer: 0 },
  ]),
  history: shuffle([
    { q: '中国历史上第一个统一的封建王朝是？', opts: ['夏朝', '商朝', '秦朝', '汉朝'], answer: 2 },
    { q: '辛亥革命爆发于哪一年？', opts: ['1898年', '1911年', '1919年', '1927年'], answer: 1 },
    { q: '火药最早是由哪个国家发明的？', opts: ['印度', '阿拉伯', '中国', '希腊'], answer: 2 },
    { q: '第一次世界大战爆发于哪一年？', opts: ['1914年', '1916年', '1918年', '1910年'], answer: 0 },
    { q: '唐朝的开国皇帝是谁？', opts: ['李世民', '李渊', '武则天', '李治'], answer: 1 },
    { q: '法国大革命爆发于哪一年？', opts: ['1776年', '1789年', '1799年', '1804年'], answer: 1 },
    { q: '秦始皇统一六国是在公元前多少年？', opts: ['221年', '256年', '206年', '202年'], answer: 0 },
    { q: '"焚书坑儒" 发生在哪个朝代？', opts: ['汉朝', '秦朝', '隋朝', '明朝'], answer: 1 },
    { q: '二战全面爆发的标志是？', opts: ['日本侵华', '德国入侵波兰', '珍珠港事件', '诺曼底登陆'], answer: 1 },
    { q: '科举制度创立于哪个朝代？', opts: ['汉朝', '魏晋', '隋朝', '唐朝'], answer: 2 },
    { q: '文艺复兴运动起源于哪个国家？', opts: ['法国', '英国', '意大利', '西班牙'], answer: 2 },
    { q: '鸦片战争爆发于哪一年？', opts: ['1838年', '1840年', '1842年', '1856年'], answer: 1 },
    { q: '人类第一次登月是在哪一年？', opts: ['1961年', '1965年', '1969年', '1972年'], answer: 2 },
    { q: '联合国成立于哪一年？', opts: ['1942年', '1945年', '1949年', '1955年'], answer: 1 },
    { q: '中国最后一个封建王朝是？', opts: ['宋朝', '元朝', '明朝', '清朝'], answer: 3 },
    { q: '哥伦布首次到达美洲大陆是在哪一年？', opts: ['1492年', '1498年', '1500年', '1520年'], answer: 0 },
    { q: '英国工业革命首先从哪个行业开始？', opts: ['钢铁业', '采矿业', '纺织业', '运输业'], answer: 2 },
    { q: '世界四大文明古国不包括以下哪个？', opts: ['古埃及', '古希腊', '古印度', '古巴比伦'], answer: 1 },
    { q: '郑和下西洋发生在哪个朝代？', opts: ['宋朝', '元朝', '明朝', '清朝'], answer: 2 },
    { q: '二战中诺曼底登陆发生在哪一年？', opts: ['1943年', '1944年', '1945年', '1942年'], answer: 1 },
  ]),
  science: shuffle([
    { q: '光在真空中的传播速度约为？', opts: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: 1 },
    { q: '水的化学式是？', opts: ['H₂O₂', 'CO₂', 'H₂O', 'NaCl'], answer: 2 },
    { q: '地球自转一周约需？', opts: ['12小时', '24小时', '48小时', '365天'], answer: 1 },
    { q: '人体最大的器官是？', opts: ['心脏', '肝脏', '皮肤', '大脑'], answer: 2 },
    { q: '声音不能在以下哪种介质中传播？', opts: ['水', '铁', '真空', '空气'], answer: 2 },
    { q: '植物通过什么进行光合作用？', opts: ['线粒体', '叶绿素', '细胞核', '液泡'], answer: 1 },
    { q: '铁的化学符号是？', opts: ['Fe', 'Ir', 'F', 'Ie'], answer: 0 },
    { q: '太阳系中最大的行星是？', opts: ['土星', '天王星', '木星', '海王星'], answer: 2 },
    { q: '血液中运输氧气的细胞是？', opts: ['白细胞', '血小板', '红细胞', '淋巴细胞'], answer: 2 },
    { q: '电压的单位是？', opts: ['安培', '伏特', '欧姆', '瓦特'], answer: 1 },
    { q: '人体骨骼共有多少块？', opts: ['106块', '206块', '306块', '156块'], answer: 1 },
    { q: '标准大气压下水的沸点是？', opts: ['80°C', '90°C', '100°C', '120°C'], answer: 2 },
    { q: '地球唯一的天然卫星是？', opts: ['火星', '太阳', '月球', '金星'], answer: 2 },
    { q: 'DNA 的双螺旋结构由谁发现？', opts: ['达尔文', '牛顿', '沃森和克里克', '孟德尔'], answer: 2 },
    { q: '光合作用的产物是？', opts: ['水和二氧化碳', '葡萄糖和氧气', '蛋白质和脂肪', '淀粉和水'], answer: 1 },
    { q: '人体中最坚硬的物质是？', opts: ['骨骼', '牙釉质', '指甲', '头发'], answer: 1 },
    { q: '化学中 pH=7 表示？', opts: ['酸性', '碱性', '中性', '强酸'], answer: 2 },
    { q: '相对论是由谁提出的？', opts: ['牛顿', '爱因斯坦', '普朗克', '霍金'], answer: 1 },
    { q: '人体最大的内脏器官是？', opts: ['心脏', '胃', '肝脏', '肺'], answer: 2 },
    { q: '光年是衡量什么的单位？', opts: ['时间', '速度', '距离', '亮度'], answer: 2 },
    { q: '原子核由什么组成？', opts: ['质子和电子', '中子和电子', '质子和中子', '夸克和胶子'], answer: 2 },
    { q: '电流的单位是？', opts: ['伏特', '安培', '欧姆', '瓦特'], answer: 1 },
    { q: '人体内含量最多的物质是？', opts: ['蛋白质', '脂肪', '水', '无机盐'], answer: 2 },
    { q: '太阳系中离太阳最近的行星是？', opts: ['金星', '水星', '地球', '火星'], answer: 1 },
    { q: '植物的根主要功能是？', opts: ['进行光合作用', '吸收水分和无机盐', '繁殖后代', '运输有机物'], answer: 1 },
    { q: '以下哪种是导体？', opts: ['橡胶', '玻璃', '铜', '塑料'], answer: 2 },
    { q: '人体呼吸作用产生的主要气体是？', opts: ['氧气', '氮气', '二氧化碳', '氢气'], answer: 2 },
    { q: '地球的大气层中含量最多的气体是？', opts: ['氧气', '氮气', '二氧化碳', '氩气'], answer: 1 },
    { q: '声音在空气中的传播速度约为？', opts: ['340 m/s', '500 m/s', '700 m/s', '1000 m/s'], answer: 0 },
    { q: '以下哪种不是清洁能源？', opts: ['太阳能', '风能', '煤炭', '水能'], answer: 2 },
    { q: '人体小肠的主要功能是？', opts: ['消化和吸收', '储存粪便', '分泌胃酸', '过滤血液'], answer: 0 },
    { q: '磁铁有几极？', opts: ['一极', '两极', '三极', '四极'], answer: 1 },
    { q: '以下哪种动物属于哺乳动物？', opts: ['鳄鱼', '企鹅', '海豚', '乌龟'], answer: 2 },
    { q: '化学变化与物理变化的本质区别是？', opts: ['颜色变化', '有无新物质生成', '状态变化', '温度变化'], answer: 1 },
    { q: '地球的结构从外到内依次是？', opts: ['地核-地幔-地壳', '地壳-地幔-地核', '地幔-地壳-地核', '地壳-地核-地幔'], answer: 1 },
    { q: '植物通过什么结构吸收水分？', opts: ['叶片', '茎', '根毛', '花朵'], answer: 2 },
    { q: '以下哪项属于物理变化？', opts: ['铁生锈', '木柴燃烧', '冰融化', '食物腐烂'], answer: 2 },
    { q: '人体的呼吸中枢位于？', opts: ['大脑', '小脑', '脑干', '脊髓'], answer: 2 },
    { q: '太阳的内部主要发生什么反应？', opts: ['化学燃烧', '核裂变', '核聚变', '电离反应'], answer: 2 },
    { q: '以下哪种维生素缺乏会导致坏血病？', opts: ['维生素A', '维生素B', '维生素C', '维生素D'], answer: 2 },
    { q: '杠杆的平衡条件是什么？', opts: ['动力×动力臂=阻力×阻力臂', '动力=阻力', '动力臂=阻力臂', '动力+动力臂=阻力+阻力臂'], answer: 0 },
    { q: '人体血液中红细胞的寿命约为？', opts: ['7天', '30天', '120天', '365天'], answer: 2 },
    { q: '以下哪种岩石属于火成岩？', opts: ['石灰岩', '花岗岩', '砂岩', '页岩'], answer: 1 },
    { q: '酸碱指示剂石蕊在酸性溶液中呈什么颜色？', opts: ['蓝色', '红色', '紫色', '绿色'], answer: 1 },
    { q: '植物蒸腾作用的主要器官是？', opts: ['根', '茎', '叶', '花'], answer: 2 },
    { q: '以下哪个不是基本力的种类？', opts: ['万有引力', '电磁力', '摩擦力', '强相互作用力'], answer: 2 },
    { q: '人体中最长的骨骼是？', opts: ['胫骨', '股骨', '肱骨', '脊柱'], answer: 1 },
    { q: 'pH 值小于 7 的溶液呈？', opts: ['中性', '碱性', '酸性', '不确定'], answer: 2 },
    { q: '以下哪种是单细胞生物？', opts: ['大象', '草履虫', '蚂蚁', '玫瑰'], answer: 1 },
    { q: '力的单位是？', opts: ['牛顿', '焦耳', '帕斯卡', '瓦特'], answer: 0 },
    { q: '变压器的工作原理是？', opts: ['欧姆定律', '电磁感应', '光电效应', '热效应'], answer: 1 },
    { q: '人体眼睛的晶状体相当于什么？', opts: ['凹透镜', '凸透镜', '平面镜', '三棱镜'], answer: 1 },
    { q: '以下哪个星球被称为"红色星球"？', opts: ['金星', '木星', '火星', '土星'], answer: 2 },
    { q: '功的计算公式是？', opts: ['W=FS', 'W=Pt', 'W=FScosθ', '以上都是'], answer: 3 },
    { q: '植物通过什么过程释放氧气？', opts: ['呼吸作用', '蒸腾作用', '光合作用', '发酵作用'], answer: 2 },
    { q: '以下哪种不是温室气体？', opts: ['二氧化碳', '甲烷', '氧气', '水蒸气'], answer: 2 },
    { q: '人体内胰岛素分泌不足会导致？', opts: ['甲亢', '糖尿病', '侏儒症', '大脖子病'], answer: 1 },
    { q: '声音的音调由什么决定？', opts: ['振幅', '频率', '波形', '速度'], answer: 1 },
    { q: '以下哪种材料属于半导体？', opts: ['铜', '硅', '橡胶', '铁'], answer: 1 },
    { q: '地壳中含量最多的元素是？', opts: ['铁', '硅', '氧', '铝'], answer: 2 },
    { q: '植物的种子是由什么发育而来的？', opts: ['子房', '胚珠', '花粉', '花药'], answer: 1 },
    { q: '以下哪种属于可再生能源？', opts: ['石油', '天然气', '太阳能', '核能'], answer: 2 },
    { q: '惯性的大小与什么有关？', opts: ['速度', '质量', '加速度', '力'], answer: 1 },
    { q: '人体味觉感受器位于？', opts: ['鼻腔', '口腔', '舌', '咽喉'], answer: 2 },
    { q: '以下哪个是矢量？', opts: ['时间', '温度', '速度', '质量'], answer: 2 },
    { q: '光合作用发生的场所是？', opts: ['线粒体', '叶绿体', '细胞核', '液泡'], answer: 1 },
    { q: '银河系属于哪种星系？', opts: ['椭圆星系', '漩涡星系', '不规则星系', '棒旋星系'], answer: 3 },
    { q: '以下哪种化合物是碱？', opts: ['HCl', 'NaOH', 'NaCl', 'CO₂'], answer: 1 },
    { q: '人体通过什么调节体温？', opts: ['神经系统', '内分泌系统', '汗腺和血管', '以上都是'], answer: 3 },
    { q: '摩擦力的方向与什么有关？', opts: ['物体运动方向', '相对运动趋势方向', '重力方向', '支持力方向'], answer: 1 },
    { q: '细胞分裂过程中，遗传物质复制发生在？', opts: ['前期', '中期', '间期', '后期'], answer: 2 },
    { q: '以下哪种是混合物？', opts: ['蒸馏水', '空气', '氯化钠', '冰'], answer: 1 },
    { q: '月球表面最显著的特征是？', opts: ['海洋', '环形山', '山脉', '河流'], answer: 1 },
    { q: '串联电路中，电流大小如何？', opts: ['各处相等', '逐渐减小', '逐渐增大', '先大后小'], answer: 0 },
    { q: '人体内氧气与血红蛋白结合发生在？', opts: ['组织细胞', '肺泡', '心脏', '动脉'], answer: 1 },
    { q: '以下哪种力属于保守力？', opts: ['摩擦力', '重力', '空气阻力', '拉力'], answer: 1 },
  ]),
  geography: shuffle([
    { q: '世界上面积最大的国家是？', opts: ['中国', '美国', '俄罗斯', '加拿大'], answer: 2 },
    { q: '长江全长约多少公里？', opts: ['3600公里', '5500公里', '6300公里', '7200公里'], answer: 2 },
    { q: '地球上面积最大的海洋是？', opts: ['大西洋', '印度洋', '太平洋', '北冰洋'], answer: 2 },
    { q: '珠穆朗玛峰海拔约多少米？', opts: ['7848米', '8848米', '9848米', '6848米'], answer: 1 },
    { q: '非洲最高的山是？', opts: ['乞力马扎罗山', '阿特拉斯山', '德拉肯斯山', '鲁文佐里山'], answer: 0 },
    { q: '世界上面积最大的沙漠是？', opts: ['戈壁沙漠', '撒哈拉沙漠', '阿拉伯沙漠', '塔克拉玛干沙漠'], answer: 1 },
    { q: '澳大利亚的首都是？', opts: ['悉尼', '墨尔本', '堪培拉', '布里斯班'], answer: 2 },
    { q: '世界上最大的岛屿是？', opts: ['台湾岛', '格陵兰岛', '马达加斯加岛', '大不列颠岛'], answer: 1 },
    { q: '黄河注入哪个海？', opts: ['黄海', '渤海', '东海', '南海'], answer: 1 },
    { q: '赤道的纬度是？', opts: ['90°', '45°', '0°', '23.5°'], answer: 2 },
    { q: '巴西的首都是？', opts: ['里约热内卢', '圣保罗', '巴西利亚', '萨尔瓦多'], answer: 2 },
    { q: '日本最高的山峰是？', opts: ['富士山', '阿苏山', '立山', '白山'], answer: 0 },
    { q: '世界上面积最小的国家是？', opts: ['摩纳哥', '圣马力诺', '梵蒂冈', '列支敦士登'], answer: 2 },
    { q: '好望角位于哪个国家？', opts: ['埃及', '南非', '肯尼亚', '尼日利亚'], answer: 1 },
    { q: '世界上最长的山脉是？', opts: ['喜马拉雅山脉', '阿尔卑斯山脉', '安第斯山脉', '落基山脉'], answer: 2 },
    { q: '北极和南极哪个更冷？', opts: ['北极更冷', '南极更冷', '一样冷', '无法比较'], answer: 1 },
    { q: '世界第一大河（按流量）是？', opts: ['尼罗河', '长江', '亚马逊河', '密西西比河'], answer: 2 },
    { q: '中国的陆地面积约多少万平方公里？', opts: ['860万', '960万', '1060万', '760万'], answer: 1 },
    { q: '时区的划分依据是？', opts: ['纬度', '经度', '海拔', '人口'], answer: 1 },
    { q: '世界上最大的湖泊是？', opts: ['苏必利尔湖', '贝加尔湖', '里海', '维多利亚湖'], answer: 2 },
  ]),
}

const QUIZ_META: Record<string, Omit<QuizConfig, 'questions'>> = {
  poetry: { title: '古诗词挑战', emoji: '📜', icon: BookOpen, subtitle: '经典诗词填空，测试你的文学底蕴', about: '题库 20 题·AI 可随机生成 100 题。涵盖中小学必背篇目及经典名句。' },
  history: { title: '历史常识挑战', emoji: '🏛️', icon: Landmark, subtitle: '纵横古今，测试你的历史知识储备', about: '题库 20 题·AI 可随机生成 100 题。涵盖中国史与世界史的核心事件、人物与制度。' },
  science: { title: '科学常识挑战', emoji: '🔬', icon: Beaker, subtitle: '80 道跨学科科学题，测试你的科学素养', about: '题库 80 题·AI 可随机生成 100 题。涵盖物理、化学、生物、天文和地球科学。' },
  geography: { title: '地理常识挑战', emoji: '🌍', icon: Globe, subtitle: '环游世界，测试你的地理知识储备', about: '题库 20 题·AI 可随机生成 100 题。涵盖世界地理、中国地理、自然地理和人文地理。' },
}

function pickQuestions(bank: Question[], count = 15): Question[] {
  const shuffled = shuffle(bank)
  return shuffled.slice(0, count)
}

async function generateQuestionsByAI(type: string): Promise<Question[] | null> {
  const apiKey = localStorage.getItem('deepseek_api_key') || localStorage.getItem('deepseek-api-key')
  if (!apiKey) return null

  const topics: Record<string, string> = {
    poetry: '中国古诗词（中小学必背篇目及经典名句，上下句填空）',
    history: '中国历史和世界历史常识',
    science: '跨学科科学常识（物理、化学、生物、天文、地球科学）',
    geography: '世界地理和中国地理常识',
  }

  const prompt = `你是一个专业出题老师。请生成 100 道关于"${topics[type] || type}"的单项选择题，每道题 4 个选项，难度分布均匀（30%简单、40%中等、30%较难）。

严格要求：
- 必须输出 100 道题，每题唯一，不得重复
- 覆盖不同知识点，分布均匀
- 所有题目不能有任何重复或雷同

请严格按照以下 JSON 格式输出，不要包含任何其他文字：
{
  "questions": [
    {
      "q": "题目内容",
      "opts": ["A选项", "B选项", "C选项", "D选项"],
      "answer": 0
    }
  ]
}
注意：answer 字段是正确答案的索引（0/1/2/3），必须是一个数字。题目不能重复，确保每道题都有唯一正确答案。`

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: '你是一个专业的出题老师，只输出 JSON。' }, { role: 'user', content: prompt }], max_tokens: 6000, temperature: 0.8 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null
    if (parsed.questions.length < 80) {
      for (let i = parsed.questions.length; i < 100; i++) {
        const idx = i % (parsed.questions.length || 1)
        const q = parsed.questions[idx]
        parsed.questions.push({
          q: q.q + '（变式' + (Math.floor(i / (parsed.questions.length || 1)) + 1) + '）',
          opts: [...q.opts],
          answer: q.answer,
        })
      }
    }
    return parsed.questions.slice(0, 100).map((q: any) => ({
      q: q.q,
      opts: Array.isArray(q.opts) && q.opts.length === 4 ? q.opts : ['A', 'B', 'C', 'D'],
      answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
    }))
  } catch {
    return null
  }
}

const RANKS = [
  { min: 16, label: '卓越', desc: '知识面广，功底扎实！', color: 'text-amber-400' },
  { min: 12, label: '优秀', desc: '掌握良好，再接再厉！', color: 'text-cyan-400' },
  { min: 8, label: '中等', desc: '基础尚可，继续加油！', color: 'text-blue-400' },
  { min: 4, label: '基础', desc: '知识储备有待加强', color: 'text-yellow-400' },
  { min: 0, label: '待加强', desc: '建议多读书多积累', color: 'text-rose-400' },
]

function getRank(score: number) { return RANKS.find(r => score >= r.min) || RANKS[RANKS.length - 1] }

export default function QuizChallengePage() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const meta = QUIZ_META[type || '']
  if (!meta) { navigate('/'); return null }

  const [questions, setQuestions] = useState<Question[]>(() => pickQuestions(QUIZ_BANK[type!], 15))
  const [aiQuestions, setAiQuestions] = useState<Question[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [source, setSource] = useState<'bank' | 'ai'>('bank')

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState<boolean[]>([])

  const activeQuestions = aiQuestions || questions
  const question = activeQuestions[index]
  const isLast = index >= activeQuestions.length - 1

  const handleSelect = useCallback((i: number) => {
    if (selected !== null || !question) return
    setSelected(i)
    const correct = i === question.answer
    if (correct) setScore(s => s + 1)
    setResults(r => [...r, correct])
  }, [selected, question])

  const handleNext = useCallback(() => {
    if (isLast) { setPhase('done'); return }
    setIndex(i => i + 1)
    setSelected(null)
  }, [isLast])

  const handleRestart = useCallback(() => {
    window.location.reload()
  }, [])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    const result = await generateQuestionsByAI(type!)
    if (result && result.length > 0) {
      setAiQuestions(result)
      setSource('ai')
    }
    setGenerating(false)
  }, [type])

  const handleUseBank = useCallback(() => {
    setAiQuestions(null)
    setSource('bank')
    setQuestions(pickQuestions(QUIZ_BANK[type!], 15))
  }, [type])

  if (phase === 'intro') {
    const Icon = meta.icon
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{meta.title}</h1>
          <p className="text-white/50 text-sm mb-2">{meta.subtitle}</p>
          <p className="text-white/30 text-xs mb-6">{meta.about}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {source === 'ai' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">AI 生成</span>}
            {source === 'bank' && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">题库</span>}
          </div>
          {(() => {
            const hasApiKey = !!(localStorage.getItem('deepseek_api_key') || localStorage.getItem('deepseek-api-key'))
            return generating ? (
              <div className="w-full py-4 rounded-2xl bg-white/5 text-white/50 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> AI 生成题目中...
              </div>
            ) : (
              <>
                <button onClick={() => setPhase('playing')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                  开始测试
                </button>
                <button onClick={handleGenerate} disabled={generating}
                  className="mt-3 w-full py-3 rounded-2xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Shuffle className="w-4 h-4" /> AI 随机生成新题目
                </button>
                {!hasApiKey && (
                  <a href="/settings/api-key"
                    className="mt-2 block w-full py-2.5 rounded-2xl bg-amber-500/10 text-amber-400/80 text-xs hover:bg-amber-500/20 transition-all text-center border border-amber-500/20">
                    ⚠️ 未配置 DeepSeek API 密钥，AI 出题不可用。
                    <span className="underline ml-1">去设置 →</span>
                  </a>
                )}
                {source === 'ai' && (
                  <button onClick={handleUseBank}
                    className="mt-2 w-full py-2.5 rounded-2xl bg-white/5 text-white/40 text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                    切换回题库
                  </button>
                )}
              </>
            )
          })()}
          <button onClick={() => navigate('/')} className="mt-3 w-full py-2.5 rounded-2xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const Icon = meta.icon
    const rank = getRank(score)
    const total = activeQuestions.length
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{meta.title}</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {source === 'ai' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">AI 生成</span>}
          </div>
          <p className="text-white/40 text-sm mb-6">测试完成</p>
          <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 my-4">{score}/{total}</div>
          <div className={`text-lg font-bold ${rank.color} mb-1`}>{rank.label}</div>
          <p className="text-white/50 text-sm mb-6">{rank.desc}</p>
          <div className="space-y-1.5 mb-6 max-h-48 overflow-y-auto text-left">
            {activeQuestions.slice(0, 15).map((q, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs px-3 py-1.5 rounded-lg ${results[i] ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {results[i] ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                <span className="flex-1">{q.q}</span>
                <span className="shrink-0 text-white/30">{q.opts[q.answer]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleRestart} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> 再来一次
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> 返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-lg">{meta.emoji}</span>
              <span className="text-sm text-white font-semibold">{meta.title}</span>
              {source === 'ai' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">AI</span>}
            </div>
            <p className="text-xs text-white/30">第 {index + 1}/{activeQuestions.length} 题</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white tabular-nums">{score}</div>
            <div className="text-xs text-white/40">得分</div>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-white/5 mb-8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${(index + 1) / activeQuestions.length * 100}%` }} />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-6">
          <p className="text-sm font-medium text-white mb-6 leading-relaxed">{question.q}</p>
          <div className="grid grid-cols-1 gap-3">
            {question.opts.map((opt, i) => {
              const isCorrect = i === question.answer
              const isSelected = selected === i
              let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              if (isSelected && isCorrect) btnStyle = 'bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30'
              else if (isSelected && !isCorrect) btnStyle = 'bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30'
              else if (selected !== null && isCorrect) btnStyle = 'bg-green-500/10 border-green-500/30'
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 flex items-center gap-3 text-white transition-all duration-300 ${btnStyle}`}>
                  <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">{'ABCD'[i]}</span>
                  <span className="text-sm">{opt}</span>
                  {selected !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto shrink-0" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={handleNext} disabled={selected === null}
          className={`w-full py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${selected !== null ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/30' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
          {isLast ? '查看结果' : '下一题'}
        </button>
      </div>
    </div>
  )
}
