export type ScreenState = 'MENU' | 'CHARACTER_SELECT' | 'GAME' | 'GAME_OVER' | 'WIN' | 'GENERATING_LEVEL';

export enum CharacterType {
  STEVE = 'Steve',
  ALEX = 'Alex',
  ZOMBIE = 'Zombie'
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
  type: 'ENEMY_CREEPER' | 'ENEMY_SPIDER' | 'ENEMY_GHAST' | 'ENEMY_ENDERMAN' | 'ENEMY_BOSS' | 'ITEM_DIAMOND' | 'PARTICLE' | 'PROJECTILE';
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
}

export interface Block {
  x: number;
  y: number;
  type: 'DIRT' | 'GRASS' | 'STONE' | 'BEDROCK' | 'LAVA' | 'PORTAL';
  solid: boolean;
}

export interface LevelData {
  blocks: Block[];
  enemies: Entity[];
  items: Entity[];
  projectiles: Entity[];
  spawnX: number;
  spawnY: number;
}

export interface GameContextType {
  score: number;
  lives: number;
  level: number;
  character: CharacterType;
}