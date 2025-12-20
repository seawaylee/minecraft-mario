import React, { useState, useEffect } from 'react';
import { ScreenState, CharacterType, LevelData, Difficulty, BiomeType } from './types';
import { DEFAULT_LEVEL_MAP, CHARACTERS } from './constants';
import GameCanvas from './components/GameCanvas';
import { audioController } from './utils/audio';
import { generateLevelWithAI } from './services/geminiService';
import { generateProceduralLevel } from './utils/proceduralGen';
import { Gamepad2, Skull, Trophy, Play, Settings, Sparkles, Volume2, VolumeX, Swords, Shield, Skull as SkullIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pickaxe, Feather, Target, Map } from 'lucide-react';

// Mobile Controls Overlay
const MobileControls = () => {
  const dispatchKey = (code: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(new KeyboardEvent(type, { code: code, bubbles: true }));
  };

  const handleTouch = (code: string, e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to stop scrolling/zooming/ghost clicks
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    dispatchKey(code, 'keydown');
  };

  const handleEnd = (code: string, e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    dispatchKey(code, 'keyup');
  };

  // Button Components
  const DPadBtn = ({ code, icon: Icon, className }: any) => (
    <button
        className={`w-14 h-14 md:w-16 md:h-16 bg-gray-800/80 rounded-lg border-2 border-gray-600 active:bg-gray-600 active:border-gray-400 flex items-center justify-center text-white transition-colors ${className}`}
        onTouchStart={(e) => handleTouch(code, e)}
        onTouchEnd={(e) => handleEnd(code, e)}
        onMouseDown={(e) => handleTouch(code, e)}
        onMouseUp={(e) => handleEnd(code, e)}
        onMouseLeave={(e) => handleEnd(code, e)}
        style={{ touchAction: 'none' }}
    >
        <Icon size={32} />
    </button>
  );

  const ActionBtn = ({ code, label, color, icon: Icon, className }: any) => (
      <button
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-black/30 shadow-xl active:scale-95 active:brightness-110 transition-all flex items-center justify-center text-white font-bold ${className}`}
        style={{ backgroundColor: color, touchAction: 'none' }}
        onTouchStart={(e) => handleTouch(code, e)}
        onTouchEnd={(e) => handleEnd(code, e)}
        onMouseDown={(e) => handleTouch(code, e)}
        onMouseUp={(e) => handleEnd(code, e)}
        onMouseLeave={(e) => handleEnd(code, e)}
      >
          {Icon ? <Icon size={32} strokeWidth={2.5} /> : label}
      </button>
  );

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end pb-6 px-6 md:hidden select-none">
        <div className="flex justify-between items-end w-full pointer-events-auto">
            {/* D-Pad */}
            <div className="relative w-40 h-40 md:w-48 md:h-48">
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                     <DPadBtn code="ArrowUp" icon={ArrowUp} />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                     <DPadBtn code="ArrowDown" icon={ArrowDown} />
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                     <DPadBtn code="ArrowLeft" icon={ArrowLeft} />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                     <DPadBtn code="ArrowRight" icon={ArrowRight} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="relative w-40 h-40 md:w-48 md:h-48">
                {/* Jump (Space) - Main Button */}
                <div className="absolute bottom-0 right-1/2 translate-x-1/2">
                    <ActionBtn code="Space" icon={ArrowUp} color="#22c55e" className="scale-110" />
                </div>
                {/* Attack (J) - Right */}
                <div className="absolute bottom-4 right-0">
                    <ActionBtn code="KeyJ" icon={Target} color="#ef4444" className="w-14 h-14 md:w-16 md:h-16" />
                </div>
                {/* Dig (K) - Top Right */}
                 <div className="absolute top-0 right-0">
                    <ActionBtn code="KeyK" icon={Pickaxe} color="#eab308" className="w-12 h-12 md:w-14 md:h-14" />
                </div>
                {/* Fly (F) - Top Left */}
                <div className="absolute top-0 left-0">
                     <ActionBtn code="KeyF" icon={Feather} color="#a855f7" className="w-12 h-12 md:w-14 md:h-14" />
                </div>
            </div>
        </div>
    </div>
  );
};

// Extracted components to prevent re-creation on render
const MenuScreen = ({ 
  setScreen, 
  isMuted, 
  toggleMute, 
  aiPrompt, 
  setAiPrompt, 
  handleLevelGen,
  difficulty,
  setDifficulty,
  biome,
  setBiome
}: {
  setScreen: (s: ScreenState) => void,
  isMuted: boolean,
  toggleMute: () => void,
  aiPrompt: string,
  setAiPrompt: (s: string) => void,
  handleLevelGen: () => void,
  difficulty: Difficulty,
  setDifficulty: (d: Difficulty) => void,
  biome: BiomeType,
  setBiome: (b: BiomeType) => void
}) => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 animate-fade-in relative">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://picsum.photos/id/237/200/300')] bg-repeat bg-cover filter blur-sm"></div>
        
        <div className="z-10 text-center">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 drop-shadow-[0_5px_0_#fff]">
                我的世界-马里奥
            </h1>
            <p className="text-2xl text-gray-300 mt-2 tracking-widest uppercase">世界版</p>
        </div>

        <div className="z-10 flex flex-col space-y-4 w-80">
            {/* Difficulty Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">难度:</label>
                <div className="flex justify-between bg-gray-800 p-2 rounded border-2 border-gray-600">
                     <button 
                        onClick={() => setDifficulty('EASY')}
                        className={`flex-1 text-sm py-1 ${difficulty === 'EASY' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                        简单
                     </button>
                     <button 
                        onClick={() => setDifficulty('NORMAL')}
                        className={`flex-1 text-sm py-1 ${difficulty === 'NORMAL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                        普通
                     </button>
                     <button 
                        onClick={() => setDifficulty('HARD')}
                        className={`flex-1 text-sm py-1 ${difficulty === 'HARD' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                        困难
                     </button>
                </div>
            </div>
            
            {/* Biome Selector */}
             <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">生物群系:</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-800 p-2 rounded border-2 border-gray-600">
                     {[
                         {id: 'PLAINS', name: '平原'},
                         {id: 'DESERT', name: '沙漠'},
                         {id: 'SNOW', name: '雪地'},
                         {id: 'NETHER', name: '地狱'},
                         {id: 'THE_END', name: '末地'},
                     ].map((b) => (
                         <button 
                            key={b.id}
                            onClick={() => setBiome(b.id as BiomeType)}
                            className={`text-xs py-2 rounded ${biome === b.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                         >
                            {b.name}
                         </button>
                     ))}
                </div>
            </div>

            <button 
                onClick={() => setScreen('CHARACTER_SELECT')}
                className="mc-btn group relative px-8 py-4 bg-gray-600 border-b-4 border-gray-800 active:border-b-0 hover:bg-gray-500 text-white font-bold text-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
                <Play className="w-6 h-6" /> 开始游戏
            </button>
            
            <div className="bg-gray-800 p-4 border-2 border-gray-600 rounded">
                <label className="text-sm text-gray-400 mb-2 block">生成AI世界:</label>
                <input 
                    type="text" 
                    placeholder="例如：蘑菇岛"
                    className="w-full bg-gray-900 border border-gray-700 p-2 text-white mb-2 text-sm focus:outline-none focus:border-green-500"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button 
                    onClick={handleLevelGen}
                    className="w-full mc-btn py-2 bg-purple-700 border-b-4 border-purple-900 active:border-b-0 text-white text-sm flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> 生成并游玩
                </button>
            </div>
        </div>
        
        <button 
            onClick={toggleMute}
            className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 z-50"
        >
            {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
    </div>
);

const CharacterSelectScreen = ({
  character,
  setCharacter,
  setScreen,
  startGame
}: {
  character: CharacterType,
  setCharacter: (c: CharacterType) => void,
  setScreen: (s: ScreenState) => void,
  startGame: () => void
}) => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-gray-900">
        <h2 className="text-4xl text-white mb-8">选择角色</h2>
        <div className="flex flex-wrap justify-center gap-8">
            {CHARACTERS.map(char => (
                <div 
                    key={char.id}
                    onClick={() => { setCharacter(char.id as CharacterType); }}
                    className={`cursor-pointer group p-6 border-4 transition-all transform hover:scale-105 ${character === char.id ? 'border-green-500 bg-gray-800' : 'border-gray-700 bg-gray-900/50'}`}
                >
                    {/* Realistic Pixel Face Grid */}
                    <div className="w-32 h-32 mx-auto mb-6 relative bg-gray-900 shadow-xl">
                        {/* Face Grid - 8x8 */}
                        <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-4 border-black/20">
                            {char.face?.map((row, rIndex) => 
                                row.map((col, cIndex) => (
                                    <div key={`${rIndex}-${cIndex}`} style={{ backgroundColor: col }} className="w-full h-full" />
                                ))
                            )}
                        </div>
                    </div>
                    
                    <h3 className="text-3xl text-center font-bold mb-2 tracking-wide">{char.name}</h3>
                    <p className="text-sm text-gray-400 text-center font-sans">{char.desc}</p>
                </div>
            ))}
        </div>
        <div className="flex gap-4 mt-8">
            <button 
                onClick={() => setScreen('MENU')}
                className="mc-btn px-6 py-2 bg-red-700 border-b-4 border-red-900 text-white"
            >
                返回
            </button>
            <button 
                onClick={startGame}
                className="mc-btn px-6 py-2 bg-green-600 border-b-4 border-green-800 text-white animate-pulse"
            >
                确认
            </button>
        </div>
    </div>
);

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [character, setCharacter] = useState<CharacterType>(CharacterType.STEVE);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [biome, setBiome] = useState<BiomeType>('PLAINS');
  const [currentLevelMap, setCurrentLevelMap] = useState<string[]>(DEFAULT_LEVEL_MAP);
  const [isMuted, setIsMuted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const startGame = () => {
    if (!aiPrompt && screen !== 'GENERATING_LEVEL') {
        const randomMap = generateProceduralLevel(difficulty, biome);
        setCurrentLevelMap(randomMap);
    }
    
    setScore(0);
    setScreen('GAME');
    audioController.startBGM();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioController.toggleMute();
  };

  const handleLevelGen = async () => {
    setScreen('GENERATING_LEVEL');
    const newMap = await generateLevelWithAI(aiPrompt || "经典我的世界");
    setCurrentLevelMap(newMap);
    startGame();
  };

  return (
    <div className="min-h-screen bg-gray-900 font-vt323">
        {screen === 'MENU' && (
            <MenuScreen 
                setScreen={setScreen}
                isMuted={isMuted}
                toggleMute={toggleMute}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                handleLevelGen={handleLevelGen}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                biome={biome}
                setBiome={setBiome}
            />
        )}
        
        {screen === 'CHARACTER_SELECT' && (
            <CharacterSelectScreen 
                character={character}
                setCharacter={setCharacter}
                setScreen={setScreen}
                startGame={startGame}
            />
        )}
        
        {screen === 'GENERATING_LEVEL' && (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
                <Sparkles className="w-16 h-16 text-purple-500 animate-spin mb-4" />
                <h2 className="text-2xl">正在构建世界...</h2>
                <p className="text-gray-400">Gemini 正在排列方块...</p>
            </div>
        )}

        {screen === 'GAME' && (
            <div className="relative w-full h-screen bg-gray-800 flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 text-white text-2xl flex gap-4 z-20">
                    <span className="flex items-center gap-2"><Trophy className="text-yellow-400"/> {score}</span>
                </div>
                <div className="absolute top-4 right-4 z-20">
                     <button onClick={() => { setScreen('MENU'); audioController.stopBGM(); }} className="px-4 py-2 bg-red-600 text-white text-xs border-b-2 border-red-800 active:border-b-0 rounded">退出</button>
                </div>

                {/* Game Canvas container */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <GameCanvas 
                        levelRaw={currentLevelMap} 
                        character={character}
                        difficulty={difficulty}
                        biome={biome}
                        onGameOver={() => setScreen('GAME_OVER')}
                        onWin={(finalScore) => { setScore(finalScore); setScreen('WIN'); audioController.playSFX('WIN'); }}
                        onAddScore={(amt) => setScore(s => s + amt)}
                        score={score}
                    />
                </div>
                
                {/* Mobile Controls Overlay */}
                <MobileControls />

                {/* Desktop Hint (Hidden on mobile) */}
                <div className="absolute bottom-2 text-gray-500 text-sm hidden md:block">
                    操作说明：WASD 移动/跳跃 | 长按 J 开火 | K 挖掘 | <span className="text-yellow-400">F 切换飞行模式</span>
                </div>
            </div>
        )}

        {screen === 'GAME_OVER' && (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 text-white space-y-6">
                <Skull className="w-24 h-24 text-red-600 mb-4 animate-bounce" />
                <h2 className="text-6xl text-red-500 font-bold">游戏结束</h2>
                <p className="text-2xl">得分: {score}</p>
                <button 
                    onClick={() => setScreen('MENU')}
                    className="mc-btn px-8 py-3 bg-white text-black font-bold border-b-4 border-gray-400 mt-8"
                >
                    重生
                </button>
            </div>
        )}

        {screen === 'WIN' && (
            <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-900/90 text-white space-y-6">
                <Trophy className="w-24 h-24 text-yellow-400 mb-4 animate-pulse" />
                <h2 className="text-6xl text-yellow-400 font-bold">关卡完成！</h2>
                <p className="text-2xl">最终得分: {score}</p>
                <button 
                    onClick={() => setScreen('MENU')}
                    className="mc-btn px-8 py-3 bg-green-600 border-b-4 border-green-800 mt-8"
                >
                    下一关
                </button>
            </div>
        )}
    </div>
  );
}