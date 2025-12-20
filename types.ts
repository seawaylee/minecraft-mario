export type ScreenState = 'MENU' | 'CHARACTER_SELECT' | 'GAME' | 'GAME_OVER' | 'WIN' | 'GENERATING_LEVEL';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type BiomeType = 'PLAINS' | 'DESERT' | 'SNOW' | 'NETHER' | 'THE_END';

export enum CharacterType {
  STEVE = 'Steve',
  ALEX = 'Alex',
  ZOMBIE = 'Zombie',
  SKELETON = 'Skeleton',
  CREEPER = 'Creeper',
  ENDERMAN = 'Enderman',
  VILLAGER = 'Villager',
  PIGMAN = 'Pigman',
  HEROBRINE = 'Herobrine',
  BLAZE = 'Blaze'
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isDead: boolean;
  facingRight: boolean;
  attackCooldown: number;
  isAttacking: boolean;
  health: number;
  maxHealth: number;
}

export interface Entity {
  id: string;
  type: 'ENEMY_CREEPER' | 'ENEMY_ZOMBIE' | 'ENEMY_GHAST' | 'ENEMY_ENDERMAN' | 'ENEMY_BOSS' | 'ITEM_DIAMOND' | 'PARTICLE' | 'PROJECTILE';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  dead?: boolean;
  lifeTime?: number; // For particles
  color?: string; // For particles
  projectileType?: 'ARROW' | 'FIREBALL' | 'TNT' | 'PEARL' | 'BONE' | 'POTION' | 'SKULL'; // For weapon customization
}

export interface Block {
  x: number;
  y: number;
  type: 'DIRT' | 'GRASS' | 'STONE' | 'BEDROCK' | 'LAVA' | 'PORTAL' | 'SAND' | 'SANDSTONE' | 'SNOW' | 'ICE' | 'NETHERRACK' | 'END_STONE' | 'OBSIDIAN';
  solid: boolean;
}

export interface LevelData {
  blocks: Block[];
  enemies: Entity[];
  items: Entity[];
  projectiles: Entity[];
  spawnX: number;
  spawnY: number;
  biome: BiomeType;
  mapWidth?: number; // Added to track boundaries
}

export interface GameContextType {
  score: number;
  lives: number;
  level: number;
  character: CharacterType;
}