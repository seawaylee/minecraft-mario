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
  BLAZE = 'Blaze',
  // New Characters
  DREAM = 'Dream',
  TECHNO = 'Technoblade',
  NOTCH = 'Notch',
  DINNERBONE = 'Dinnerbone',
  WITCH = 'Witch',
  PILLAGER = 'Pillager',
  DROWNED = 'Drowned',
  WITHER_SKELETON = 'WitherSkeleton',
  SLIME = 'Slime',
  SPIDER = 'Spider',
  IRON_GOLEM = 'IronGolem',
  SNOW_GOLEM = 'SnowGolem',
  WARDEN = 'Warden',
  PHANTOM = 'Phantom',
  ALLAY = 'Allay',
  VEX = 'Vex',
  BEE = 'Bee',
  COW = 'Cow',
  PIG = 'Pig',
  SHEEP = 'Sheep'
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

export type EnemyType = 
  | 'ENEMY_CREEPER' | 'ENEMY_ZOMBIE' | 'ENEMY_SKELETON' | 'ENEMY_SPIDER' | 'ENEMY_SLIME' 
  | 'ENEMY_ENDERMAN' | 'ENEMY_WITCH' | 'ENEMY_PILLAGER' 
  | 'ENEMY_GHAST' | 'ENEMY_BLAZE' | 'ENEMY_WITHER_SKELETON' | 'ENEMY_PIGMAN'
  | 'ENEMY_PHANTOM' | 'ENEMY_DROWNED' | 'ENEMY_WARDEN' 
  | 'ENEMY_BOSS';

export type ProjectileStyle = 
  | 'ARROW' | 'FIREBALL' | 'TNT' | 'PEARL' | 'BONE' | 'POTION' | 'SKULL' 
  | 'TRIDENT' | 'SNOWBALL' | 'SONIC_BOOM' | 'EGG' | 'DRAGON_BREATH' | 'EXPERIENCE';

export interface Entity {
  id: string;
  type: EnemyType | 'ITEM_DIAMOND' | 'PARTICLE' | 'PROJECTILE';
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
  projectileType?: ProjectileStyle; // For weapon customization
  attackCooldown?: number; // For enemies that shoot
}

export interface Block {
  x: number;
  y: number;
  type: 'DIRT' | 'GRASS' | 'STONE' | 'BEDROCK' | 'LAVA' | 'PORTAL' | 'SAND' | 'SANDSTONE' | 'SNOW' | 'ICE' | 'NETHERRACK' | 'END_STONE' | 'OBSIDIAN' | 'WOOL';
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