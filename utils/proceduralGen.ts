import { WORLD_HEIGHT_TILES } from "../constants";
import { Difficulty, BiomeType } from "../types";

export const generateProceduralLevel = (difficulty: Difficulty, biome: BiomeType, lengthMultiplier: number = 1): string[] => {
  const baseWidth = 150; 
  // Limit max width to avoid canvas rendering crashes on mobile (approx 32000px limit usually)
  // 150 tiles * 10 * 32px = 48000px which is risky, so we might encounter issues on 10x on some devices, 
  // but we will fulfill the request.
  const width = Math.floor(baseWidth * lengthMultiplier);
  const height = WORLD_HEIGHT_TILES;
  const map: string[][] = Array.from({ length: height }, () => Array(width).fill('.'));

  // Define Palette
  let topBlock = 'G'; 
  let fillBlock = 'D'; 
  let liquidBlock = 'L'; 
  let bedrockBlock = '#'; 
  let platformBlock = '?'; 

  switch (biome) {
      case 'DESERT': topBlock = 'S'; fillBlock = 'A'; platformBlock = 'A'; break;
      case 'SNOW': topBlock = 'W'; fillBlock = 'D'; liquidBlock = 'I'; platformBlock = 'I'; break;
      case 'NETHER': topBlock = 'R'; fillBlock = 'R'; liquidBlock = 'L'; platformBlock = 'O'; break;
      case 'THE_END': topBlock = 'X'; fillBlock = 'X'; liquidBlock = '.'; bedrockBlock = '.'; platformBlock = 'O'; break;
  }

  // Difficulty Config
  const pitChance = difficulty === 'EASY' ? 0 : (difficulty === 'HARD' ? 0.08 : 0.05);
  const platformChance = difficulty === 'EASY' ? 0.6 : 0.4;
  const enemySpawnRate = difficulty === 'EASY' ? 0.08 : (difficulty === 'HARD' ? 0.25 : 0.15);

  // 1. Bedrock
  if (biome !== 'THE_END') {
      for (let x = 0; x < width; x++) map[height - 1][x] = bedrockBlock;
  }

  // 2. Terrain
  let groundLevel = 2;
  for (let x = 0; x < width; x++) {
      // Start and End safe zones
      if (x < 15 || x > width - 30) groundLevel = 3;
      else {
          if (Math.random() < 0.2) groundLevel = Math.max(1, Math.min(groundLevel + (Math.floor(Math.random()*3)-1), 5)); 
          if (Math.random() < pitChance && x > 20 && x < width - 40) groundLevel = 0; 
      }

      if (groundLevel === 0) {
          if (biome !== 'THE_END') map[height - 1][x] = liquidBlock; 
      } else {
          for (let h = 0; h < groundLevel; h++) {
              const y = height - 2 - h;
              if (h === groundLevel - 1) map[y][x] = topBlock;
              else map[y][x] = fillBlock;
          }
      }
  }

  // 3. Platforms
  for (let x = 20; x < width - 30; x += 5) {
      if (Math.random() < platformChance) {
          const platY = height - 6 - Math.floor(Math.random() * 4);
          const w = Math.floor(Math.random() * 3) + 2;
          for (let k = 0; k < w; k++) {
              if (x + k < width - 30) map[platY][x + k] = platformBlock;
          }
      }
  }

  // 4. Enemies - Using Generic markers that will be resolved to specific mobs in GameCanvas based on Biome
  // 'g' = ground mob, 'f' = flying mob, 't' = tank/special
  for (let x = 20; x < width - 30; x++) {
      let surfaceY = -1;
      for (let y = 0; y < height; y++) {
          if (map[y][x] !== '.') { surfaceY = y - 1; break; }
      }

      if (surfaceY > 3 && surfaceY < height - 2) {
          const blockBelow = map[surfaceY+1][x];
          if (blockBelow !== liquidBlock && blockBelow !== bedrockBlock && blockBelow !== '.') {
               if (Math.random() < enemySpawnRate) { 
                   // Randomly assign a type based on rarity
                   const r = Math.random();
                   if (r < 0.6) map[surfaceY][x] = 'g'; // Common ground
                   else if (r < 0.85) map[surfaceY][x] = 's'; // Shooter/Special
                   else map[surfaceY][x] = 't'; // Tank/Rare
               }
          }
      }

      // Flying Enemies
      if (Math.random() < (difficulty === 'HARD' ? 0.05 : 0.02)) {
          const y = biome === 'NETHER' ? 4 + Math.floor(Math.random()*6) : 2 + Math.floor(Math.random()*3);
          map[y][x] = 'f';
      }
  }

  // 5. Boss & Exit
  const bossArenaStart = width - 25;
  const arenaHeight = height - 5; 
  for (let x = bossArenaStart; x < width; x++) {
      for (let y = 0; y < height; y++) {
          if (y >= arenaHeight) {
              map[y][x] = (biome === 'THE_END' ? 'X' : (y === height - 1 ? bedrockBlock : fillBlock));
          } else map[y][x] = '.';
      }
      if (biome !== 'THE_END') map[arenaHeight][x] = topBlock;
  }

  map[height-10][width-15] = 'B'; 
  map[arenaHeight-1][width-6] = 'E';

  return map.map(r => r.join(''));
};