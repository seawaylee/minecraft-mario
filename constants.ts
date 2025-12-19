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

export const CHARACTERS = [
  {
    id: 'Steve',
    name: '史蒂夫',
    desc: '经典英雄',
    color: '#00AAAA', // Shirt Cyan/Blueish
    legs: '#0000AA', // Pants Dark Blue
    face: STEVE_FACE
  },
  {
    id: 'Alex',
    name: '亚历克斯',
    desc: '敏捷探险家',
    color: '#638257', // Shirt Green
    legs: '#4C3322', // Pants Brown
    face: ALEX_FACE
  },
  {
    id: 'Zombie',
    name: '僵尸',
    desc: '脑子...?',
    color: '#00AAAA', // Shirt
    legs: '#0000AA', // Pants
    face: ZOMBIE_FACE
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