import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Block, Entity, LevelData, PlayerState, CharacterType, Difficulty, BiomeType } from '../types';
import { TILE_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, CANVAS_WIDTH, CANVAS_HEIGHT, CHARACTERS, PLAYER_MAX_HP, ATTACK_COOLDOWN, ATTACK_RANGE, BOSS_HP, PROJECTILE_SPEED } from '../constants';
import { audioController } from '../utils/audio';

interface GameCanvasProps {
  levelRaw: string[];
  character: CharacterType;
  difficulty: Difficulty;
  biome: BiomeType;
  onGameOver: () => void;
  onWin: (score: number) => void;
  onAddScore: (amount: number) => void;
  score: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ levelRaw, character, difficulty, biome, onGameOver, onWin, onAddScore, score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const staticLevelCanvas = useRef<HTMLCanvasElement | null>(null);
  const isFlying = useRef<boolean>(false);
  
  const getMaxHealth = () => {
      switch(difficulty) {
          case 'EASY': return 20; 
          case 'HARD': return 5;  
          default: return 10;
      }
  };
  
  const player = useRef<PlayerState>({
    x: 50, y: 100, vx: 0, vy: 0, width: 24, height: 30, 
    isGrounded: false, isDead: false, facingRight: true,
    health: getMaxHealth(), maxHealth: getMaxHealth(),
    attackCooldown: 0, isAttacking: false
  });
  
  const level = useRef<LevelData>({ blocks: [], enemies: [], items: [], projectiles: [], spawnX: 50, spawnY: 100, biome: 'PLAINS' });
  const camera = useRef({ x: 0 });
  const particles = useRef<Entity[]>([]);
  const [bossActive, setBossActive] = useState(false);
  const [flyingModeUI, setFlyingModeUI] = useState(false);

  // Initialize
  useEffect(() => {
    const parsedBlocks: Block[] = [];
    const parsedEnemies: Entity[] = [];
    const parsedItems: Entity[] = [];
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

        if (char === 'G') parsedBlocks.push({ x: wx, y: wy, type: 'GRASS', solid: true });
        else if (char === 'D') parsedBlocks.push({ x: wx, y: wy, type: 'DIRT', solid: true });
        else if (char === 'S') parsedBlocks.push({ x: wx, y: wy, type: 'SAND', solid: true }); // Sand
        else if (char === 'A') parsedBlocks.push({ x: wx, y: wy, type: 'SANDSTONE', solid: true }); // Sandstone
        else if (char === 'W') parsedBlocks.push({ x: wx, y: wy, type: 'SNOW', solid: true }); // Snow
        else if (char === 'I') parsedBlocks.push({ x: wx, y: wy, type: 'ICE', solid: true }); // Ice
        else if (char === 'R') parsedBlocks.push({ x: wx, y: wy, type: 'NETHERRACK', solid: true }); // Netherrack
        else if (char === 'X') parsedBlocks.push({ x: wx, y: wy, type: 'END_STONE', solid: true }); // End Stone
        else if (char === 'O') parsedBlocks.push({ x: wx, y: wy, type: 'OBSIDIAN', solid: true }); // Obsidian
        else if (char === '#') parsedBlocks.push({ x: wx, y: wy, type: 'BEDROCK', solid: true });
        else if (char === 'L') parsedBlocks.push({ x: wx, y: wy, type: 'LAVA', solid: false });
        else if (char === '?') parsedBlocks.push({ x: wx, y: wy, type: 'STONE', solid: true });
        else if (char === 'E') parsedBlocks.push({ x: wx, y: wy, type: 'PORTAL', solid: false });
        else if (char === 'C') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_CREEPER', x: wx, y: wy, width: 24, height: 24, vx: -0.5, vy: 0, hp: 3, maxHp: 3 });
        }
        else if (char === 'Z') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_ZOMBIE', x: wx, y: wy, width: 24, height: 30, vx: -0.8, vy: 0, hp: 5, maxHp: 5 });
        }
        else if (char === 'M') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_ENDERMAN', x: wx, y: wy, width: 24, height: 60, vx: 0, vy: 0, hp: 10, maxHp: 10 });
        }
        else if (char === '^') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_GHAST', x: wx, y: wy, width: 48, height: 48, vx: 0, vy: 0, hp: 8, maxHp: 8 });
        }
        else if (char === 'B') {
             parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_BOSS', x: wx, y: wy, width: 100, height: 60, vx: 0, vy: 0, hp: BOSS_HP, maxHp: BOSS_HP });
        }
      }
    });

    level.current = { blocks: parsedBlocks, enemies: parsedEnemies, items: parsedItems, projectiles: [], spawnX: startX, spawnY: startY, biome };
    player.current = { 
        x: startX, y: startY, vx: 0, vy: 0, width: 24, height: 30, 
        isGrounded: false, isDead: false, facingRight: true,
        health: getMaxHealth(), maxHealth: getMaxHealth(),
        attackCooldown: 0, isAttacking: false
    };
    particles.current = [];
    camera.current.x = 0;
    setBossActive(false);
    isFlying.current = false;
    setFlyingModeUI(false);

    renderStaticLevel(mapWidth, mapHeight);

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [levelRaw, difficulty, biome]);

  const renderStaticLevel = (w: number, h: number) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = w + 100;
      offscreen.height = h + 100;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
          offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
          level.current.blocks.forEach(b => {
             switch(b.type) {
                 case 'GRASS': drawBlock(offCtx, b.x, b.y, '#5c4033', '#4ade80'); break;
                 case 'DIRT': drawBlock(offCtx, b.x, b.y, '#5c4033'); break;
                 case 'STONE': drawBlock(offCtx, b.x, b.y, '#78716c'); break;
                 case 'SAND': drawBlock(offCtx, b.x, b.y, '#F6D7B0'); break;
                 case 'SANDSTONE': drawBlock(offCtx, b.x, b.y, '#E6C288', '#D8B375'); break;
                 case 'SNOW': drawBlock(offCtx, b.x, b.y, '#FFFFFF', '#E0F7FA'); break;
                 case 'ICE': drawBlock(offCtx, b.x, b.y, '#A5F2F3', undefined, true); break;
                 case 'NETHERRACK': drawBlock(offCtx, b.x, b.y, '#6F3637', '#502020'); break;
                 case 'END_STONE': drawBlock(offCtx, b.x, b.y, '#DFE0A8', '#F0F1B8'); break;
                 case 'OBSIDIAN': drawBlock(offCtx, b.x, b.y, '#141019', '#2E203C'); break;
                 case 'BEDROCK': drawBlock(offCtx, b.x, b.y, '#292524'); break;
                 case 'LAVA': 
                     offCtx.fillStyle = '#cf222e';
                     offCtx.fillRect(b.x, b.y + 4, TILE_SIZE, TILE_SIZE - 4);
                     break;
                 case 'PORTAL':
                     offCtx.fillStyle = '#000';
                     offCtx.fillRect(b.x, b.y, TILE_SIZE, TILE_SIZE * 3); 
                     break;
             }
        });
      }
      staticLevelCanvas.current = offscreen;
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => { 
        keys.current[e.code] = true; 
        if (e.code === 'KeyF') {
            isFlying.current = !isFlying.current;
            setFlyingModeUI(isFlying.current);
            if (isFlying.current) {
                player.current.vy = 0; 
                audioController.playSFX('COIN'); 
            }
        }
    };
    const handleUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  const update = () => {
    if (player.current.isDead) return;
    const p = player.current;
    
    // Combat
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (keys.current['KeyJ'] && p.attackCooldown <= 0) {
        fireProjectile(p);
        p.attackCooldown = ATTACK_COOLDOWN; 
    }
    if (keys.current['KeyK'] && p.attackCooldown <= 0) {
        performDig(p);
    }

    // Movement
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
      p.vx -= 0.5;
      p.facingRight = false;
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) {
      p.vx += 0.5;
      p.facingRight = true;
    }

    if (isFlying.current) {
        p.vx *= FRICTION; 
        if (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) {
            p.vy = -MOVE_SPEED; 
        } else if (keys.current['ArrowDown'] || keys.current['KeyS']) {
            p.vy = MOVE_SPEED; 
        } else {
            p.vy = 0; 
        }
    } else {
        if ((keys.current['ArrowUp'] || keys.current['Space'] || keys.current['KeyW']) && p.isGrounded) {
            p.vy = JUMP_FORCE;
            p.isGrounded = false;
            audioController.playSFX('JUMP');
        }
        p.vx = Math.max(Math.min(p.vx, MOVE_SPEED), -MOVE_SPEED);
        p.vx *= FRICTION;
        p.vy += GRAVITY;
    }

    p.x += p.vx;
    checkCollision(p, 'x');
    p.y += p.vy;
    checkCollision(p, 'y');

    updateEntities();

    const targetCamX = p.x - CANVAS_WIDTH / 3;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;
    if (camera.current.x < 0) camera.current.x = 0;

    // Death check (Void)
    if (p.y > CANVAS_HEIGHT + 100) {
      die();
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const fireProjectile = (p: PlayerState) => {
      p.isAttacking = true;
      audioController.playSFX('JUMP'); 
      const bullet: Entity = {
          id: `bullet_${Date.now()}_${Math.random()}`,
          type: 'PROJECTILE',
          x: p.facingRight ? p.x + p.width : p.x,
          y: p.y + p.height / 2,
          width: 8,
          height: 8,
          vx: p.facingRight ? PROJECTILE_SPEED : -PROJECTILE_SPEED,
          vy: 0,
          hp: 1,
          maxHp: 1
      };
      if (!level.current.projectiles) level.current.projectiles = [];
      level.current.projectiles.push(bullet);
      setTimeout(() => { p.isAttacking = false; }, 100);
  };

  const performDig = (p: PlayerState) => {
      p.isAttacking = true;
      p.attackCooldown = 15;
      
      const gridX = Math.floor((p.x + (p.facingRight ? p.width + 10 : -10)) / TILE_SIZE);
      const gridY = Math.floor((p.y + p.height/2) / TILE_SIZE);
      
      const blockIndex = level.current.blocks.findIndex(b => 
          Math.floor(b.x / TILE_SIZE) === gridX && Math.floor(b.y / TILE_SIZE) === gridY
      );

      if (blockIndex !== -1) {
          const block = level.current.blocks[blockIndex];
          if (block.type !== 'BEDROCK' && block.type !== 'PORTAL') {
              level.current.blocks.splice(blockIndex, 1);
              spawnParticles(block.x + TILE_SIZE/2, block.y + TILE_SIZE/2, '#888', 8);
              audioController.playSFX('COIN');
              const ctx = staticLevelCanvas.current?.getContext('2d');
              if (ctx) {
                  ctx.clearRect(block.x, block.y, TILE_SIZE, TILE_SIZE);
              }
          }
      }
      setTimeout(() => { p.isAttacking = false; }, 200);
  };

  const checkCollision = (p: PlayerState | Entity, axis: 'x' | 'y') => {
    const isPlayer = (p as any).isGrounded !== undefined;
    if (p.x < 0) p.x = 0;
    const checkRadius = 150;
    let collided = false;

    for (const block of level.current.blocks) {
      if (Math.abs(block.x - p.x) > checkRadius || Math.abs(block.y - p.y) > checkRadius) continue;
      
      if (isPlayer) {
          if (block.type === 'LAVA' && rectIntersect(p.x+4, p.y, p.width-8, p.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
             if (!isFlying.current) die(); 
             return;
          }
          if (block.type === 'PORTAL' && rectIntersect(p.x, p.y, p.width, p.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
              const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
              if (boss) return; 
              audioController.playSFX('WIN');
              onWin(score);
              (p as PlayerState).isDead = true; 
              return;
          }
      }

      if (!block.solid) continue;

      if (rectIntersect(p.x, p.y, p.width, p.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
          collided = true;
          if (axis === 'x') {
            if (p.vx > 0) p.x = block.x - p.width;
            else if (p.vx < 0) p.x = block.x + TILE_SIZE;
            p.vx = 0;
          } else {
            if (p.vy > 0) {
              p.y = block.y - p.height;
              if(isPlayer) (p as PlayerState).isGrounded = true;
              p.vy = 0;
            } else if (p.vy < 0) {
              p.y = block.y + TILE_SIZE;
              p.vy = 0;
            }
          }
      }
    }
    return collided;
  };

  const updateEntities = () => {
    const p = player.current;
    const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
    
    if (boss && Math.abs(p.x - boss.x) < 800) {
        if (!bossActive) setBossActive(true);
    } else {
        if (bossActive) setBossActive(false);
    }

    if (level.current.projectiles) {
        level.current.projectiles.forEach(proj => {
            if (proj.dead) return;
            let nearestDist = Infinity;
            let target: Entity | null = null;
            level.current.enemies.forEach(e => {
                if (e.dead) return;
                const dx = e.x - proj.x;
                const dy = e.y - proj.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < ATTACK_RANGE && dist < nearestDist) {
                    nearestDist = dist;
                    target = e;
                }
            });

            if (target) {
                const t = target as Entity;
                const dx = (t.x + t.width/2) - proj.x;
                const dy = (t.y + t.height/2) - proj.y;
                const angle = Math.atan2(dy, dx);
                proj.vx = Math.cos(angle) * PROJECTILE_SPEED;
                proj.vy = Math.sin(angle) * PROJECTILE_SPEED;
            }
            proj.x += proj.vx;
            proj.y += proj.vy;

            for (const e of level.current.enemies) {
                if (e.dead) continue;
                if (rectIntersect(proj.x, proj.y, proj.width, proj.height, e.x, e.y, e.width, e.height)) {
                    proj.dead = true;
                    e.hp--;
                    spawnParticles(e.x + e.width/2, e.y + e.height/2, '#ff0000', 3);
                    if (e.hp <= 0) {
                        e.dead = true;
                        onAddScore(e.type === 'ENEMY_BOSS' ? 2000 : 100);
                        audioController.playSFX('EXPLODE');
                    } else {
                        e.vx = proj.vx > 0 ? 3 : -3;
                        e.vy = -2;
                    }
                    break;
                }
            }
            if (proj.x < camera.current.x - 100 || proj.x > camera.current.x + CANVAS_WIDTH + 100 || proj.y > CANVAS_HEIGHT) {
                proj.dead = true;
            }
        });
        level.current.projectiles = level.current.projectiles.filter(b => !b.dead);
    }

    level.current.enemies.forEach(e => {
      if (e.dead) return;
      const distToPlayer = p.x - e.x;
      const absDist = Math.abs(distToPlayer);
      
      if (e.type === 'ENEMY_GHAST') {
          if (absDist < 400) {
              e.x += (distToPlayer > 0 ? 0.05 : -0.05) * 30;
              e.y += (p.y - e.y > 0 ? 0.02 : -0.02) * 30;
          }
      } else if (e.type === 'ENEMY_BOSS') {
           if (absDist < 800) {
                const idealY = 150 + Math.sin(Date.now() / 1000) * 80;
                const dy = idealY - e.y;
                e.y += dy * 0.05;
                const idealX = p.x + Math.sin(Date.now() / 1500) * 200;
                const dx = idealX - e.x;
                e.x += dx * 0.03;
           }
      } else {
          e.vy += GRAVITY;
          if (e.type === 'ENEMY_ZOMBIE') {
              if (absDist < 300) e.vx = (distToPlayer > 0 ? 1 : -1) * 1.0;
              else e.vx = 0;
          } else if (e.type === 'ENEMY_ENDERMAN') {
               if (absDist < 200) {
                   e.vx = (distToPlayer > 0 ? 1 : -1) * 2.0; 
                   if (Math.random() < 0.01) e.vy = -5;
               } else e.vx = 0;
          } else {
              if (Math.random() < 0.02) e.vx = Math.random() > 0.5 ? 1 : -1;
          }
          e.vx *= FRICTION;
          e.x += e.vx;
          checkCollision(e, 'x');
          e.y += e.vy;
          checkCollision(e, 'y');
      }

      if (!p.isDead && Math.abs(e.x - p.x) < 60 && Math.abs(e.y - p.y) < 60) {
          if (rectIntersect(p.x + 4, p.y, p.width - 8, p.height, e.x, e.y, e.width, e.height)) {
            takeDamage(1);
            p.vx = (p.x - e.x) > 0 ? 10 : -10; 
            p.vy = -5;
          }
      }
    });

    particles.current.forEach(part => {
        part.x += part.vx;
        part.y += part.vy;
        part.lifeTime = (part.lifeTime || 0) - 1;
    });
    particles.current = particles.current.filter(p => (p.lifeTime || 0) > 0);
  };

  const takeDamage = (amount: number) => {
      if (isFlying.current) return;
      player.current.health -= amount;
      audioController.playSFX('EXPLODE');
      if (player.current.health <= 0) die();
  };

  const die = () => {
    if (player.current.isDead) return;
    if (isFlying.current && player.current.y < CANVAS_HEIGHT) return; 
    player.current.isDead = true;
    audioController.playSFX('EXPLODE');
    setTimeout(onGameOver, 1000);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
      for(let i=0; i<count; i++) {
          particles.current.push({
              id: Math.random().toString(),
              type: 'PARTICLE',
              x, y, width: 4, height: 4,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              lifeTime: 30,
              color, hp: 0, maxHp: 0
          });
      }
  };

  const rectIntersect = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Background color based on Biome
    switch(level.current.biome) {
        case 'PLAINS': ctx.fillStyle = '#87CEEB'; break;
        case 'DESERT': ctx.fillStyle = '#F0E68C'; break;
        case 'SNOW': ctx.fillStyle = '#E0F7FA'; break;
        case 'NETHER': ctx.fillStyle = '#3B0000'; break; // Dark Red
        case 'THE_END': ctx.fillStyle = '#14001A'; break; // Dark Void
        default: ctx.fillStyle = '#87CEEB';
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.current.x), 0);

    if (staticLevelCanvas.current) {
        const sx = Math.max(0, camera.current.x);
        const sy = 0;
        const sw = CANVAS_WIDTH;
        const sh = CANVAS_HEIGHT;
        ctx.drawImage(staticLevelCanvas.current, sx, sy, sw, sh, sx, sy, sw, sh);
    }

    // Draw Portals
    level.current.blocks.forEach(b => {
        if (b.type === 'PORTAL') {
             const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
             if (!boss) {
                 if (Math.random() > 0.5) {
                     ctx.fillStyle = '#d946ef';
                     ctx.fillRect(b.x + Math.random()*TILE_SIZE, b.y + Math.random()*TILE_SIZE*3, 4, 4);
                 }
                 ctx.fillStyle = 'rgba(217, 70, 239, 0.5)'; 
             } else {
                 ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
             }
             ctx.fillRect(b.x + 4, b.y + 4, TILE_SIZE - 8, TILE_SIZE * 3 - 8);
        }
    });

    // Projectiles
    if (level.current.projectiles) {
        ctx.fillStyle = '#FFFF00'; 
        level.current.projectiles.forEach(proj => {
            ctx.beginPath();
            ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Enemies
    level.current.enemies.forEach(e => {
      if (e.dead) return;
      if (e.x < camera.current.x - 100 || e.x > camera.current.x + CANVAS_WIDTH + 100) return;

      if (e.type === 'ENEMY_GHAST') {
          ctx.fillStyle = '#F0F0F0';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#000';
          ctx.fillRect(e.x + 10, e.y + 15, 8, 2); 
          ctx.fillRect(e.x + 30, e.y + 15, 8, 2);
          ctx.fillRect(e.x + 20, e.y + 30, 8, 8);
      } else if (e.type === 'ENEMY_ZOMBIE') {
          ctx.fillStyle = '#3b82f6'; 
          ctx.fillRect(e.x + 4, e.y + 18, 16, 12);
          ctx.fillStyle = '#00AAAA'; 
          ctx.fillRect(e.x + 4, e.y + 8, 16, 10);
          ctx.fillStyle = '#3D6836';
          ctx.fillRect(e.x, e.y - 4, 24, 12);
          ctx.fillStyle = '#00AAAA';
          ctx.fillRect(e.x - 4, e.y + 8, 28, 6);
      } else if (e.type === 'ENEMY_ENDERMAN') {
          ctx.fillStyle = '#111';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#cc00fa'; 
          ctx.fillRect(e.x + 2, e.y + 10, 6, 2);
          ctx.fillRect(e.x + 16, e.y + 10, 6, 2);
      } else if (e.type === 'ENEMY_BOSS') {
          const facingLeft = player.current.x < e.x;
          ctx.fillStyle = '#111'; 
          ctx.fillStyle = '#222';
          const wingFlap = Math.sin(Date.now() / 150) * 20;
          ctx.beginPath();
          ctx.moveTo(e.x + 50, e.y + 30);
          ctx.lineTo(e.x + 10, e.y - 10 + wingFlap);
          ctx.lineTo(e.x + 90, e.y - 10 + wingFlap);
          ctx.fill();
          ctx.fillStyle = '#000'; 
          ctx.fillRect(e.x + 20, e.y + 20, 60, 20);
          ctx.fillStyle = '#111';
          if (facingLeft) {
              ctx.fillRect(e.x, e.y + 10, 30, 20);
              ctx.fillStyle = '#bd00ff'; 
              ctx.fillRect(e.x + 5, e.y + 15, 8, 4);
              ctx.fillStyle = '#111';
              ctx.fillRect(e.x + 80, e.y + 25, 20, 10);
          } else {
              ctx.fillRect(e.x + 70, e.y + 10, 30, 20);
              ctx.fillStyle = '#bd00ff'; 
              ctx.fillRect(e.x + 85, e.y + 15, 8, 4);
              ctx.fillStyle = '#111';
              ctx.fillRect(e.x, e.y + 25, 20, 10);
          }
      } else {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#000';
          ctx.fillRect(e.x + 4, e.y + 4, 4, 4);
          ctx.fillRect(e.x + 16, e.y + 4, 4, 4);
          ctx.fillRect(e.x + 8, e.y + 10, 8, 8);
      }
    });

    particles.current.forEach(p => {
        ctx.fillStyle = p.color || '#fff';
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Player
    const p = player.current;
    const charData = CHARACTERS.find(c => c.id === character) || CHARACTERS[0];
    ctx.save();
    if (!p.facingRight) {
        ctx.translate(p.x + p.width, p.y);
        ctx.scale(-1, 1);
        ctx.translate(-p.x - p.width, -p.y);
    }
    
    // Weapon
    ctx.save();
    ctx.translate(p.x + p.width/2 + 5, p.y + p.height/2 + 5);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 12, 6);
    ctx.fillStyle = '#555';
    ctx.fillRect(-4, 2, 6, 6); 
    if (p.isAttacking) {
         ctx.fillStyle = '#FFA500';
         ctx.beginPath();
         ctx.arc(14, 3, Math.random() * 6 + 2, 0, Math.PI*2);
         ctx.fill();
    }
    ctx.restore();

    // Body
    ctx.fillStyle = charData.legs;
    if (Math.abs(p.vx) > 0.1 && !isFlying.current) {
       const walkOffset = Math.sin(Date.now() / 100) * 4;
       ctx.fillRect(p.x + 4 + walkOffset, p.y + 18, 6, 12);
       ctx.fillRect(p.x + 14 - walkOffset, p.y + 18, 6, 12);
    } else {
       if (isFlying.current) {
           ctx.fillRect(p.x + 4, p.y + 20, 6, 8); 
           ctx.fillRect(p.x + 14, p.y + 20, 6, 8);
           ctx.fillStyle = '#FFA500';
           ctx.fillRect(p.x + 6, p.y + 28, 4, Math.random()*6);
           ctx.fillRect(p.x + 16, p.y + 28, 4, Math.random()*6);
       } else {
           ctx.fillRect(p.x + 4, p.y + 18, 6, 12);
           ctx.fillRect(p.x + 14, p.y + 18, 6, 12);
       }
    }
    ctx.fillStyle = charData.color;
    ctx.fillRect(p.x + 4, p.y + 8, 16, 12);
    
    // Head
    if (charData.face) {
        const pixelSize = 2.5;
        const headX = p.x + 2;
        const headY = p.y - 4;
        charData.face.forEach((row, rowIndex) => {
            row.forEach((colColor, colIndex) => {
                ctx.fillStyle = colColor;
                ctx.fillRect(headX + colIndex * pixelSize, headY + rowIndex * pixelSize, pixelSize, pixelSize);
            });
        });
    }

    ctx.restore();
    ctx.restore(); 

    // UI
    if (flyingModeUI) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(CANVAS_WIDTH/2 - 80, 80, 160, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '20px VT323';
        ctx.textAlign = 'center';
        ctx.fillText("飞行模式已开启 (F)", CANVAS_WIDTH/2, 100);
    }

    const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
    if (boss && bossActive) {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (CANVAS_WIDTH - barWidth) / 2;
        const barY = 40;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px VT323';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText("末影龙", CANVAS_WIDTH / 2, barY - 8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#222';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        const hpPercent = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = '#d946ef'; 
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for(let i=1; i<10; i++) ctx.fillRect(barX + (barWidth/10)*i, barY, 2, barHeight);
    } else if (!boss && level.current.enemies.some(e => e.type === 'ENEMY_BOSS')) {
         if (Math.floor(Date.now() / 500) % 2 === 0) {
             ctx.fillStyle = '#4ade80';
             ctx.font = 'bold 30px VT323';
             ctx.textAlign = 'center';
             ctx.fillText("传送门已开启！快逃！", CANVAS_WIDTH / 2, 80);
         }
    }

    for(let i=0; i<p.maxHealth; i++) {
        const row = Math.floor(i / 10);
        const col = i % 10;
        ctx.fillStyle = i < p.health ? '#ef4444' : '#374151';
        const hx = 20 + col * 25;
        const hy = CANVAS_HEIGHT - 40 - (row * 25);
        ctx.fillRect(hx, hy, 20, 20); 
        if (i < p.health) {
             ctx.fillStyle = '#fca5a5';
             ctx.fillRect(hx+2, hy+2, 6, 6);
        }
    }
  };

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, mainColor: string, topColor?: string, transparent: boolean = false) => {
    if (transparent) ctx.globalAlpha = 0.6;
    ctx.fillStyle = mainColor;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for(let i=0; i<4; i++) {
        const nx = Math.floor(Math.random() * TILE_SIZE);
        const ny = Math.floor(Math.random() * TILE_SIZE);
        const ns = Math.floor(Math.random() * 6) + 2;
        ctx.fillRect(x+nx, y+ny, ns, ns);
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x+2, y+2, TILE_SIZE-4, TILE_SIZE-4);

    if (topColor) {
        ctx.fillStyle = topColor;
        ctx.fillRect(x, y, TILE_SIZE, 6);
    }
    if (transparent) ctx.globalAlpha = 1.0;
  };

  return (
    <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="block mx-auto border-4 border-gray-700 bg-black shadow-2xl rounded-sm max-w-full"
    />
  );
};

export default GameCanvas;