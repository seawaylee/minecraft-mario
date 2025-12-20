import { ProjectileStyle, EnemyType } from "./types";

export const TILE_SIZE = 32;
export const GRAVITY = 0.35;
export const JUMP_FORCE = -11.5;
export const MOVE_SPEED = 5;
export const FRICTION = 0.85;
export const WORLD_HEIGHT_TILES = 15;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 480;

// Combat
export const PLAYER_MAX_HP = 10; 
export const ATTACK_COOLDOWN = 20; 
export const ATTACK_RANGE = 600; 
export const PROJECTILE_SPEED = 10;
export const BOSS_HP = 50;

// --- FACE GENERATOR HELPERS ---
const solid = (color: string) => Array(8).fill(color);
const face8x8 = (rows: string[][]) => rows;

// Common Colors
const SKIN = '#E0AA86';
const HAIR_STEVE = '#2B1E16';
const HAIR_ALEX = '#D67B38';
const GREEN = '#00AA00';
const BLACK = '#000000';
const WHITE = '#FFFFFF';

// --- CHARACTERS (30) ---

// 1. Steve
const STEVE_FACE = [
  solid(HAIR_STEVE), solid(HAIR_STEVE),
  solid(SKIN), solid(SKIN),
  ['#E0AA86', '#FFFFFF', '#494586', '#E0AA86', '#E0AA86', '#494586', '#FFFFFF', '#E0AA86'],
  ['#E0AA86', '#E0AA86', '#A97D64', '#A97D64', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
  ['#E0AA86', '#E0AA86', '#8F5844', '#8F5844', '#8F5844', '#8F5844', '#E0AA86', '#E0AA86'],
  solid(SKIN)
];
// 2. Alex
const ALEX_FACE = [
  solid(HAIR_ALEX), solid(HAIR_ALEX),
  ['#D67B38', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#D67B38'],
  ['#D67B38', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#F1C39A', '#D67B38'],
  ['#F1C39A', '#FFFFFF', '#365E47', '#F1C39A', '#F1C39A', '#365E47', '#FFFFFF', '#F1C39A'],
  solid('#F1C39A'),
  ['#F1C39A', '#F1C39A', '#C78363', '#C78363', '#C78363', '#C78363', '#F1C39A', '#F1C39A'],
  solid('#F1C39A')
];
// 3. Zombie
const ZOMBIE_FACE = [
  solid('#3D6836'), solid('#3D6836'),
  solid('#5FA84F'), solid('#5FA84F'),
  ['#5FA84F', '#242424', '#793939', '#5FA84F', '#5FA84F', '#793939', '#242424', '#5FA84F'],
  solid('#5FA84F'), solid('#5FA84F'), solid('#5FA84F')
];
// 4. Skeleton
const SKELETON_FACE = [
  solid('#B0B0B0'), solid('#B0B0B0'),
  ['#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0', '#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0'],
  ['#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0', '#B0B0B0', '#1A1A1A', '#1A1A1A', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#B0B0B0', '#333333', '#333333', '#B0B0B0', '#B0B0B0', '#B0B0B0'],
  solid('#B0B0B0'),
  ['#B0B0B0', '#444444', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#B0B0B0', '#444444', '#B0B0B0'],
  ['#B0B0B0', '#B0B0B0', '#444444', '#444444', '#444444', '#444444', '#B0B0B0', '#B0B0B0']
];
// 5. Creeper
const CREEPER_FACE = [
  solid(GREEN), solid(GREEN),
  ['#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00'],
  ['#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00'],
  ['#00AA00', '#00AA00', '#00AA00', '#000000', '#000000', '#00AA00', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#000000', '#000000', '#000000', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#000000', '#000000', '#000000', '#00AA00', '#00AA00'],
  ['#00AA00', '#00AA00', '#000000', '#00AA00', '#00AA00', '#000000', '#00AA00', '#00AA00']
];
// 6. Enderman
const ENDERMAN_FACE = [
  solid(BLACK), solid(BLACK), solid(BLACK), solid(BLACK),
  ['#000000', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#000000'],
  ['#000000', '#E0AAFF', '#CC00FA', '#CC00FA', '#CC00FA', '#CC00FA', '#E0AAFF', '#000000'],
  solid(BLACK), solid(BLACK)
];
// 7. Villager
const VILLAGER_FACE = [
  solid('#B88062'), solid('#B88062'),
  ['#B88062', '#3D2817', '#B88062', '#B88062', '#B88062', '#B88062', '#3D2817', '#B88062'],
  ['#B88062', '#FFFFFF', '#365E47', '#B88062', '#B88062', '#365E47', '#FFFFFF', '#B88062'],
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'],
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'],
  ['#B88062', '#B88062', '#B88062', '#8F5844', '#8F5844', '#B88062', '#B88062', '#B88062'],
  solid('#B88062')
];
// 8. Pigman
const PIGMAN_FACE = [
  solid('#EA9898'), solid('#EA9898'),
  ['#EA9898', '#FFFFFF', '#000000', '#EA9898', '#EA9898', '#000000', '#FFFFFF', '#EA9898'],
  solid('#EA9898'),
  ['#EA9898', '#EA9898', '#EA9898', '#7F5C54', '#7F5C54', '#EA9898', '#EA9898', '#EA9898'],
  ['#EA9898', '#EA9898', '#2D2D2D', '#7F5C54', '#7F5C54', '#2D2D2D', '#EA9898', '#EA9898'],
  ['#3D6836', '#3D6836', '#EA9898', '#EA9898', '#EA9898', '#EA9898', '#3D6836', '#3D6836'],
  ['#3D6836', '#3D6836', '#3D6836', '#EA9898', '#EA9898', '#3D6836', '#3D6836', '#3D6836']
];
// 9. Herobrine
const HEROBRINE_FACE = [
  solid(HAIR_STEVE), solid(HAIR_STEVE),
  solid(SKIN), solid(SKIN),
  ['#E0AA86', '#FFFFFF', '#FFFFFF', '#E0AA86', '#E0AA86', '#FFFFFF', '#FFFFFF', '#E0AA86'],
  ['#E0AA86', '#E0AA86', '#A97D64', '#A97D64', '#E0AA86', '#E0AA86', '#E0AA86', '#E0AA86'],
  ['#E0AA86', '#E0AA86', '#8F5844', '#8F5844', '#8F5844', '#8F5844', '#E0AA86', '#E0AA86'],
  solid(SKIN)
];
// 10. Blaze
const BLAZE_FACE = [
  solid('#FFD700'), solid('#FFD700'),
  ['#FFD700', '#3D2817', '#3D2817', '#FFD700', '#FFD700', '#3D2817', '#3D2817', '#FFD700'],
  ['#FFD700', '#3D2817', '#3D2817', '#FFD700', '#FFD700', '#3D2817', '#3D2817', '#FFD700'],
  solid('#FFD700'), solid('#FFD700'), solid('#FFA500'), solid('#FFA500')
];
// 11. Dream
const DREAM_FACE = [
  solid(GREEN), solid(GREEN), solid(GREEN), solid(GREEN),
  ['#00AA00', '#000000', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#000000', '#00AA00'],
  ['#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00', '#00AA00'],
  ['#00AA00', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#00AA00'],
  solid(GREEN)
];
// 12. Technoblade
const TECHNO_FACE = [
  ['#DAA520', '#DAA520', '#DAA520', '#DAA520', '#DAA520', '#DAA520', '#DAA520', '#DAA520'], // Crown
  ['#DAA520', '#F08080', '#DAA520', '#DAA520', '#DAA520', '#DAA520', '#F08080', '#DAA520'],
  solid('#F08080'), solid('#F08080'),
  ['#F08080', '#FFFFFF', '#000000', '#F08080', '#F08080', '#000000', '#FFFFFF', '#F08080'],
  ['#F08080', '#F08080', '#DB7093', '#DB7093', '#DB7093', '#DB7093', '#F08080', '#F08080'],
  solid('#F08080'), solid('#F08080')
];
// 13. Notch
const NOTCH_FACE = STEVE_FACE; // Classic human
// 14. Witch
const WITCH_FACE = VILLAGER_FACE.map((r, i) => i === 0 || i === 1 ? solid('#111111') : r); // Hat
// 15. Pillager
const PILLAGER_FACE = [
  solid('#9CA6AB'), solid('#9CA6AB'),
  ['#9CA6AB', '#3D2817', '#9CA6AB', '#9CA6AB', '#9CA6AB', '#9CA6AB', '#3D2817', '#9CA6AB'],
  ['#9CA6AB', '#2F4F4F', '#365E47', '#9CA6AB', '#9CA6AB', '#365E47', '#2F4F4F', '#9CA6AB'],
  solid('#9CA6AB'),
  ['#9CA6AB', '#9CA6AB', '#9CA6AB', '#8F5844', '#8F5844', '#9CA6AB', '#9CA6AB', '#9CA6AB'],
  solid('#9CA6AB'), solid('#9CA6AB')
];
// 16. Drowned
const DROWNED_FACE = [
  solid('#476562'), solid('#476562'),
  ['#476562', '#476562', '#476562', '#7BF3D0', '#7BF3D0', '#476562', '#476562', '#476562'],
  ['#476562', '#7BF3D0', '#7BF3D0', '#476562', '#476562', '#7BF3D0', '#7BF3D0', '#476562'],
  ['#476562', '#000000', '#000000', '#476562', '#476562', '#000000', '#000000', '#476562'],
  solid('#476562'), solid('#476562'), solid('#476562')
];
// 17. Wither Skeleton
const WITHER_SKEL_FACE = SKELETON_FACE.map(r => r.map(c => c === '#B0B0B0' ? '#222222' : c));
// 18. Slime
const SLIME_FACE = [
  solid('#73C056'), solid('#73C056'), solid('#73C056'),
  ['#73C056', '#222222', '#222222', '#73C056', '#73C056', '#222222', '#222222', '#73C056'],
  solid('#73C056'),
  ['#73C056', '#73C056', '#222222', '#73C056', '#73C056', '#222222', '#73C056', '#73C056'],
  solid('#73C056'), solid('#73C056')
];
// 19. Spider
const SPIDER_FACE = [
  solid('#1E1E1E'), solid('#1E1E1E'),
  ['#1E1E1E', '#FF0000', '#FF0000', '#1E1E1E', '#1E1E1E', '#FF0000', '#FF0000', '#1E1E1E'],
  solid('#1E1E1E'),
  ['#1E1E1E', '#1E1E1E', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#1E1E1E', '#1E1E1E'],
  solid('#1E1E1E'), solid('#1E1E1E'), solid('#1E1E1E')
];
// 20. Iron Golem
const GOLEM_FACE = [
  solid('#DEDEDE'), solid('#DEDEDE'),
  ['#DEDEDE', '#8B0000', '#8B0000', '#DEDEDE', '#DEDEDE', '#8B0000', '#8B0000', '#DEDEDE'],
  solid('#DEDEDE'),
  ['#DEDEDE', '#DEDEDE', '#DEDEDE', '#9C9088', '#9C9088', '#DEDEDE', '#DEDEDE', '#DEDEDE'],
  ['#DEDEDE', '#DEDEDE', '#DEDEDE', '#9C9088', '#9C9088', '#DEDEDE', '#DEDEDE', '#DEDEDE'],
  ['#DEDEDE', '#DEDEDE', '#DEDEDE', '#9C9088', '#9C9088', '#DEDEDE', '#DEDEDE', '#DEDEDE'],
  solid('#DEDEDE')
];
// 21. Snow Golem
const SNOW_GOLEM_FACE = [
  solid('#E08518'), solid('#E08518'), // Pumpkin
  ['#E08518', '#000000', '#000000', '#E08518', '#E08518', '#000000', '#000000', '#E08518'],
  solid('#E08518'),
  ['#E08518', '#E08518', '#000000', '#000000', '#000000', '#000000', '#E08518', '#E08518'],
  ['#E08518', '#000000', '#E08518', '#000000', '#000000', '#E08518', '#000000', '#E08518'],
  solid('#E08518'), solid('#FFFFFF')
];
// 22. Warden
const WARDEN_FACE = [
  solid('#0D1C24'), 
  ['#0D1C24', '#006666', '#006666', '#0D1C24', '#0D1C24', '#006666', '#006666', '#0D1C24'],
  solid('#0D1C24'),
  solid('#CCCCCC'), // Blind
  ['#0D1C24', '#009999', '#009999', '#009999', '#009999', '#009999', '#009999', '#0D1C24'],
  solid('#0D1C24'), solid('#0D1C24'), solid('#0D1C24')
];
// 23. Phantom
const PHANTOM_FACE = [
  solid('#3C4B82'), solid('#3C4B82'),
  ['#3C4B82', '#7CFC00', '#7CFC00', '#3C4B82', '#3C4B82', '#7CFC00', '#7CFC00', '#3C4B82'],
  solid('#3C4B82'), solid('#3C4B82'), solid('#3C4B82'), solid('#3C4B82'), solid('#3C4B82')
];
// 24. Allay
const ALLAY_FACE = [
  solid('#64C9E7'), solid('#64C9E7'),
  ['#64C9E7', '#FFFFFF', '#FFFFFF', '#64C9E7', '#64C9E7', '#FFFFFF', '#FFFFFF', '#64C9E7'],
  solid('#64C9E7'), solid('#64C9E7'), solid('#64C9E7'), solid('#64C9E7'), solid('#64C9E7')
];
// 25. Vex
const VEX_FACE = [
  solid('#9CA6AB'), solid('#9CA6AB'),
  ['#9CA6AB', '#000000', '#000000', '#9CA6AB', '#9CA6AB', '#000000', '#000000', '#9CA6AB'],
  ['#9CA6AB', '#8B0000', '#8B0000', '#9CA6AB', '#9CA6AB', '#8B0000', '#8B0000', '#9CA6AB'], // Angry eyes
  solid('#9CA6AB'), solid('#9CA6AB'), solid('#9CA6AB'), solid('#9CA6AB')
];
// 26. Bee
const BEE_FACE = [
  ['#FFD700', '#000000', '#000000', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFD700', '#87CEEB', '#87CEEB', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['#FFD700', '#000000', '#000000', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  solid('#FFD700'), solid('#FFD700'), solid('#FFD700'), solid('#FFD700'), solid('#FFD700')
];
// 27. Cow
const COW_FACE = [
  ['#4D3319', '#4D3319', '#CD8C95', '#CD8C95', '#CD8C95', '#CD8C95', '#4D3319', '#4D3319'], // Horns
  ['#4D3319', '#4D3319', '#CD8C95', '#CD8C95', '#CD8C95', '#CD8C95', '#4D3319', '#4D3319'],
  ['#4D3319', '#FFFFFF', '#000000', '#4D3319', '#4D3319', '#000000', '#FFFFFF', '#4D3319'],
  ['#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6'],
  ['#A6A6A6', '#000000', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#A6A6A6', '#000000', '#A6A6A6'],
  solid('#A6A6A6'), solid('#4D3319'), solid('#4D3319')
];
// 28. Pig
const PIG_FACE = [
  solid('#F0B6B6'), solid('#F0B6B6'),
  ['#F0B6B6', '#FFFFFF', '#000000', '#F0B6B6', '#F0B6B6', '#000000', '#FFFFFF', '#F0B6B6'],
  ['#F0B6B6', '#F0B6B6', '#F0B6B6', '#DB7093', '#DB7093', '#F0B6B6', '#F0B6B6', '#F0B6B6'],
  ['#F0B6B6', '#F0B6B6', '#DB7093', '#8B4513', '#8B4513', '#DB7093', '#F0B6B6', '#F0B6B6'],
  solid('#F0B6B6'), solid('#F0B6B6'), solid('#F0B6B6')
];
// 29. Sheep
const SHEEP_FACE = [
  solid('#E5E5E5'), solid('#E5E5E5'), solid('#E5E5E5'), // Wool
  ['#E5E5E5', '#D6B49D', '#D6B49D', '#D6B49D', '#D6B49D', '#D6B49D', '#D6B49D', '#E5E5E5'],
  ['#E5E5E5', '#D6B49D', '#FFFFFF', '#000000', '#000000', '#FFFFFF', '#D6B49D', '#E5E5E5'],
  ['#E5E5E5', '#D6B49D', '#F4A460', '#F4A460', '#F4A460', '#F4A460', '#D6B49D', '#E5E5E5'],
  solid('#E5E5E5'), solid('#E5E5E5')
];
// 30. Dinnerbone (Just steve but logic will flip)
const DINNERBONE_FACE = STEVE_FACE;

export const CHARACTERS = [
  { id: 'Steve', name: '史蒂夫', desc: '经典英雄', color: '#00AAAA', legs: '#0000AA', face: STEVE_FACE, projectileType: 'ARROW' },
  { id: 'Alex', name: '亚历克斯', desc: '敏捷探险家', color: '#638257', legs: '#4C3322', face: ALEX_FACE, projectileType: 'ARROW' },
  { id: 'Zombie', name: '僵尸', desc: '脑子...?', color: '#00AAAA', legs: '#0000AA', face: ZOMBIE_FACE, projectileType: 'POTION' },
  { id: 'Skeleton', name: '骷髅', desc: '远程射手', color: '#B0B0B0', legs: '#B0B0B0', face: SKELETON_FACE, projectileType: 'BONE' },
  { id: 'Creeper', name: '苦力怕', desc: 'ssssss...', color: '#00AA00', legs: '#000000', face: CREEPER_FACE, projectileType: 'TNT' },
  { id: 'Enderman', name: '末影人', desc: '瞬移者', color: '#111111', legs: '#111111', face: ENDERMAN_FACE, projectileType: 'PEARL' },
  { id: 'Villager', name: '村民', desc: '哈!', color: '#624133', legs: '#624133', face: VILLAGER_FACE, projectileType: 'POTION' },
  { id: 'Pigman', name: '猪人', desc: '中立亡灵', color: '#E0AA86', legs: '#4C3322', face: PIGMAN_FACE, projectileType: 'FIREBALL' },
  { id: 'Herobrine', name: 'Herobrine', desc: '传说', color: '#00AAAA', legs: '#0000AA', face: HEROBRINE_FACE, projectileType: 'SKULL' },
  { id: 'Blaze', name: '烈焰人', desc: '火焰领主', color: '#FFD700', legs: '#FFA500', face: BLAZE_FACE, projectileType: 'FIREBALL' },
  // New
  { id: 'Dream', name: 'Dream', desc: '速通者', color: GREEN, legs: BLACK, face: DREAM_FACE, projectileType: 'PEARL' },
  { id: 'Technoblade', name: 'Technoblade', desc: '血神', color: '#DB7093', legs: '#000000', face: TECHNO_FACE, projectileType: 'POTION' },
  { id: 'Notch', name: 'Notch', desc: '创世神', color: '#000000', legs: '#000000', face: NOTCH_FACE, projectileType: 'EXPERIENCE' },
  { id: 'Dinnerbone', name: 'Dinnerbone', desc: '倒立者', color: '#00AAAA', legs: '#0000AA', face: DINNERBONE_FACE, projectileType: 'ARROW' },
  { id: 'Witch', name: '女巫', desc: '炼金术士', color: '#4B0082', legs: '#2E8B57', face: WITCH_FACE, projectileType: 'POTION' },
  { id: 'Pillager', name: '掠夺者', desc: '灾厄村民', color: '#5F9EA0', legs: '#2F4F4F', face: PILLAGER_FACE, projectileType: 'ARROW' },
  { id: 'Drowned', name: '溺尸', desc: '水鬼', color: '#476562', legs: '#2F4F4F', face: DROWNED_FACE, projectileType: 'TRIDENT' },
  { id: 'WitherSkeleton', name: '凋零骷髅', desc: '地狱杀手', color: '#222222', legs: '#222222', face: WITHER_SKEL_FACE, projectileType: 'SKULL' },
  { id: 'Slime', name: '史莱姆', desc: '弹跳者', color: '#73C056', legs: '#000000', face: SLIME_FACE, projectileType: 'SNOWBALL' }, // Using snowball as slimeball
  { id: 'Spider', name: '蜘蛛', desc: '攀爬者', color: '#1E1E1E', legs: '#1E1E1E', face: SPIDER_FACE, projectileType: 'POTION' }, // Poison
  { id: 'IronGolem', name: '铁傀儡', desc: '守护者', color: '#DEDEDE', legs: '#9C9088', face: GOLEM_FACE, projectileType: 'SNOWBALL' }, // Throwing enemies?
  { id: 'SnowGolem', name: '雪傀儡', desc: '雪人', color: '#FFFFFF', legs: '#FFFFFF', face: SNOW_GOLEM_FACE, projectileType: 'SNOWBALL' },
  { id: 'Warden', name: '监守者', desc: '深渊守卫', color: '#0D1C24', legs: '#006666', face: WARDEN_FACE, projectileType: 'SONIC_BOOM' },
  { id: 'Phantom', name: '幻翼', desc: '夜魇', color: '#3C4B82', legs: '#000000', face: PHANTOM_FACE, projectileType: 'EGG' },
  { id: 'Allay', name: '悦灵', desc: '小帮手', color: '#64C9E7', legs: '#64C9E7', face: ALLAY_FACE, projectileType: 'EXPERIENCE' },
  { id: 'Vex', name: '恼鬼', desc: '穿墙者', color: '#9CA6AB', legs: '#9CA6AB', face: VEX_FACE, projectileType: 'TRIDENT' },
  { id: 'Bee', name: '蜜蜂', desc: '嗡嗡嗡', color: '#FFD700', legs: '#000000', face: BEE_FACE, projectileType: 'EGG' }, // Stinger
  { id: 'Cow', name: '牛', desc: 'Moo', color: '#4D3319', legs: '#A6A6A6', face: COW_FACE, projectileType: 'SNOWBALL' }, // Milk?
  { id: 'Pig', name: '猪', desc: 'Oink', color: '#F0B6B6', legs: '#F0B6B6', face: PIG_FACE, projectileType: 'EGG' },
  { id: 'Sheep', name: '羊', desc: 'Baa', color: '#E5E5E5', legs: '#FFFFFF', face: SHEEP_FACE, projectileType: 'SNOWBALL' } // Wool
];

export interface MobConfig {
    type: EnemyType;
    width: number;
    height: number;
    hp: number;
    vx: number;
    color: string;
    fly?: boolean;
    projectile?: ProjectileStyle;
    behavior: 'WALK' | 'FLY' | 'JUMP' | 'TELEPORT' | 'BOSS';
}

export const MOBS: Record<string, MobConfig> = {
    'ENEMY_ZOMBIE': { type: 'ENEMY_ZOMBIE', width: 24, height: 30, hp: 5, vx: 0.8, color: '#3b82f6', behavior: 'WALK' },
    'ENEMY_SKELETON': { type: 'ENEMY_SKELETON', width: 24, height: 30, hp: 4, vx: 0, color: '#e5e7eb', behavior: 'WALK', projectile: 'ARROW' },
    'ENEMY_CREEPER': { type: 'ENEMY_CREEPER', width: 24, height: 24, hp: 3, vx: 0.5, color: '#22c55e', behavior: 'WALK' },
    'ENEMY_ENDERMAN': { type: 'ENEMY_ENDERMAN', width: 24, height: 50, hp: 15, vx: 0, color: '#111', behavior: 'TELEPORT' },
    'ENEMY_SPIDER': { type: 'ENEMY_SPIDER', width: 36, height: 16, hp: 4, vx: 1.5, color: '#1f2937', behavior: 'JUMP' },
    'ENEMY_SLIME': { type: 'ENEMY_SLIME', width: 24, height: 24, hp: 6, vx: 0, color: '#84cc16', behavior: 'JUMP' },
    'ENEMY_WITCH': { type: 'ENEMY_WITCH', width: 24, height: 32, hp: 8, vx: 0, color: '#6b21a8', behavior: 'WALK', projectile: 'POTION' },
    'ENEMY_PILLAGER': { type: 'ENEMY_PILLAGER', width: 24, height: 30, hp: 8, vx: 0.6, color: '#475569', behavior: 'WALK', projectile: 'ARROW' },
    'ENEMY_GHAST': { type: 'ENEMY_GHAST', width: 48, height: 48, hp: 10, vx: 0.5, color: '#f3f4f6', fly: true, behavior: 'FLY', projectile: 'FIREBALL' },
    'ENEMY_BLAZE': { type: 'ENEMY_BLAZE', width: 24, height: 36, hp: 8, vx: 0.3, color: '#eab308', fly: true, behavior: 'FLY', projectile: 'FIREBALL' },
    'ENEMY_WITHER_SKELETON': { type: 'ENEMY_WITHER_SKELETON', width: 26, height: 34, hp: 10, vx: 1.2, color: '#111827', behavior: 'WALK' },
    'ENEMY_PIGMAN': { type: 'ENEMY_PIGMAN', width: 24, height: 30, hp: 8, vx: 0.8, color: '#fca5a5', behavior: 'WALK' },
    'ENEMY_PHANTOM': { type: 'ENEMY_PHANTOM', width: 36, height: 12, hp: 5, vx: 2, color: '#1e3a8a', fly: true, behavior: 'FLY' },
    'ENEMY_DROWNED': { type: 'ENEMY_DROWNED', width: 24, height: 30, hp: 6, vx: 0.7, color: '#06b6d4', behavior: 'WALK', projectile: 'TRIDENT' },
    'ENEMY_WARDEN': { type: 'ENEMY_WARDEN', width: 40, height: 55, hp: 30, vx: 0.4, color: '#022c22', behavior: 'WALK', projectile: 'SONIC_BOOM' },
    'ENEMY_BOSS': { type: 'ENEMY_BOSS', width: 100, height: 60, hp: BOSS_HP, vx: 0, color: '#000', behavior: 'BOSS' }
};

export const DEFAULT_LEVEL_MAP = [
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "####################################################################################################"
];

export const FALLBACK_LEVEL = DEFAULT_LEVEL_MAP;