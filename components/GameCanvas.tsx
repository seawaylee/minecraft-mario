import React, { useEffect, useRef, useState } from 'react';
import { Block, Entity, LevelData, PlayerState, CharacterType, Difficulty, Density, BiomeType, EnemyType, ProjectileStyle } from '../types';
import { TILE_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, CANVAS_WIDTH, CANVAS_HEIGHT, CHARACTERS, PLAYER_MAX_HP, ATTACK_COOLDOWN, ATTACK_RANGE, BOSS_HP, PROJECTILE_SPEED, MOBS } from '../constants';
import { audioController } from '../utils/audio';

interface GameCanvasProps {
  levelRaw: string[];
  character: CharacterType;
  difficulty: Difficulty;
  density: Density;
  biome: BiomeType;
  onGameOver: () => void;
  onWin: (score: number) => void;
  onAddScore: (amount: number) => void;
  score: number;
}

interface DamageNumber {
    id: string;
    x: number;
    y: number;
    value: number;
    lifeTime: number;
    vy: number;
}

// --- HELPER FUNCTIONS (Pure, Outside Component) ---
const rectIntersect = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;

const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, mainColor: string, topColor?: string, transparent: boolean = false) => {
    if (transparent) ctx.globalAlpha = 0.6;
    ctx.fillStyle = mainColor; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for(let i=0; i<3; i++) ctx.fillRect(x+Math.random()*TILE_SIZE, y+Math.random()*TILE_SIZE, 4, 4);
    if (topColor) { ctx.fillStyle = topColor; ctx.fillRect(x, y, TILE_SIZE, 6); }
    if (transparent) ctx.globalAlpha = 1.0;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ levelRaw, character, difficulty, density, biome, onGameOver, onWin, onAddScore, score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const staticLevelCanvas = useRef<HTMLCanvasElement | null>(null);
  const isFlying = useRef<boolean>(false);
  
  // Refs for Props to avoid stale closures in the game loop
  const characterRef = useRef(character);
  const difficultyRef = useRef(difficulty);
  const densityRef = useRef(density);
  const biomeRef = useRef(biome);

  useEffect(() => { characterRef.current = character; }, [character]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { densityRef.current = density; }, [density]);
  useEffect(() => { biomeRef.current = biome; }, [biome]);

  const getMaxHealth = () => difficulty === 'HARD' ? 5 : (difficulty === 'EASY' ? 20 : 10);
  
  const player = useRef<PlayerState>({
    x: 50, y: 100, vx: 0, vy: 0, width: 24, height: 30, 
    isGrounded: false, isDead: false, facingRight: true,
    health: getMaxHealth(), maxHealth: getMaxHealth(),
    attackCooldown: 0, isAttacking: false
  });
  
  const level = useRef<LevelData>({ blocks: [], enemies: [], items: [], projectiles: [], spawnX: 50, spawnY: 100, biome: 'PLAINS', mapWidth: 0 });
  const camera = useRef({ x: 0 });
  const particles = useRef<Entity[]>([]);
  const damageNumbers = useRef<DamageNumber[]>([]);
  const [bossActive, setBossActive] = useState(false);
  const [flyingModeUI, setFlyingModeUI] = useState(false);

  // --- HELPER FUNCTIONS (Inside Component) ---

  // NOTE: Changed to function declarations to allow hoisting and avoid "is not defined" errors in circular refs

  function getEnemyByMarker(marker: string, b: BiomeType): Entity | null {
      let type: EnemyType = 'ENEMY_ZOMBIE';
      
      if (b === 'NETHER') {
          if (marker === 'f') type = Math.random() > 0.5 ? 'ENEMY_GHAST' : 'ENEMY_BLAZE';
          else if (marker === 's') type = 'ENEMY_WITHER_SKELETON';
          else if (marker === 't') type = 'ENEMY_PIGMAN';
          else type = Math.random() > 0.5 ? 'ENEMY_PIGMAN' : 'ENEMY_WITHER_SKELETON';
      } else if (b === 'THE_END') {
          if (marker === 'f') type = 'ENEMY_PHANTOM';
          else type = 'ENEMY_ENDERMAN';
      } else if (b === 'DESERT') {
          if (marker === 'f') type = 'ENEMY_PHANTOM';
          else if (marker === 's') type = 'ENEMY_SKELETON';
          else if (marker === 't') type = 'ENEMY_PILLAGER';
          else type = 'ENEMY_ZOMBIE';
      } else if (b === 'SNOW') {
          if (marker === 'f') type = 'ENEMY_PHANTOM';
          else if (marker === 's') type = 'ENEMY_WITCH';
          else if (marker === 't') type = 'ENEMY_WARDEN';
          else type = 'ENEMY_ZOMBIE';
      } else {
          // PLAINS
          if (marker === 'f') type = 'ENEMY_PHANTOM';
          else if (marker === 's') type = Math.random() > 0.5 ? 'ENEMY_SKELETON' : 'ENEMY_VINDICATOR';
          else if (marker === 't') type = Math.random() > 0.5 ? 'ENEMY_RAVAGER' : 'ENEMY_CREEPER';
          else {
              const r = Math.random();
              if (r < 0.3) type = 'ENEMY_ZOMBIE';
              else if (r < 0.5) type = 'ENEMY_SPIDER';
              else if (r < 0.7) type = 'ENEMY_PILLAGER';
              else type = 'ENEMY_DROWNED';
          }
      }

      if (marker === 'C') type = 'ENEMY_CREEPER';
      if (marker === 'Z') type = 'ENEMY_ZOMBIE';
      if (marker === 'M') type = 'ENEMY_ENDERMAN';
      if (marker === '^') type = 'ENEMY_GHAST';
      if (marker === 'B') type = 'ENEMY_BOSS';

      const config = MOBS[type];
      if (!config) return null;

      return {
          id: `e_${Math.random()}`,
          type: type,
          x: 0, y: 0, 
          width: config.width,
          height: config.height,
          vx: config.vx * (Math.random() > 0.5 ? 1 : -1),
          vy: 0,
          hp: config.hp,
          maxHp: config.hp,
          attackCooldown: 100 + Math.random() * 100
      };
  }

  function spawnParticles(x: number, y: number, color: string, count: number) {
      for(let i=0; i<count; i++) particles.current.push({ id: Math.random().toString(), type: 'PARTICLE', x, y, width: 4, height: 4, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, lifeTime: 30, color, hp: 0, maxHp: 0 });
  }

  function spawnDamageNumber(x: number, y: number, value: number) {
      damageNumbers.current.push({
          id: Math.random().toString(),
          x, y, value, lifeTime: 40, vy: -2
      });
  }

  function die() { if (player.current.isDead) return; player.current.isDead = true; audioController.playSFX('EXPLODE'); setTimeout(onGameOver, 1000); }

  function takeDamage(amount: number) {
      if (isFlying.current) return;
      player.current.health -= amount; audioController.playSFX('EXPLODE');
      if (player.current.health <= 0) die();
  }

  function explode(cx: number, cy: number, radius: number = 60) {
      audioController.playSFX('EXPLODE');
      spawnParticles(cx, cy, '#FFA500', 20); 
      spawnParticles(cx, cy, '#555', 10); 
      
      const gridX = Math.floor((cx) / TILE_SIZE);
      const gridY = Math.floor((cy) / TILE_SIZE);
      const range = Math.ceil(radius / TILE_SIZE);
      
      const blocksToRemove: number[] = [];
      
      level.current.blocks.forEach((b, idx) => {
          if (b.type === 'BEDROCK' || b.type === 'PORTAL') return;
          const bx = Math.floor(b.x / TILE_SIZE);
          const by = Math.floor(b.y / TILE_SIZE);
          
          if (Math.abs(bx - gridX) <= range && Math.abs(by - gridY) <= range) {
             if (Math.hypot(b.x + TILE_SIZE/2 - cx, b.y + TILE_SIZE/2 - cy) < radius) {
                 blocksToRemove.push(idx);
             }
          }
      });
      
      blocksToRemove.sort((a, b) => b - a).forEach(idx => {
          const b = level.current.blocks[idx];
          level.current.blocks.splice(idx, 1);
          const ctx = staticLevelCanvas.current?.getContext('2d');
          if (ctx) ctx.clearRect(b.x, b.y, TILE_SIZE, TILE_SIZE);
      });
  }

  function checkCollision(obj: Entity | PlayerState, axis: 'x' | 'y') {
    const isPlayer = (obj as any).isGrounded !== undefined;
    const checkRadius = 150;

    for (const block of level.current.blocks) {
      if (Math.abs(block.x - obj.x) > checkRadius || Math.abs(block.y - obj.y) > checkRadius) continue;
      
      if (isPlayer) {
          if (block.type === 'LAVA' && rectIntersect(obj.x+4, obj.y, obj.width-8, obj.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
             if (!isFlying.current) die(); return;
          }
          if (block.type === 'PORTAL' && rectIntersect(obj.x, obj.y, obj.width, obj.height, block.x, block.y - TILE_SIZE * 3, TILE_SIZE * 3, TILE_SIZE * 4)) {
              if (level.current.enemies.some(e => e.type === 'ENEMY_BOSS' && !e.dead)) return;
              onWin(score); (obj as PlayerState).isDead = true; return;
          }
      }

      if (!block.solid) continue;

      if (rectIntersect(obj.x, obj.y, obj.width, obj.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
          if (axis === 'x') {
            obj.vx = isPlayer ? 0 : -obj.vx; 
            obj.x = obj.vx > 0 || (isPlayer && (obj as PlayerState).facingRight) ? block.x - obj.width : block.x + TILE_SIZE; 
          } else {
            if (obj.vy > 0) { obj.y = block.y - obj.height; if(isPlayer) (obj as PlayerState).isGrounded = true; } 
            else { obj.y = block.y + TILE_SIZE; }
            obj.vy = 0;
          }
      }
    }
  }

  function renderStaticLevel(w: number, h: number) {
      const offscreen = document.createElement('canvas');
      offscreen.width = w + 100;
      offscreen.height = h + 100;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;
      
      offCtx.clearRect(0, 0, w, h);
      level.current.blocks.forEach(b => {
             const color = b.type === 'GRASS' ? '#4ade80' : b.type === 'DIRT' ? '#5c4033' : b.type === 'STONE' ? '#78716c' :
                           b.type === 'SAND' ? '#F6D7B0' : b.type === 'SANDSTONE' ? '#E6C288' : b.type === 'SNOW' ? '#FFFFFF' :
                           b.type === 'ICE' ? '#A5F2F3' : b.type === 'NETHERRACK' ? '#6F3637' : b.type === 'END_STONE' ? '#DFE0A8' :
                           b.type === 'OBSIDIAN' ? '#141019' : b.type === 'BEDROCK' ? '#292524' : '#5c4033';
             
             if (b.type === 'LAVA') {
                 offCtx.fillStyle = '#cf222e';
                 offCtx.fillRect(b.x, b.y + 4, TILE_SIZE, TILE_SIZE - 4);
             } else if (b.type !== 'PORTAL') {
                 drawBlock(offCtx, b.x, b.y, color, b.type === 'GRASS' ? '#5c4033' : undefined, b.type === 'ICE');
             }
      });
      staticLevelCanvas.current = offscreen;
  }

  function fireProjectile(source: Entity | PlayerState, charType?: CharacterType, projectileOverride?: ProjectileStyle) {
      let pType: ProjectileStyle = 'ARROW';
      let vx = PROJECTILE_SPEED;
      let vy = 0;
      let facingRight = true;

      if ((source as any).facingRight !== undefined) facingRight = (source as any).facingRight;
      else facingRight = source.vx > 0;

      // Player shooting
      if (charType) {
          (source as PlayerState).isAttacking = true;
          audioController.playSFX('JUMP');
          const charData = CHARACTERS.find(c => c.id === charType);
          if (charData) {
              if (charData.projectileType) pType = charData.projectileType as ProjectileStyle;
              
              // FORCE Auto-tracking logic
              let nearest: Entity | null = null;
              let bestScore = Infinity; 
              
              const startX = facingRight ? source.x + source.width : source.x;
              const startY = source.y + source.height / 2;

              for (const e of level.current.enemies) {
                  if (e.dead) continue;
                  
                  const ex = e.x + e.width / 2;
                  const ey = e.y + e.height / 2;
                  
                  // Filter: Must be on screen (VISIBLE)
                  const onScreen = ex > camera.current.x && ex < camera.current.x + CANVAS_WIDTH && ey > -100 && ey < CANVAS_HEIGHT + 100;
                  if (!onScreen) continue;

                  const dist = Math.hypot(ex - (source.x + source.width/2), ey - (source.y + source.height/2));
                  
                  let score = dist;
                  if (e.type === 'ENEMY_BOSS') score -= 500; 
                  
                  // Bias towards direction facing
                  if (facingRight && ex > source.x) score -= 200;
                  if (!facingRight && ex < source.x) score -= 200;

                  if (score < bestScore) {
                      bestScore = score;
                      nearest = e;
                  }
              }

              if (nearest) {
                  const targetX = nearest.x + nearest.width / 2;
                  const targetY = nearest.y + nearest.height / 2;
                  
                  const dx = targetX - startX;
                  const dy = targetY - startY;
                  const mag = Math.sqrt(dx*dx + dy*dy);
                  if (mag > 0) {
                      vx = (dx / mag) * PROJECTILE_SPEED;
                      vy = (dy / mag) * PROJECTILE_SPEED;
                      projectileOverride = pType; 
                      (source as any).tempNoGravity = true; 
                  }
              }
              var targetId = nearest ? nearest.id : undefined;
          }
      } else if (projectileOverride) {
          // Enemy shooting
          pType = projectileOverride;
          const dx = player.current.x - source.x;
          const dy = player.current.y - source.y;
          const mag = Math.sqrt(dx*dx + dy*dy);
          vx = (dx / mag) * (PROJECTILE_SPEED * 0.6);
          vy = (dy / mag) * (PROJECTILE_SPEED * 0.6);
      }

      if (!projectileOverride) vx = facingRight ? PROJECTILE_SPEED : -PROJECTILE_SPEED;

      if (pType === 'TNT') { vy = -5; vx *= 0.6; }
      if (pType === 'POTION') { vy = -4; vx *= 0.7; }
      if (pType === 'TRIDENT') { vx *= 1.2; }
      if (pType === 'EGG') { vy = -2; }

      const proj: Entity = {
          id: `p_${Date.now()}_${Math.random()}`,
          type: 'PROJECTILE',
          x: facingRight ? source.x + source.width : source.x,
          y: source.y + source.height / 2,
          width: 8, height: 8,
          vx, vy, hp: 1, maxHp: 1,
          projectileType: pType,
          color: charType ? undefined : '#FF0000', 
          noGravity: (source as any).tempNoGravity,
          targetId: (charType && typeof targetId !== 'undefined') ? targetId : undefined
      };
      
      delete (source as any).tempNoGravity;
      
      if (pType === 'SONIC_BOOM') { proj.width = 16; proj.height = 16; proj.lifeTime = 30; }

      if (!level.current.projectiles) level.current.projectiles = [];
      level.current.projectiles.push(proj);

      if (charType) setTimeout(() => { (source as PlayerState).isAttacking = false; }, 100);
  }

  function performDig(p: PlayerState) {
      p.isAttacking = true; p.attackCooldown = 15;
      const gridX = Math.floor((p.x + (p.facingRight ? p.width + 10 : -10)) / TILE_SIZE);
      const gridY = Math.floor((p.y + p.height/2) / TILE_SIZE);
      const blockIndex = level.current.blocks.findIndex(b => Math.floor(b.x / TILE_SIZE) === gridX && Math.floor(b.y / TILE_SIZE) === gridY);
      if (blockIndex !== -1) {
          const block = level.current.blocks[blockIndex];
          if (block.type !== 'BEDROCK' && block.type !== 'PORTAL') {
              level.current.blocks.splice(blockIndex, 1);
              spawnParticles(block.x + TILE_SIZE/2, block.y + TILE_SIZE/2, '#888', 8);
              audioController.playSFX('COIN');
              const ctx = staticLevelCanvas.current?.getContext('2d');
              if (ctx) ctx.clearRect(block.x, block.y, TILE_SIZE, TILE_SIZE);
          }
      }
      setTimeout(() => { p.isAttacking = false; }, 200);
  }

  function updateEntities() {
    const p = player.current;
    
    // Projectiles
    if (level.current.projectiles) {
        level.current.projectiles.forEach(proj => {
            if (proj.dead) return;
            
            // HOMING LOGIC
            if (proj.targetId) {
                const target = level.current.enemies.find(e => e.id === proj.targetId && !e.dead);
                if (target) {
                    const tx = target.x + target.width/2;
                    const ty = target.y + target.height/2;
                    const px = proj.x + proj.width/2;
                    const py = proj.y + proj.height/2;
                    const dx = tx - px;
                    const dy = ty - py;
                    const mag = Math.sqrt(dx*dx + dy*dy);
                    if (mag > 0) {
                        const speed = PROJECTILE_SPEED;
                        proj.vx = (dx / mag) * speed;
                        proj.vy = (dy / mag) * speed;
                    }
                }
            }

            proj.x += proj.vx; proj.y += proj.vy;
            
            if (!proj.noGravity) {
                if (proj.projectileType === 'TNT' || proj.projectileType === 'POTION' || proj.projectileType === 'SNOWBALL' || proj.projectileType === 'EGG') {
                    proj.vy += GRAVITY * 0.5;
                }
            }

            for (const block of level.current.blocks) {
                if (!block.solid) continue;
                if (rectIntersect(proj.x, proj.y, proj.width, proj.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
                    proj.dead = true;
                    if (proj.projectileType === 'TNT') {
                        explode(proj.x + proj.width/2, proj.y + proj.height/2);
                    } else {
                        spawnParticles(proj.x, proj.y, '#FFF', 2);
                    }
                    break;
                }
            }
            if (proj.dead) return;

            if (proj.color === '#FF0000' && rectIntersect(proj.x, proj.y, proj.width, proj.height, p.x, p.y, p.width, p.height)) {
                takeDamage(1); proj.dead = true;
                spawnDamageNumber(p.x, p.y, 1);
            }

            if (proj.color !== '#FF0000') {
                for (const e of level.current.enemies) {
                    if (e.dead) continue;
                    if (rectIntersect(proj.x, proj.y, proj.width, proj.height, e.x, e.y, e.width, e.height)) {
                        proj.dead = true; e.hp--;
                        
                        spawnDamageNumber(e.x + e.width/2, e.y, 1);

                        if (proj.projectileType === 'TNT') {
                             explode(proj.x + proj.width/2, proj.y + proj.height/2);
                        } else {
                             spawnParticles(e.x + e.width/2, e.y + e.height/2, '#ff0000', 3);
                        }

                        if (e.hp <= 0) {
                            e.dead = true; onAddScore(e.type === 'ENEMY_BOSS' ? 2000 : 100); audioController.playSFX('EXPLODE');
                        } else {
                            e.vx = proj.vx > 0 ? 3 : -3; e.vy = -2;
                            (e as any).flash = 5; // Flash effect
                        }
                        break;
                    }
                }
            }
            if (proj.lifeTime) { proj.lifeTime--; if(proj.lifeTime <=0) proj.dead=true; }
            if (proj.x < camera.current.x - 100 || proj.x > camera.current.x + CANVAS_WIDTH + 100 || proj.y > CANVAS_HEIGHT) proj.dead = true;
        });
        level.current.projectiles = level.current.projectiles.filter(b => !b.dead);
    }

    // Enemies
    level.current.enemies.forEach(e => {
      if (e.dead) return;
      if (e.x < camera.current.x - 200 || e.x > camera.current.x + CANVAS_WIDTH + 200) return;

      const config = MOBS[e.type] || MOBS['ENEMY_ZOMBIE'];
      const distToPlayer = p.x - e.x;
      const absDist = Math.abs(distToPlayer);

      // Behavior
      if (config.behavior === 'FLY') {
          if (absDist < 600) {
              const dy = (p.y - e.y);
              // Swoop down if player is below
              const dive = dy > 0 && absDist < 200 ? 2.0 : 1.0; 
              
              e.x += (distToPlayer > 0 ? 0.05 : -0.05) * 30;
              e.y += (dy > 0 ? 0.03 * dive : -0.03) * 30;
          }
      } else if (config.behavior === 'BOSS') {
           if (absDist < 800) {
                setBossActive(true);
                const idealY = 150 + Math.sin(Date.now() / 1000) * 80;
                e.y += (idealY - e.y) * 0.05;
                const idealX = p.x + Math.sin(Date.now() / 1500) * 200;
                e.x += (idealX - e.x) * 0.03;
           }
      } else if (config.behavior === 'JUMP') {
          e.vy += GRAVITY;
          if (e.vy === 0 && Math.random() < 0.05) { e.vy = -8; e.vx = (distToPlayer > 0 ? 1 : -1) * 3; }
          if (e.vy === 0) e.vx = 0; 
          e.x += e.vx; e.y += e.vy;
          checkCollision(e, 'x'); checkCollision(e, 'y');
      } else if (config.behavior === 'TELEPORT') {
           e.vy += GRAVITY; e.y += e.vy; checkCollision(e, 'y');
           if (absDist < 200 && Math.random() < 0.02) {
               e.x = p.x + (Math.random() > 0.5 ? 100 : -100);
               spawnParticles(e.x, e.y, '#CC00FA', 10);
           }
      } else { // WALK
          e.vy += GRAVITY;
          let speed = config.vx;
          
          // Ravager Charge
          if (e.type === 'ENEMY_RAVAGER' && absDist < 300 && Math.abs(p.y - e.y) < 50) speed *= 2.5;
          // Vindicator Sprint
          if (e.type === 'ENEMY_VINDICATOR' && absDist < 400) speed *= 1.5;

          if (absDist < 500) e.vx = (distToPlayer > 0 ? 1 : -1) * speed; else e.vx = 0;
          e.x += e.vx; e.y += e.vy;
          checkCollision(e, 'x'); checkCollision(e, 'y');
      }

      // Shooting
      if (config.projectile && absDist < 400 && !e.dead) {
          if (e.attackCooldown) e.attackCooldown--;
          if ((e.attackCooldown || 0) <= 0) {
               fireProjectile(e, undefined, config.projectile);
               e.attackCooldown = 150;
          }
      }

      // Player Collision
      if (!p.isDead && Math.abs(e.x - p.x) < 40 && Math.abs(e.y - p.y) < 40) {
          if (rectIntersect(p.x + 4, p.y, p.width - 8, p.height, e.x, e.y, e.width, e.height)) {
            takeDamage(1); 
            spawnDamageNumber(p.x, p.y, 1);
            p.vx = (p.x - e.x) > 0 ? 8 : -8; p.vy = -5;
          }
      }
    });

    particles.current.forEach(part => { part.x += part.vx; part.y += part.vy; part.lifeTime = (part.lifeTime || 0) - 1; });
    particles.current = particles.current.filter(p => (p.lifeTime || 0) > 0);

    damageNumbers.current.forEach(d => { d.y += d.vy; d.lifeTime--; });
    damageNumbers.current = damageNumbers.current.filter(d => d.lifeTime > 0);
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // BG
    ctx.fillStyle = biomeRef.current === 'NETHER' ? '#3B0000' : biomeRef.current === 'THE_END' ? '#14001A' : '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(-Math.floor(camera.current.x), 0);

    if (staticLevelCanvas.current) ctx.drawImage(staticLevelCanvas.current, Math.max(0, camera.current.x), 0, CANVAS_WIDTH, CANVAS_HEIGHT, Math.max(0, camera.current.x), 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Portals
    level.current.blocks.forEach(b => {
        if (b.type === 'PORTAL') {
             const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
             const pw = TILE_SIZE*3, ph = TILE_SIZE*4;
             ctx.fillStyle = !boss ? '#110011' : '#1a1a1a';
             ctx.fillRect(b.x+4, b.y-ph+4, pw-8, ph-4);
             if(!boss && Math.random()>0.5) { ctx.fillStyle = '#d946ef'; ctx.fillRect(b.x+10+Math.random()*pw, b.y-ph+10+Math.random()*ph, 4, 4); }
             ctx.fillStyle = '#DFE0A8';
             ctx.fillRect(b.x, b.y-ph, 8, ph); ctx.fillRect(b.x+pw-8, b.y-ph, 8, ph); ctx.fillRect(b.x, b.y-ph, pw, 8);
        }
    });

    // Projectiles
    level.current.projectiles.forEach(p => {
        ctx.save(); ctx.translate(p.x + p.width/2, p.y + p.height/2);
        
        if (p.projectileType === 'ARROW') {
            ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = '#5c4033'; ctx.fillRect(-6, -1, 12, 2); ctx.fillStyle = '#EEE'; ctx.fillRect(4, -1, 2, 2);
        } else if (p.projectileType === 'TNT') {
            // TNT Block
            ctx.fillStyle = '#db2b2b'; ctx.fillRect(-6, -6, 12, 12); 
            ctx.fillStyle = '#FFF'; ctx.fillRect(-6, -2, 12, 4); 
            ctx.fillStyle = '#000'; ctx.font='8px monospace'; ctx.fillText('TNT', -5, 2);
        } else if (p.projectileType === 'FIREBALL') {
            // Fireball
            ctx.rotate(Date.now()/100); 
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(0,0, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(-2,-2, 3, 0, Math.PI*2); ctx.fill();
        } else if (p.projectileType === 'PEARL') {
            // Ender Pearl
            ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#2dd4bf'; ctx.beginPath(); ctx.arc(-1,-1, 2, 0, Math.PI*2); ctx.fill();
        } else if (p.projectileType === 'POTION') {
            // Potion Bottle
            ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI/2); 
            ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.arc(0, 2, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(-1, -4, 2, 3);
        } else if (p.projectileType === 'SKULL') {
            // Wither Skull
            ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.fillRect(-2, -1, 1, 1); ctx.fillRect(1, -1, 1, 1); ctx.fillRect(-1, 2, 2, 1);
        } else if (p.projectileType === 'BONE') {
            // Bone
            ctx.rotate(Date.now()/150);
            ctx.fillStyle = '#e5e7eb'; ctx.fillRect(-4, -1, 8, 2); ctx.fillRect(-5, -2, 2, 4); ctx.fillRect(3, -2, 2, 4);
        } else if (p.projectileType === 'TRIDENT') {
            ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = '#06b6d4'; ctx.fillRect(-8, -1, 16, 2); ctx.fillRect(4, -4, 1, 8); ctx.fillRect(6, -4, 1, 8);
        } else if (p.projectileType === 'SONIC_BOOM') {
            ctx.fillStyle = '#0ea5e9'; ctx.beginPath(); ctx.arc(0,0, p.width/2 + Math.sin(Date.now()/50)*2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#bae6fd'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0, p.width/2, 0, Math.PI*2); ctx.stroke();
        } else if (p.projectileType === 'EGG') {
             ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI*2); ctx.fill();
        } else if (p.projectileType === 'EXPERIENCE') {
             ctx.fillStyle = '#a3e635'; ctx.beginPath(); ctx.arc(0,0, 3 + Math.sin(Date.now()/100), 0, Math.PI*2); ctx.fill();
        } else {
            // Default
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    });

    // Enemies
    level.current.enemies.forEach(e => {
        if (e.dead || e.x < camera.current.x - 100 || e.x > camera.current.x + CANVAS_WIDTH + 100) return;
        const conf = MOBS[e.type];
        if (!conf) return;

        ctx.save();
        ctx.translate(e.x, e.y);
        
        // Damage Flash
        if ((e as any).flash > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            (e as any).flash--;
        }

        // Draw HP Bar
        if (e.hp < e.maxHp) {
            ctx.fillStyle = 'red'; ctx.fillRect(0, -8, e.width, 4);
            ctx.fillStyle = 'green'; ctx.fillRect(0, -8, e.width * (e.hp/e.maxHp), 4);
        }

        if (conf.behavior === 'BOSS') {
            // Ender Dragon Art (Same as before)
            const t = Date.now() / 200;
            const wingY = Math.sin(t) * 10;
            
            ctx.fillStyle = '#000'; // Black Body

            // Wings
            ctx.beginPath();
            ctx.moveTo(30, 10); ctx.lineTo(-20, -20 + wingY); ctx.lineTo(10, 10); // Left Wing
            ctx.moveTo(70, 10); ctx.lineTo(120, -20 + wingY); ctx.lineTo(90, 10); // Right Wing
            ctx.fill();
            
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke(); 

            // Body
            ctx.fillRect(20, 10, 60, 30);
            
            // Tail
            ctx.beginPath(); ctx.moveTo(20, 25); ctx.lineTo(-10, 25 + Math.sin(t*1.2)*5); ctx.lineTo(20, 35); ctx.fill();

            // Head
            ctx.fillRect(75, 5, 35, 30); 
            ctx.fillStyle = '#CC00FA'; ctx.fillRect(95, 15, 8, 4); 
            ctx.fillStyle = '#000'; ctx.fillRect(110, 25, 10, 10); 
            
            if (Math.random() < 0.3) {
                 ctx.fillStyle = '#CC00FA'; ctx.fillRect(110, 30, 4, 4);
            }
        } else {
            // Generic Mob Drawing based on config color
            ctx.fillStyle = conf.color;
            ctx.fillRect(0, 0, e.width, e.height);
            // Simple eyes
            ctx.fillStyle = (e.type === 'ENEMY_ENDERMAN' || e.type === 'ENEMY_PHANTOM') ? '#CC00FA' : '#000';
            ctx.fillRect(4, 4, 4, 4); ctx.fillRect(e.width-8, 4, 4, 4);
            
            // Special features
            if (e.type === 'ENEMY_RAVAGER') {
                ctx.fillStyle = '#333'; ctx.fillRect(-2, 10, 4, 4); // Horns?
            }
            if (e.type === 'ENEMY_VINDICATOR') {
                 ctx.fillStyle = '#EEE'; ctx.fillRect(e.width-4, 15, 2, 8); // Axe hint
            }
        }
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    });

    particles.current.forEach(p => { ctx.fillStyle = p.color || '#fff'; ctx.fillRect(p.x, p.y, p.width, p.height); });
    
    // Damage Numbers
    ctx.font = 'bold 20px VT323';
    ctx.textAlign = 'center';
    damageNumbers.current.forEach(d => {
        ctx.fillStyle = `rgba(255, 255, 255, ${d.lifeTime / 40})`;
        ctx.fillText(d.value.toString(), d.x, d.y);
    });

    // Player
    const p = player.current;
    // USE REF HERE
    const charData = CHARACTERS.find(c => c.id === characterRef.current) || CHARACTERS[0];
    ctx.save();
    
    // Dinnerbone Effect
    if (characterRef.current === CharacterType.DINNERBONE) {
        ctx.translate(p.x + p.width/2, p.y + p.height/2);
        ctx.rotate(Math.PI);
        ctx.translate(-p.x - p.width/2, -p.y - p.height/2);
    }
    
    if (!p.facingRight) { ctx.translate(p.x + p.width, p.y); ctx.scale(-1, 1); ctx.translate(-p.x - p.width, -p.y); }
    
    // Weapon
    ctx.save(); ctx.translate(p.x + p.width/2 + 5, p.y + p.height/2 + 5);
    if (charData.projectileType === 'TRIDENT') {
         ctx.fillStyle = '#06b6d4'; ctx.fillRect(0, -6, 2, 18); ctx.fillRect(-4, -6, 10, 2);
    } else if (charData.projectileType === 'SNOWBALL' || charData.projectileType === 'EGG') {
         ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(6, 4, 4, 0, Math.PI*2); ctx.fill();
    } else {
         ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 12, 6);
    }
    ctx.restore();

    // Body & Head (Reusing logic)
    ctx.fillStyle = charData.legs; 
    if (Math.abs(p.vx) > 0.1 && !isFlying.current) {
        const w = Math.sin(Date.now()/100)*4; ctx.fillRect(p.x+4+w, p.y+18, 6, 12); ctx.fillRect(p.x+14-w, p.y+18, 6, 12);
    } else {
        ctx.fillRect(p.x+4, p.y+18, 6, 12); ctx.fillRect(p.x+14, p.y+18, 6, 12);
    }
    ctx.fillStyle = charData.color; ctx.fillRect(p.x+4, p.y+8, 16, 12);
    
    if (charData.face) {
        const px = 2.5; const hx = p.x+2; const hy = p.y-4;
        charData.face.forEach((r, ri) => r.forEach((c, ci) => { ctx.fillStyle = c; ctx.fillRect(hx+ci*px, hy+ri*px, px, px); }));
    }
    
    ctx.restore();
    ctx.restore();

    // UI: HP & Boss Bar
    if (bossActive && level.current.enemies.some(e=>e.type==='ENEMY_BOSS')) {
        const boss = level.current.enemies.find(e=>e.type==='ENEMY_BOSS');
        if (boss) {
            const bx = (CANVAS_WIDTH-400)/2;
            ctx.fillStyle = '#222'; ctx.fillRect(bx, 40, 400, 20);
            ctx.fillStyle = '#d946ef'; ctx.fillRect(bx, 40, 400*(boss.hp/boss.maxHp), 20);
            ctx.fillStyle = '#FFF'; ctx.font = '20px VT323'; ctx.fillText("BOSS", bx, 35);
        }
    }

    for(let i=0; i<p.maxHealth; i++) {
        const r=Math.floor(i/10), c=i%10;
        ctx.fillStyle = i<p.health ? '#ef4444' : '#374151';
        ctx.fillRect(20+c*25, CANVAS_HEIGHT-40-r*25, 20, 20);
    }
  }

  function update() {
    if (player.current.isDead) return;
    const p = player.current;

    // Actions
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (keys.current['KeyJ'] && p.attackCooldown <= 0) { fireProjectile(p, characterRef.current); p.attackCooldown = ATTACK_COOLDOWN; }
    if (keys.current['KeyK'] && p.attackCooldown <= 0) performDig(p);

    // Movement
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) { p.vx -= 0.5; p.facingRight = false; }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) { p.vx += 0.5; p.facingRight = true; }

    // Physics
    if (isFlying.current) {
        p.vx *= FRICTION; 
        if (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) p.vy = -MOVE_SPEED; 
        else if (keys.current['ArrowDown'] || keys.current['KeyS']) p.vy = MOVE_SPEED; 
        else p.vy = 0; 
    } else {
        if ((keys.current['ArrowUp'] || keys.current['Space'] || keys.current['KeyW']) && p.isGrounded) { p.vy = JUMP_FORCE; p.isGrounded = false; audioController.playSFX('JUMP'); }
        p.vx = Math.max(Math.min(p.vx, MOVE_SPEED), -MOVE_SPEED);
        p.vx *= FRICTION;
        p.vy += GRAVITY;
    }

    p.x += p.vx;
    if (p.x < 0) { p.x = 0; p.vx = 0; }
    if (level.current.mapWidth && p.x > level.current.mapWidth - p.width) { p.x = level.current.mapWidth - p.width; p.vx = 0; }
    checkCollision(p, 'x');
    
    p.y += p.vy;
    if (p.y < -100) { p.y = -100; p.vy = 0; }
    checkCollision(p, 'y');

    updateEntities();

    // Camera
    const targetCamX = p.x - CANVAS_WIDTH / 3;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;
    if (camera.current.x < 0) camera.current.x = 0;
    if (level.current.mapWidth && camera.current.x > level.current.mapWidth - CANVAS_WIDTH) camera.current.x = level.current.mapWidth - CANVAS_WIDTH;

    if (p.y > CANVAS_HEIGHT + 100) die();

    draw();
    requestRef.current = requestAnimationFrame(update);
  }

  // --- CONTROLS (Hook) ---
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => { 
        keys.current[e.code] = true; 
        if (e.code === 'KeyF') { isFlying.current = !isFlying.current; setFlyingModeUI(isFlying.current); if(isFlying.current) player.current.vy = 0; }
    };
    const handleUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); };
  }, []);

  // --- LEVEL GENERATION & LOOP START (Effect) ---
  useEffect(() => {
    const parsedBlocks: Block[] = [];
    const parsedEnemies: Entity[] = [];
    let startX = 50;
    let startY = 100;
    let mapWidth = 0;
    let mapHeight = levelRaw.length * TILE_SIZE;

    levelRaw.forEach((row, y) => {
      mapWidth = Math.max(mapWidth, row.length * TILE_SIZE);
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const wx = x * TILE_SIZE;
        const wy = y * TILE_SIZE;

        if (['G','D','S','A','W','I','R','X','O','#','L','?','E'].includes(char)) {
             let type: any = 'DIRT';
             if (char === 'G') type = 'GRASS';
             else if (char === 'S') type = 'SAND';
             else if (char === 'A') type = 'SANDSTONE';
             else if (char === 'W') type = 'SNOW';
             else if (char === 'I') type = 'ICE';
             else if (char === 'R') type = 'NETHERRACK';
             else if (char === 'X') type = 'END_STONE';
             else if (char === 'O') type = 'OBSIDIAN';
             else if (char === '#') type = 'BEDROCK';
             else if (char === 'L') type = 'LAVA';
             else if (char === '?') type = 'STONE';
             else if (char === 'E') type = 'PORTAL';
             parsedBlocks.push({ x: wx, y: wy, type, solid: type !== 'LAVA' && type !== 'PORTAL' });
        } else if (['g', 's', 't', 'f', 'C', 'Z', 'M', '^', 'B'].includes(char)) {
             // Density multiplier
             let spawnCount = 1;
             if (char !== 'B') { 
                 if (densityRef.current === 'MEDIUM' && Math.random() < 0.5) spawnCount = 2;
                 if (densityRef.current === 'HIGH') spawnCount = Math.random() < 0.3 ? 3 : 2;
             }
             
             for(let i=0; i<spawnCount; i++) {
                 const enemy = getEnemyByMarker(char, biomeRef.current);
                 if (enemy) {
                     enemy.x = wx + (i * 10);
                     enemy.y = wy;
                     parsedEnemies.push(enemy);
                 }
             }
        }
      }
    });

    level.current = { blocks: parsedBlocks, enemies: parsedEnemies, items: [], projectiles: [], spawnX: startX, spawnY: startY, biome: biomeRef.current, mapWidth };
    player.current = { 
        x: startX, y: startY, vx: 0, vy: 0, width: 24, height: 30, 
        isGrounded: false, isDead: false, facingRight: true,
        health: getMaxHealth(), maxHealth: getMaxHealth(),
        attackCooldown: 0, isAttacking: false
    };
    particles.current = [];
    damageNumbers.current = [];
    camera.current.x = 0;
    setBossActive(false);
    renderStaticLevel(mapWidth, mapHeight);
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [levelRaw, difficulty, biome]); // Keep dependencies to restart level if map changes

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block mx-auto border-4 border-gray-700 bg-black shadow-2xl rounded-sm" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }} />;
};

export default GameCanvas;
