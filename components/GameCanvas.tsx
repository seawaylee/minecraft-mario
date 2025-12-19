import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Block, Entity, LevelData, PlayerState, CharacterType } from '../types';
import { TILE_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, CANVAS_WIDTH, CANVAS_HEIGHT, CHARACTERS, PLAYER_MAX_HP, ATTACK_COOLDOWN, ATTACK_RANGE, BOSS_HP, PROJECTILE_SPEED } from '../constants';
import { audioController } from '../utils/audio';

interface GameCanvasProps {
  levelRaw: string[];
  character: CharacterType;
  onGameOver: () => void;
  onWin: (score: number) => void;
  onAddScore: (amount: number) => void;
  score: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ levelRaw, character, onGameOver, onWin, onAddScore, score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const staticLevelCanvas = useRef<HTMLCanvasElement | null>(null);
  
  const player = useRef<PlayerState>({
    x: 50, y: 100, vx: 0, vy: 0, width: 24, height: 30, 
    isGrounded: false, isDead: false, facingRight: true,
    health: PLAYER_MAX_HP, maxHealth: PLAYER_MAX_HP,
    attackCooldown: 0, isAttacking: false
  });
  
  const level = useRef<LevelData>({ blocks: [], enemies: [], items: [], projectiles: [], spawnX: 50, spawnY: 100 });
  const camera = useRef({ x: 0 });
  const particles = useRef<Entity[]>([]);

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
        else if (char === 'S') parsedBlocks.push({ x: wx, y: wy, type: 'STONE', solid: true });
        else if (char === '#') parsedBlocks.push({ x: wx, y: wy, type: 'BEDROCK', solid: true });
        else if (char === 'L') parsedBlocks.push({ x: wx, y: wy, type: 'LAVA', solid: false });
        else if (char === '?') parsedBlocks.push({ x: wx, y: wy, type: 'STONE', solid: true });
        else if (char === 'E') parsedBlocks.push({ x: wx, y: wy, type: 'PORTAL', solid: false });
        else if (char === 'C') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_CREEPER', x: wx, y: wy, width: 24, height: 24, vx: -0.5, vy: 0, hp: 1, maxHp: 1 });
        }
        else if (char === 'M') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_ENDERMAN', x: wx, y: wy, width: 24, height: 60, vx: 0, vy: 0, hp: 3, maxHp: 3 });
        }
        else if (char === '^') {
            parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_GHAST', x: wx, y: wy, width: 48, height: 48, vx: 0, vy: 0, hp: 3, maxHp: 3 });
        }
        else if (char === 'B') {
             // Boss hitbox is big
             parsedEnemies.push({ id: `e_${x}_${y}`, type: 'ENEMY_BOSS', x: wx, y: wy, width: 80, height: 60, vx: 0, vy: 0, hp: BOSS_HP, maxHp: BOSS_HP });
        }
      }
    });

    level.current = { blocks: parsedBlocks, enemies: parsedEnemies, items: parsedItems, projectiles: [], spawnX: startX, spawnY: startY };
    player.current = { 
        x: startX, y: startY, vx: 0, vy: 0, width: 24, height: 30, 
        isGrounded: false, isDead: false, facingRight: true,
        health: PLAYER_MAX_HP, maxHealth: PLAYER_MAX_HP,
        attackCooldown: 0, isAttacking: false
    };
    particles.current = [];
    camera.current.x = 0;

    renderStaticLevel(mapWidth, mapHeight);

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [levelRaw]);

  // Helper to render static level
  const renderStaticLevel = (w: number, h: number) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = w + 100;
      offscreen.height = h + 100;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
          // Clear first
          offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
          level.current.blocks.forEach(b => {
             if (b.type === 'GRASS') drawBlock(offCtx, b.x, b.y, '#5c4033', '#4ade80');
             else if (b.type === 'DIRT') drawBlock(offCtx, b.x, b.y, '#5c4033');
             else if (b.type === 'STONE') drawBlock(offCtx, b.x, b.y, '#78716c');
             else if (b.type === 'BEDROCK') drawBlock(offCtx, b.x, b.y, '#292524');
             else if (b.type === 'LAVA') {
                 offCtx.fillStyle = '#cf222e';
                 offCtx.fillRect(b.x, b.y + 4, TILE_SIZE, TILE_SIZE - 4);
             }
             else if (b.type === 'PORTAL') {
                 offCtx.fillStyle = '#111';
                 offCtx.fillRect(b.x, b.y, TILE_SIZE, TILE_SIZE * 2);
                 offCtx.fillStyle = '#a855f7';
                 offCtx.globalAlpha = 0.6;
                 offCtx.fillRect(b.x + 4, b.y + 4, TILE_SIZE - 8, TILE_SIZE * 2 - 8);
                 offCtx.globalAlpha = 1.0;
             }
        });
      }
      staticLevelCanvas.current = offscreen;
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
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
    
    // --- COMBAT & ACTIONS ---
    if (p.attackCooldown > 0) p.attackCooldown--;

    // ATTACK (J) - Fully Automatic
    if (keys.current['KeyJ'] && p.attackCooldown <= 0) {
        fireProjectile(p);
        p.attackCooldown = ATTACK_COOLDOWN; // Auto fire rate
    }

    // DIG (K)
    if (keys.current['KeyK'] && p.attackCooldown <= 0) {
        performDig(p);
    }

    // --- PHYSICS ---
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
      p.vx -= 0.5;
      p.facingRight = false;
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) {
      p.vx += 0.5;
      p.facingRight = true;
    }
    if ((keys.current['ArrowUp'] || keys.current['Space'] || keys.current['KeyW']) && p.isGrounded) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      audioController.playSFX('JUMP');
    }

    p.vx = Math.max(Math.min(p.vx, MOVE_SPEED), -MOVE_SPEED);
    p.vx *= FRICTION;
    p.vy += GRAVITY;

    p.x += p.vx;
    checkCollision(p, 'x');
    p.y += p.vy;
    checkCollision(p, 'y');

    updateEntities();

    const targetCamX = p.x - CANVAS_WIDTH / 3;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;
    if (camera.current.x < 0) camera.current.x = 0;

    if (p.y > CANVAS_HEIGHT + 100) {
      die();
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const fireProjectile = (p: PlayerState) => {
      p.isAttacking = true;
      audioController.playSFX('JUMP'); // Use jump as pew-pew sound for now or add new sound

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

      // Ensure projectiles array exists
      if (!level.current.projectiles) level.current.projectiles = [];
      level.current.projectiles.push(bullet);

      // Reset attacking visual after short delay
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

  const checkCollision = (p: PlayerState, axis: 'x' | 'y') => {
    if (p.x < 0) p.x = 0;
    const checkRadius = 150;
    
    for (const block of level.current.blocks) {
      if (Math.abs(block.x - p.x) > checkRadius || Math.abs(block.y - p.y) > checkRadius) continue;
      if (!block.solid && block.type !== 'LAVA' && block.type !== 'PORTAL') continue;

      const hitX = p.x + 4;
      const hitW = p.width - 8;

      if (rectIntersect(hitX, p.y, hitW, p.height, block.x, block.y, TILE_SIZE, TILE_SIZE)) {
        if (block.type === 'LAVA') { die(); return; }
        if (block.type === 'PORTAL') {
          const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
          if (boss) return; 
          audioController.playSFX('WIN');
          onWin(score);
          p.isDead = true;
          return;
        }

        if (block.solid) {
          if (axis === 'x') {
            if (p.vx > 0) p.x = block.x - p.width;
            else if (p.vx < 0) p.x = block.x + TILE_SIZE;
            p.vx = 0;
          } else {
            if (p.vy > 0) {
              p.y = block.y - p.height;
              p.isGrounded = true;
              p.vy = 0;
            } else if (p.vy < 0) {
              p.y = block.y + TILE_SIZE;
              p.vy = 0;
            }
          }
        }
      }
    }
  };

  const updateEntities = () => {
    const p = player.current;

    // --- Update Projectiles (Homing Logic) ---
    if (level.current.projectiles) {
        level.current.projectiles.forEach(proj => {
            if (proj.dead) return;

            // Find nearest alive enemy
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
                // Homing vector
                const t = target as Entity;
                const dx = (t.x + t.width/2) - proj.x;
                const dy = (t.y + t.height/2) - proj.y;
                const angle = Math.atan2(dy, dx);
                
                // Lerp velocity for smooth curve or direct set for aggressive homing
                // Let's do aggressive turning
                proj.vx = Math.cos(angle) * PROJECTILE_SPEED;
                proj.vy = Math.sin(angle) * PROJECTILE_SPEED;
            } else {
                // No target, just keep going or apply gravity? Keep going straight.
                // It was initialized with horizontal velocity.
            }

            proj.x += proj.vx;
            proj.y += proj.vy;

            // Bullet vs Enemy
            for (const e of level.current.enemies) {
                if (e.dead) continue;
                if (rectIntersect(proj.x, proj.y, proj.width, proj.height, e.x, e.y, e.width, e.height)) {
                    proj.dead = true;
                    e.hp--;
                    spawnParticles(e.x + e.width/2, e.y + e.height/2, '#ff0000', 3);
                    if (e.hp <= 0) {
                        e.dead = true;
                        onAddScore(e.type === 'ENEMY_BOSS' ? 1000 : 100);
                        audioController.playSFX('EXPLODE');
                    } else {
                        // Small Knockback
                        e.vx = proj.vx > 0 ? 2 : -2;
                    }
                    break; // Bullet hits one enemy
                }
            }

            // Bullet vs World (Cleanup)
            if (proj.x < camera.current.x - 100 || proj.x > camera.current.x + CANVAS_WIDTH + 100 || proj.y > CANVAS_HEIGHT) {
                proj.dead = true;
            }
        });
        
        // Remove dead bullets
        level.current.projectiles = level.current.projectiles.filter(b => !b.dead);
    }

    // --- Update Enemies ---
    level.current.enemies.forEach(e => {
      if (e.dead) return;

      const distToPlayer = p.x - e.x;
      const absDist = Math.abs(distToPlayer);
      
      // EASIER DIFFICULTY: Reduced speeds and aggro ranges
      if (e.type === 'ENEMY_GHAST') {
          if (absDist < 300) {
              e.x += (distToPlayer > 0 ? 0.03 : -0.03) * 30; // Slower
              e.y += (p.y - e.y > 0 ? 0.01 : -0.01) * 30;
          }
      } else if (e.type === 'ENEMY_ENDERMAN') {
           if (absDist < 150) { // Reduced aggro range
               e.vx = (distToPlayer > 0 ? 1 : -1) * 1.5; // Slower
           } else {
               e.vx = 0;
           }
           e.x += e.vx;
           e.vy += GRAVITY;
           e.y += e.vy;
      } else if (e.type === 'ENEMY_BOSS') {
           if (absDist < 500) {
                // Fly higher
                const hoverY = 200 + Math.sin(Date.now() / 800) * 50;
                const dy = hoverY - e.y;
                e.y += dy * 0.05;
                
                // Move L/R
                if (e.x > p.x + 100) e.x -= 2;
                else if (e.x < p.x - 100) e.x += 2;
           }
      } else {
          // Creeper - slowed down
          e.x += e.vx * 0.8;
          if (Math.random() < 0.02) e.vx *= -1;
      }

      // Player Damage
      if (Math.abs(e.x - p.x) < 50 && Math.abs(e.y - p.y) < 50) {
          if (rectIntersect(p.x + 4, p.y, p.width - 8, p.height, e.x, e.y, e.width, e.height)) {
            takeDamage(1);
            p.vx = (p.x - e.x) > 0 ? 8 : -8; // More knockback to help player escape
            p.vy = -4;
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
      player.current.health -= amount;
      audioController.playSFX('EXPLODE');
      if (player.current.health <= 0) {
          die();
      }
  };

  const die = () => {
    if (player.current.isDead) return;
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

    ctx.fillStyle = '#87CEEB';
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

    // Dynamic blocks (Lava)
    level.current.blocks.forEach(b => {
         if (b.type === 'LAVA' && b.x > camera.current.x - TILE_SIZE && b.x < camera.current.x + CANVAS_WIDTH) {
             if(Math.random() > 0.95) {
                 ctx.fillStyle = '#ffaa00';
                 ctx.fillRect(b.x + Math.random()*20, b.y + Math.random()*20, 4, 4);
             }
         }
    });

    // Draw Projectiles
    if (level.current.projectiles) {
        ctx.fillStyle = '#FFFF00'; // Yellow bullets
        level.current.projectiles.forEach(proj => {
            ctx.beginPath();
            ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, 4, 0, Math.PI * 2);
            ctx.fill();
            // Trail
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fillRect(proj.x - proj.vx, proj.y - proj.vy, 4, 4);
            ctx.fillStyle = '#FFFF00'; // Reset for next
        });
    }

    // Enemies
    level.current.enemies.forEach(e => {
      if (e.dead) return;
      if (e.x < camera.current.x - 50 || e.x > camera.current.x + CANVAS_WIDTH + 50) return;

      if (e.type === 'ENEMY_GHAST') {
          // Draw Ghast (White box, sad face)
          ctx.fillStyle = '#F0F0F0';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          // Tentacles
          ctx.fillStyle = '#E0E0E0';
          ctx.fillRect(e.x + 5, e.y + e.height, 6, 15);
          ctx.fillRect(e.x + 15, e.y + e.height, 6, 25);
          ctx.fillRect(e.x + 25, e.y + e.height, 6, 10);
          ctx.fillRect(e.x + 35, e.y + e.height, 6, 20);
          // Face
          ctx.fillStyle = '#000';
          // Eyes (closed/sad)
          ctx.fillRect(e.x + 8, e.y + 15, 8, 2);
          ctx.fillRect(e.x + 30, e.y + 15, 8, 2);
          // Mouth
          ctx.fillRect(e.x + 20, e.y + 30, 8, 8);
          
      } else if (e.type === 'ENEMY_ENDERMAN') {
          // Tall, Black, Purple Eyes
          ctx.fillStyle = '#111';
          // Head
          ctx.fillRect(e.x, e.y, 24, 24); 
          // Body
          ctx.fillRect(e.x + 4, e.y + 24, 16, 20);
          // Arms
          ctx.fillRect(e.x - 4, e.y + 24, 4, 30);
          ctx.fillRect(e.x + 24, e.y + 24, 4, 30);
          // Legs
          ctx.fillRect(e.x + 6, e.y + 44, 4, 30);
          ctx.fillRect(e.x + 14, e.y + 44, 4, 30);
          
          // Purple Eyes
          ctx.fillStyle = '#cc00fa';
          ctx.fillRect(e.x + 2, e.y + 12, 6, 2);
          ctx.fillRect(e.x + 16, e.y + 12, 6, 2);

          // Particles
          if (Math.random() < 0.1) {
              ctx.fillStyle = '#cc00fa';
              ctx.fillRect(e.x + Math.random()*30 - 5, e.y + Math.random()*60, 2, 2);
          }
      } else if (e.type === 'ENEMY_BOSS') {
          // ENDER DRAGON DRAWING
          const facingLeft = player.current.x < e.x;
          
          ctx.fillStyle = '#111'; // Black body

          // 1. Body
          ctx.fillRect(e.x + 20, e.y + 20, 40, 20);

          // 2. Wings (Big triangles)
          ctx.fillStyle = '#222';
          const wingFlap = Math.sin(Date.now() / 200) * 15;
          ctx.beginPath();
          // Left Wing
          ctx.moveTo(e.x + 30, e.y + 20);
          ctx.lineTo(e.x, e.y - 20 + wingFlap);
          ctx.lineTo(e.x + 50, e.y + 20);
          ctx.fill();

          // 3. Neck & Head
          ctx.fillStyle = '#111';
          if (facingLeft) {
              // Neck
              ctx.beginPath();
              ctx.moveTo(e.x + 20, e.y + 25);
              ctx.lineTo(e.x - 10, e.y + 10);
              ctx.lineTo(e.x + 20, e.y + 35);
              ctx.fill();
              // Head
              ctx.fillRect(e.x - 25, e.y, 25, 15);
              // Snout
              ctx.fillStyle = '#222';
              ctx.fillRect(e.x - 25, e.y + 5, 10, 10);
              // Eyes
              ctx.fillStyle = '#cc00fa';
              ctx.fillRect(e.x - 10, e.y + 5, 6, 4);
          } else {
              // Right facing neck/head
              ctx.beginPath();
              ctx.moveTo(e.x + 60, e.y + 25);
              ctx.lineTo(e.x + 90, e.y + 10);
              ctx.lineTo(e.x + 60, e.y + 35);
              ctx.fill();
               // Head
              ctx.fillRect(e.x + 80, e.y, 25, 15);
              // Snout
              ctx.fillStyle = '#222';
              ctx.fillRect(e.x + 95, e.y + 5, 10, 10);
              // Eyes
              ctx.fillStyle = '#cc00fa';
              ctx.fillRect(e.x + 84, e.y + 5, 6, 4);
          }

      } else {
          // Creeper
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#000';
          ctx.fillRect(e.x + 4, e.y + 4, 4, 4);
          ctx.fillRect(e.x + 16, e.y + 4, 4, 4);
          ctx.fillRect(e.x + 8, e.y + 10, 8, 8);
          // Legs
          ctx.fillRect(e.x + 4, e.y + 20, 6, 4);
          ctx.fillRect(e.x + 14, e.y + 20, 6, 4);
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
    
    const drawX = p.x;
    const drawY = p.y;
    
    // Weapon Visual (Gun)
    if (true) { // Always show gun
        ctx.save();
        ctx.translate(drawX + p.width/2 + 5, drawY + p.height/2 + 5);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, 12, 6); // Barrel
        ctx.fillStyle = '#555';
        ctx.fillRect(-4, 2, 6, 6); // Handle
        if (p.isAttacking) {
             // Muzzle flash
             ctx.fillStyle = '#FFA500';
             ctx.beginPath();
             ctx.arc(14, 3, Math.random() * 6 + 2, 0, Math.PI*2);
             ctx.fill();
        }
        ctx.restore();
    }

    // Legs
    ctx.fillStyle = charData.legs;
    if (Math.abs(p.vx) > 0.1) {
       const walkOffset = Math.sin(Date.now() / 100) * 4;
       ctx.fillRect(drawX + 4 + walkOffset, drawY + 18, 6, 12);
       ctx.fillRect(drawX + 14 - walkOffset, drawY + 18, 6, 12);
    } else {
       ctx.fillRect(drawX + 4, drawY + 18, 6, 12);
       ctx.fillRect(drawX + 14, drawY + 18, 6, 12);
    }
    
    // Torso
    ctx.fillStyle = charData.color;
    ctx.fillRect(drawX + 4, drawY + 8, 16, 12);
    
    // Head
    if (charData.face) {
        const pixelSize = 2.5;
        const headX = drawX + 2;
        const headY = drawY - 4;
        charData.face.forEach((row, rowIndex) => {
            row.forEach((colColor, colIndex) => {
                ctx.fillStyle = colColor;
                ctx.fillRect(headX + colIndex * pixelSize, headY + rowIndex * pixelSize, pixelSize, pixelSize);
            });
        });
    }

    ctx.restore();
    
    ctx.restore(); // Back to screen space (No camera)

    // UI - Boss Bar (Minecraft Style)
    const boss = level.current.enemies.find(e => e.type === 'ENEMY_BOSS' && !e.dead);
    if (boss) {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (CANVAS_WIDTH - barWidth) / 2;
        const barY = 20;

        // Boss Name
        ctx.fillStyle = '#FFF';
        ctx.font = '20px VT323';
        ctx.textAlign = 'center';
        ctx.fillText("末影龙", CANVAS_WIDTH / 2, barY - 5);

        // Background (Black)
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health (Purple)
        const hpPercent = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = '#bd00ff'; // Minecraft Boss Purple
        ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * hpPercent, barHeight - 4);
        
        // Ridges (Visual detail)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for(let i=0; i<10; i++) {
             ctx.fillRect(barX + (barWidth/10)*i, barY, 2, barHeight);
        }
    }

    // UI - Player Health Hearts
    for(let i=0; i<p.maxHealth; i++) {
        ctx.fillStyle = i < p.health ? '#ef4444' : '#374151';
        // Draw Heart Shape
        const hx = 20 + i * 25;
        const hy = CANVAS_HEIGHT - 40;
        ctx.fillRect(hx, hy, 20, 20); // Placeholder heart
        // Shine
        if (i < p.health) {
             ctx.fillStyle = '#fca5a5';
             ctx.fillRect(hx+2, hy+2, 6, 6);
        }
    }
  };

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, mainColor: string, topColor?: string) => {
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