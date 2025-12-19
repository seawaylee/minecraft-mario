import { WORLD_HEIGHT_TILES } from "../constants";

export const generateProceduralLevel = (): string[] => {
  const width = 150; // Map length
  const height = WORLD_HEIGHT_TILES;
  const map: string[][] = Array(height).fill(null).map(() => Array(width).fill('.'));

  // 1. Fill Bedrock
  for (let x = 0; x < width; x++) {
    map[height - 1][x] = '#';
  }

  // 2. Generate Terrain (Perlin-ish noise simplified)
  let groundHeight = 2; // Height from bottom (not including bedrock)
  for (let x = 0; x < width; x++) {
    // Randomly change height
    if (x > 10 && x < width - 10) {
        if (Math.random() < 0.2) groundHeight += Math.random() > 0.5 ? 1 : -1;
        groundHeight = Math.max(1, Math.min(groundHeight, 4));
    }

    // Fill Ground
    for (let y = height - 2; y >= height - 1 - groundHeight; y--) {
        if (y === height - 1 - groundHeight) map[y][x] = 'G'; // Grass on top
        else map[y][x] = 'D'; // Dirt below
    }
  }

  // 3. Add Floating Platforms ('?') and Stone ('S')
  for (let x = 15; x < width - 15; x += 3) {
      if (Math.random() < 0.3) {
          const platY = height - 5 - Math.floor(Math.random() * 6);
          const platW = Math.floor(Math.random() * 3) + 2;
          for(let k=0; k<platW; k++) {
              if (x+k < width - 5) map[platY][x+k] = Math.random() > 0.5 ? '?' : 'S';
          }
      }
  }

  // 4. Add Enemies
  for (let x = 20; x < width - 20; x++) {
      // Ground Enemies
      const groundY = height - 2;
      while(groundY > 0 && map[groundY][x] !== '.') {
          // find surface
      }
      
      // Chance to spawn enemy if there is ground
      if (map[height-2][x] !== '.' && map[height-3][x] === '.') {
          if (Math.random() < 0.05) map[height-3][x] = 'C'; // Creeper
          else if (Math.random() < 0.03) map[height-3][x] = 'M'; // Enderman
      }

      // Air Enemies (Ghast)
      if (Math.random() < 0.01) {
          map[3][x] = '^';
      }
  }

  // 5. Boss Arena & Portal
  const bossStart = width - 15;
  // Clear area for boss
  for (let x = bossStart; x < width; x++) {
      for (let y = 0; y < height - 2; y++) {
          map[y][x] = '.';
      }
      map[height-2][x] = '#'; // Flat bedrock for arena
  }
  
  map[height-5][width-8] = 'B'; // Boss
  map[height-3][width-3] = 'E'; // Portal

  // Convert to strings
  return map.map(row => row.join(''));
};