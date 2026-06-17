export type PlantStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'flowering'
export type PlantType = 'peony' | 'plum' | 'peach' | 'orchid' | 'chrysanthemum'
export type Action = 'water' | 'prune' | 'repot' | 'graft'

export interface Plant {
  id: string
  name: string
  type: PlantType
  water: number
  soil: number
  health: number
  stage: PlantStage
  plantedAt: number
  lastWateredAt: number
  lastPrunedAt: number
  x: number
  z: number
  variant?: string
}

export interface GardenState {
  plants: Plant[]
  coins: number
  level: number
  exp: number
  lastOffline: number
  delegate: 'xishi' | 'fanli' | null
  unlockedTypes: PlantType[]
  unlockedDecor: string[]
  messages: string[]
}

const STORAGE_KEY = 'garden_save'

export const PLANT_NAMES: Record<PlantType, string> = {
  peony: '牡丹',
  plum: '梅花',
  peach: '桃花',
  orchid: '兰花',
  chrysanthemum: '菊花',
}

export const PLANT_NOTES: Record<PlantType, string> = {
  peony: '牡丹性喜凉爽，忌积水，薄肥勤施',
  plum: '梅花耐寒，喜阳光，修剪要轻',
  peach: '桃花喜光，宜疏松土壤，注意防虫',
  orchid: '兰花喜阴湿，通风透气为要',
  chrysanthemum: '菊花耐旱，喜肥，花后重剪',
}

export const TYPES: PlantType[] = ['peony', 'plum', 'peach', 'orchid', 'chrysanthemum']

let _state: GardenState | null = null

function defaultState(): GardenState {
  return {
    plants: [
      {
        id: 'p1', name: '小牡丹', type: 'peony',
        water: 70, soil: 60, health: 80,
        stage: 'mature', plantedAt: Date.now(),
        lastWateredAt: Date.now(), lastPrunedAt: Date.now(),
        x: -0.6, z: -0.3,
      },
      {
        id: 'p2', name: '寒梅', type: 'plum',
        water: 50, soil: 70, health: 90,
        stage: 'flowering', plantedAt: Date.now(),
        lastWateredAt: Date.now(), lastPrunedAt: Date.now(),
        x: 0.6, z: 0.3,
      },
    ],
    coins: 50,
    level: 1,
    exp: 0,
    lastOffline: Date.now(),
    delegate: null,
    unlockedTypes: ['peony', 'plum'],
    unlockedDecor: [],
    messages: [],
  }
}

export function getGardenState(): GardenState {
  if (_state) return _state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) _state = JSON.parse(raw)
  } catch {}
  if (!_state) _state = defaultState()
  applyOfflineGrowth(_state)
  return _state
}

function applyOfflineGrowth(s: GardenState) {
  const now = Date.now()
  const elapsed = now - s.lastOffline
  if (elapsed < 60000) return
  const hours = elapsed / 3600000
  for (const p of s.plants) {
    p.water = Math.max(0, p.water - hours * 3)
    p.soil = Math.max(0, p.soil - hours * 1.5)
    if (p.water > 20 && p.soil > 20) {
      p.health = Math.min(100, p.health + hours * 1)
      if (hours > 2 && p.stage !== 'flowering') {
        const stages: PlantStage[] = ['seed', 'sprout', 'growing', 'mature', 'flowering']
        const idx = stages.indexOf(p.stage)
        if (idx >= 0 && idx < stages.length - 1) {
          p.health += hours * 0.5
          if (p.health > 95) p.stage = stages[idx + 1]
        }
      }
    } else {
      p.health = Math.max(0, p.health - hours * 2)
    }
  }
  if (hours > 1) {
    const reward = Math.floor(hours * 2)
    s.coins += reward
    s.exp += reward
    s.messages.push(`⏰ 离线 ${Math.round(hours)} 小时，获得 ${reward} 经验值`)
  }
  s.lastOffline = now
  saveState(s)
}

export function saveState(s: GardenState) {
  _state = s
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function getDialogue(action: Action, type: PlantType, speaker: 'xishi' | 'fanli'): string {
  const dialogues: Record<string, Record<string, Record<string, string>>> = {
    water: {
      xishi: {
        peony: '妹妹，这株牡丹要薄肥多水哦~你看叶子都蔫了，心疼死我了。',
        plum: '梅花喜燥，浇水别太勤，半月一次就好~',
        peach: '桃花正当时，多浇些水，让它开得更艳~',
        orchid: '兰花娇贵，水要浇在盆边，别淋到叶心。',
        chrysanthemum: '菊花耐旱，干透再浇，浇则浇透。',
      },
      fanli: {
        peony: '牡丹虽好，水多烂根。听我的，见干见湿。',
        plum: '梅花如君子，不渴不饮，莫要殷勤过度。',
        peach: '桃之夭夭，灼灼其华。水要足，但不可漫灌。',
        orchid: '兰生幽谷，不因无人而不芳。水少些无妨。',
        chrysanthemum: '菊有傲霜枝，浇水不宜频。',
      },
    },
    prune: {
      xishi: {
        peony: '剪的时候留三分春色，别太狠了~',
        plum: '梅花剪枝要轻，留得枝条好过冬。',
        peach: '桃树剪枝，去弱留强，来年果子才大。',
        orchid: '兰花枯叶要剪掉，但别伤到新芽。',
        chrysanthemum: '菊花打顶，分枝才多，花才繁盛。',
      },
      fanli: {
        peony: '剪得太狠会伤根，留得三分春色在，来年更妖娆。',
        plum: '梅以曲为美，直则无姿。修剪要意在形先。',
        peach: '剪枝如治国，去冗留精，方得硕果。',
        orchid: '兰叶修长，剪短了反失其韵。',
        chrysanthemum: '菊枝挺直，剪去侧芽，花头才大。',
      },
    },
    repot: {
      xishi: {
        peony: '换盆啦！新土要疏松透气，加些腐叶土~',
        plum: '梅花换盆，盆底垫碎石，排水要好。',
        peach: '桃树长大了，换个大盆才能舒展根系。',
        orchid: '兰花换盆用苔藓，透气保湿最要紧。',
        chrysanthemum: '菊花每年换一次土，长得才旺。',
      },
      fanli: {
        peony: '移栽讲究天时，春分秋分为佳。土要肥而不腻。',
        plum: '梅移则死，动根如动本。换盆时尽量少伤根。',
        peach: '桃树移栽，带土球，浇透水，遮阴三日。',
        orchid: '兰花移栽，根要舒展，填满空隙，轻拍盆壁。',
        chrysanthemum: '菊本贱，移栽最易活。不挑土不挑时。',
      },
    },
    graft: {
      xishi: {
        peony: '嫁接好玩！把梅花接桃枝，说不定开出「西施醉梅」~',
        plum: '试试把不同品种接在一起，会出奇迹哦！',
        peach: '桃接李，李接桃，亲上加亲~',
        orchid: '兰花嫁接难，但成功了就是绝世珍品。',
        chrysanthemum: '菊花嫁接，一株多色，秋日最相宜。',
      },
      fanli: {
        peony: '嫁接如联姻，砧木与接穗要情投意合。',
        plum: '梅接桃枝，刚柔相济，可成「蠡湖碧桃」。',
        peach: '吾曾以桃枝接梅，三年方成，花色如霞。',
        orchid: '兰不轻易嫁，嫁则惊天下。',
        chrysanthemum: '菊接菊，色更艳。自古有之。',
      },
    },
  }
  return dialogues[action]?.[speaker]?.[type] || '做得不错，继续加油~'
}

export function actWater(s: GardenState, plantId: string): string {
  const p = s.plants.find(p => p.id === plantId)
  if (!p) return ''
  p.water = Math.min(100, p.water + 30)
  p.health = Math.min(100, p.health + 5)
  p.lastWateredAt = Date.now()
  s.exp += 5
  saveState(s)
  return getDialogue('water', p.type, 'xishi')
}

export function actPrune(s: GardenState, plantId: string): string {
  const p = s.plants.find(p => p.id === plantId)
  if (!p) return ''
  p.health = Math.min(100, p.health + 10)
  if (p.stage === 'growing') p.stage = 'mature'
  else if (p.stage === 'mature') p.stage = 'flowering'
  p.lastPrunedAt = Date.now()
  s.exp += 8
  saveState(s)
  return getDialogue('prune', p.type, 'fanli')
}

export function actRepot(s: GardenState, plantId: string): string {
  const p = s.plants.find(p => p.id === plantId)
  if (!p) return ''
  p.soil = Math.min(100, p.soil + 40)
  p.health = Math.min(100, p.health + 8)
  s.exp += 10
  saveState(s)
  return getDialogue('repot', p.type, 'xishi')
}

export function actGraft(s: GardenState, plantId: string, targetType: PlantType): string {
  const p = s.plants.find(p => p.id === plantId)
  if (!p) return ''
  const variants = ['西施醉梅', '蠡湖碧桃', '浣纱兰', '五湖秋色']
  p.variant = variants[Math.floor(Math.random() * variants.length)]
  p.health = Math.min(100, p.health + 15)
  if (p.stage !== 'flowering') p.stage = 'flowering'
  s.exp += 25
  saveState(s)
  return `✨ 嫁接成功！获得了「${p.variant}」！\n` + getDialogue('graft', p.type, 'fanli')
}

export function addPlant(s: GardenState, type: PlantType): Plant | null {
  if (s.plants.length >= 6) return null
  const idx = s.plants.length
  const id = `p${Date.now()}`
  const plant: Plant = {
    id, name: `新${PLANT_NAMES[type]}`,
    type, water: 50, soil: 50, health: 60,
    stage: 'sprout', plantedAt: Date.now(),
    lastWateredAt: Date.now(), lastPrunedAt: Date.now(),
    x: -0.8 + (idx % 3) * 0.8, z: -0.4 + Math.floor(idx / 3) * 0.8,
  }
  s.plants.push(plant)
  if (!s.unlockedTypes.includes(type)) s.unlockedTypes.push(type)
  saveState(s)
  return plant
}

export function setDelegate(s: GardenState, who: 'xishi' | 'fanli' | null) {
  s.delegate = who
  if (who) s.messages.push(`📋 已委托 ${who === 'xishi' ? '西施' : '范蠡'} 代管庭院`)
  saveState(s)
}

export function checkLevelUp(s: GardenState) {
  const needed = s.level * 100
  if (s.exp >= needed) {
    s.exp -= needed
    s.level += 1
    s.coins += s.level * 10
    s.messages.push(`🎉 庭院升级到 ${s.level} 级！获得 ${s.level * 10} 金币`)
    return true
  }
  return false
}

export function getStageLabel(stage: PlantStage): string {
  return { seed: '种子', sprout: '幼苗', growing: '生长期', mature: '成熟', flowering: '花期' }[stage]
}
