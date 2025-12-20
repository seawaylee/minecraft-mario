import { WORLD_HEIGHT_TILES } from "../constants";
import { Difficulty, BiomeType } from "../types";

export const generateProceduralLevel = (difficulty: Difficulty, biome: BiomeType): string[] => {
  const width = 150; // Map length
  const height = WORLD_HEIGHT_TILES;
  const map: string[][] = Array.from({ length: height }, () => Array(width).fill('.'));

  // Define Palette based on Biome
  let topBlock = 'G'; // Grass
  let fillBlock = 'D'; // Dirt
  let liquidBlock = 'L'; // Lava
  let bedrockBlock = '#'; // Bedrock
  let platformBlock = '?'; // Stone brick/platform

  switch (biome) {
      case 'DESERT':
          topBlock = 'S'; // Sand
          fillBlock = 'A'; // Sandstone (using A to avoid conflict)
          platformBlock = 'A';
          break;
      case 'SNOW':
          topBlock = 'W'; // Snow Block (W for White/Winter)
          fillBlock = 'D'; // Dirt
          liquidBlock = 'I'; // Ice (Solid liquid?) or just Water. Let's make it Ice.
          platformBlock = 'I';
          break;
      case 'NETHER':
          topBlock = 'R'; // Netherrack (R for Red)
          fillBlock = 'R';
          liquidBlock = 'L';
          platformBlock = 'O'; // Obsidian
          break;
      case 'THE_END':
          topBlock = 'X'; // End Stone (Xenolith)
          fillBlock = 'X';
          liquidBlock = '.'; // Void
          bedrockBlock = '.'; // No bedrock in End!
          platformBlock = 'O'; // Obsidian
          break;
  }

  // Difficulty Config
  const pitChance = difficulty === 'EASY' ? 0 : (difficulty === 'HARD' ? 0.08 : 0.05);
  const platformChance = difficulty === 'EASY' ? 0.6 : 0.4;
  const enemySpawnRate = difficulty === 'EASY' ? 0.08 : (difficulty === 'HARD' ? 0.25 : 0.15);

  // 1. Bedrock (Floor)
  if (biome !== 'THE_END') {
      for (let x = 0; x < width; x++) {
        map[height - 1][x] = bedrockBlock;
      }
  }

  // 2. Terrain
  let groundLevel = 2; // Blocks above bottom
  
  for (let x = 0; x < width; x++) {
      // Start/End/Boss Arena flat
      if (x < 15 || x > width - 30) {
          groundLevel = 2;
      } else {
          // Random terrain changes
          if (Math.random() < 0.2) {
              const change = Math.floor(Math.random() * 3) - 1; 
              groundLevel += change;
              groundLevel = Math.max(1, Math.min(groundLevel, 5)); 
          }
          
          // Pits
          if (Math.random() < pitChance && x > 20 && x < width - 40) {
              groundLevel = 0; 
          }
      }

      // Fill Column
      if (groundLevel === 0) {
          if (biome !== 'THE_END') {
            map[height - 1][x] = liquidBlock; 
          }
      } else {
          for (let h = 0; h < groundLevel; h++) {
              const y = height - 2 - h;
              // If THE_END, offset everything up a bit so they don't fall into void immediately? 
              // Actually existing logic places them at bottom. Let's just draw them.
              
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

  // 4. Enemies
  for (let x = 20; x < width - 30; x++) {
      // Check column to find surface
      let surfaceY = -1;
      for (let y = 0; y < height; y++) {
          if (map[y][x] !== '.') {
              surfaceY = y - 1;
              break;
          }
      }

      // If we have a valid surface
      if (surfaceY > 3 && surfaceY < height - 2) {
          const blockBelow = map[surfaceY+1][x];
          if (blockBelow !== liquidBlock && blockBelow !== bedrockBlock && blockBelow !== '.') {
               if (Math.random() < enemySpawnRate) { 
                   const roll = Math.random();
                   
                   // Biome specific enemy weights
                   if (biome === 'NETHER') {
                        if (roll < 0.6) map[surfaceY][x] = '^'; // Ghast more common
                        else map[surfaceY][x] = 'Z'; // Pigman (Zombie)
                   } else if (biome === 'THE_END') {
                        map[surfaceY][x] = 'M'; // Enderman only
                   } else {
                        if (roll < 0.4) map[surfaceY][x] = 'Z'; 
                        else if (roll < 0.7) map[surfaceY][x] = 'C'; 
                        else map[surfaceY][x] = 'M'; 
                   }
               }
          }
      }

      // Flying Enemies
      if (Math.random() < (difficulty === 'HARD' ? 0.04 : 0.02)) {
          // In Nether, Ghasts are lower too
          const y = biome === 'NETHER' ? 4 + Math.floor(Math.random()*6) : 2 + Math.floor(Math.random()*3);
          map[y][x] = '^';
      }
  }

  // 5. Boss & Exit
  const bossArenaStart = width - 25;
  for (let x = bossArenaStart; x < width; x++) {
      for (let y = 0; y < height - 2; y++) {
          map[y][x] = '.';
      }
      // Ensure flat ground for arena
      if (biome === 'THE_END') {
          map[height-2][x] = 'O'; // Obsidian platform for Boss
      } else {
          map[height-2][x] = bedrockBlock; 
          map[height-1][x] = bedrockBlock; 
      }
  }

  // Place Boss floating
  map[height-8][width-15] = 'B'; 
  
  // Place Portal at very end
  map[height-3][width-4] = 'E';

  return map.map(r => r.join(''));
};