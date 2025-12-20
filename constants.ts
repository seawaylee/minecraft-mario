
export const TILE_SIZE = 32;
export const GRAVITY = 0.35;
export const JUMP_FORCE = -11.5;
export const MOVE_SPEED = 5;
export const FRICTION = 0.85;
export const WORLD_HEIGHT_TILES = 15;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 480;

// Combat
export const PLAYER_MAX_HP = 10; // Increased from 3 to 10 for easier difficulty
export const ATTACK_COOLDOWN = 5; // Reduced for automatic fire
export const ATTACK_RANGE = 600; // Increased range for homing missiles
export const PROJECTILE_SPEED = 8;
export const BOSS_HP = 20;

// 8x8 Pixel Art Color Matrices (Row by Row)
const STEVE_FACE = [
  ['#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16'], // Hair
  ['#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16'],
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'], // Skin
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
  ['#E0AA86', '#FFFFFF', '#494586', '#E0AA86', '#E0AA86', '#494586', '#FFFFFF', '#E0AA86'], // Eyes
  ['#E0AA86', '#E0AA86', '#A97D64', '#A97D64', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'], // Nose
  ['#E0AA86', '#E0AA86', '#8F5844', '#8F5844', '#8F5844', '#8F5844', '#E0AA86', '#E0AA86'], // Mouth
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
];

const ALEX_FACE = [
  ['#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38'],
  ['#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38', '#D67B38'],
  ['#D67B38', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#D67B38'],
  ['#D67B38', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#D67B38'],
  ['#F1C39A', '#FFFFFF', '#365E47', '#F1C39A', '#F1C39A', '#365E47', '#FFFFFF', '#F1C39A'],
  ['#F1C39A', '#F1C39A', '#D9A176', '#D9A176', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A'],
  ['#F1C39A', '#F1C39A', '#C78363', '#C78363', '#C78363', '#C78363', '#F1C39A', '#F1C39A'],
  ['#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A'],
];

const ZOMBIE_FACE = [
  ['#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836'],
  ['#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836', '#3D6836'],
  ['#3D6836', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#3D6836'],
  ['#3D6836', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#3D6836'],
  ['#5FA84F', '#242424', '#793939', '#5FA84F', '#5FA84F', '#793939', '#242424', '#5FA84F'],
  ['#5FA84F', '#5FA84F', '#324E2B', '#324E2B', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F'],
  ['#5FA84F', '#5FA84F', '#324E2B', '#324E2B', '#324E2B', '#324E2B', '#5FA84F', '#5FA84F'],
  ['#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F', '#5FA84F'],
];

const SKELETON_FACE = [
  ['#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0'],
  ['#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0', '#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0'],
  ['#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0', '#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#B0B0B0', '#333333', '#333333', '#B0B0B0', '#B0B0B0', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#B0B0B0', '#333333', '#333333', '#B0B0B0', '#B0B0B0', '#B0B0B0'],
  ['#B0B0B0', '#444444', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#444444', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#444444', '#444444', '#444444', '#444444', '#B0B0B0', '#B0B0B0'],
];

const CREEPER_FACE = [
  ['#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00'],
  ['#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00'],
  ['#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00'],
  ['#00AA00', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#000000', '#000000', '#000000', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#000000', '#000000', '#000000', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#00AA00', '#00AA00', '#000000', '#00AA00', '#00AA00'],
];

const ENDERMAN_FACE = [
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  ['#000000', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#000000'],
  ['#000000', '#E0AAFF', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#E0AAFF', '#000000'],
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
];

const VILLAGER_FACE = [
  ['#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062'],
  ['#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062'],
  ['#B88062', '#3D2817', '#B88062', '#B88062', '#B88062', '#B88062', '#3D2817', '#B88062'], // Unibrow
  ['#B88062', '#FFFFFF', '#365E47', '#B88062', '#B88062', '#365E47', '#FFFFFF', '#B88062'], // Eyes
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'], // Nose Top
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'], // Nose Mid
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'], // Nose Bot
  ['#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062', '#B88062'],
];

const PIGMAN_FACE = [
  ['#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898'],
  ['#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898'],
  ['#EA9898', '#FFFFFF', '#000000', '#EA9898', '#EA9898', '#000000', '#FFFFFF', '#EA9898'],
  ['#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#EA9898'],
  ['#EA9898', '#EA9898', '#EA9898', '#7F5C54', '#7F5C54', '#EA9898', '#EA9898', '#EA9898'], // Snout
  ['#EA9898', '#EA9898', '#2D2D2D', '#7F5C54', '#7F5C54', '#2D2D2D', '#EA9898', '#EA9898'], // Tusks
  ['#3D6836', '#3D6836', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#3D6836', '#3D6836'], // Rot
  ['#3D6836', '#3D6836', '#3D6836', '#EA9898', '#EA9898', '#3D6836', '#3D6836', '#3D6836'],
];

const HEROBRINE_FACE = [
  ['#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16'], // Hair
  ['#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16', '#2B1E16'],
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'], // Skin
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
  ['#E0AA86', '#FFFFFF', '#FFFFFF', '#E0AA86', '#E0AA86', '#FFFFFF', '#FFFFFF', '#E0AA86'], // Pure White Eyes
  ['#E0AA86', '#E0AA86', '#A97D64', '#A97D64', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'], // Nose
  ['#E0AA86', '#E0AA86', '#8F5844', '#8F5844', '#8F5844', '#8F5844', '#E0AA86', '#E0AA86'], // Mouth
  ['#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
];

const BLAZE_FACE = [
  ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFD700', '#3D2817', '#3D2817', '#FFD700', '#FFD700', '#3D2817', '#3D2817', '#FFD700'],
  ['#FFD700', '#3D2817', '#3D2817', '#FFD700', '#FFD700', '#3D2817', '#3D2817', '#FFD700'],
  ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500'],
  ['#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500'],
];

export const CHARACTERS = [
  {
    id: 'Steve',
    name: '史蒂夫',
    desc: '经典英雄',
    color: '#00AAAA', 
    legs: '#0000AA', 
    face: STEVE_FACE
  },
  {
    id: 'Alex',
    name: '亚历克斯',
    desc: '敏捷探险家',
    color: '#638257', 
    legs: '#4C3322', 
    face: ALEX_FACE
  },
  {
    id: 'Zombie',
    name: '僵尸',
    desc: '脑子...?',
    color: '#00AAAA', 
    legs: '#0000AA', 
    face: ZOMBIE_FACE
  },
  {
    id: 'Skeleton',
    name: '骷髅',
    desc: '嘎吱嘎吱',
    color: '#B0B0B0', // Ribs/Gray
    legs: '#B0B0B0', 
    face: SKELETON_FACE
  },
  {
    id: 'Creeper',
    name: '苦力怕',
    desc: 'ssssss...',
    color: '#00AA00', 
    legs: '#000000', // To differentiate feet slightly
    face: CREEPER_FACE
  },
  {
    id: 'Enderman',
    name: '末影人',
    desc: '不要看我',
    color: '#111111', 
    legs: '#111111', 
    face: ENDERMAN_FACE
  },
  {
    id: 'Villager',
    name: '村民',
    desc: '哈!',
    color: '#624133', // Robe
    legs: '#624133', 
    face: VILLAGER_FACE
  },
  {
    id: 'Pigman',
    name: '猪人',
    desc: '中立亡灵',
    color: '#E0AA86', // Flesh
    legs: '#4C3322', // Loincloth
    face: PIGMAN_FACE
  },
  {
    id: 'Herobrine',
    name: 'Herobrine',
    desc: '被移除的传说',
    color: '#00AAAA', 
    legs: '#0000AA', 
    face: HEROBRINE_FACE
  },
  {
    id: 'Blaze',
    name: '烈焰人',
    desc: '燃烧吧',
    color: '#FFD700', 
    legs: '#FFA500', 
    face: BLAZE_FACE
  }
];

// Fallback level
export const DEFAULT_LEVEL_MAP = [
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "...................DDD.........................................G..................................",
  "..................DDDDD..........^............................GGG.................................",
  ".............................................................DDDDD................................",
  ".......QQQ.....................................^............DDDDDDD...............................",
  ".......................C...................................DDDDDDDDD............................B.",
  "....G.......G.........GGG.......M.......G......C......M...DDDDDDDDDDD.......................EEEEEE",
  "GGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGG",
  "DDDDDDDDDDDDDDDD...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD...DDDDDDDDDDDDDDDDDDDDDDDDD",
  "DDDDDDDDDDDDDDDDLLLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDLLLDDDDDDDDDDDDDDDDDDDDDDDDD",
  "SSSSSSSSSSSSSSSSLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSLLLSSSSSSSSSSSSSSSSSSSSSSSSS",
  "##################################################################################################"
];