import React, { useState, useEffect } from 'react';
import { ScreenState, CharacterType, LevelData, Difficulty, BiomeType } from './types';
import { DEFAULT_LEVEL_MAP, CHARACTERS } from './constants';
import GameCanvas from './components/GameCanvas';
import { audioController } from './utils/audio';
import { generateLevelWithAI } from './services/geminiService';
import { generateProceduralLevel } from './utils/proceduralGen';
import { Gamepad2, Skull, Trophy, Play, Settings, Sparkles, Volume2, VolumeX, Swords, Shield, Skull as SkullIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pickaxe, Feather, Target, Map, Smartphone, Monitor, RotateCw, Ruler } from 'lucide-react';

// Orientation Warning Component - ONLY for Game State
const OrientationWarning = () => (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in touch-none">
        <div className="animate-bounce mb-6">
            <RotateCw className="w-20 h-20 text-yellow-400" />
        </div>
        <h2 className="text-4xl font-bold mb-4 text-yellow-400">请旋转手机</h2>
        <p className="text-gray-300 text-xl">战斗模式需要横屏操作</p>
        <div className="mt-8 w-16 h-24 border-4 border-gray-600 rounded-lg animate-[spin_2s_ease-in-out_infinite] opacity-50"></div>
    </div>
);

// Mobile Controls Overlay
const MobileControls = () => {
  const dispatchKey = (code: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(new KeyboardEvent(type, { code: code, bubbles: true }));
  };

  const handleStart = (code: string, e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to avoid context menu / selection on long press
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
        className={`w-12 h-12 md:w-14 md:h-14 bg-gray-800/80 rounded-lg border-2 border-gray-600 active:bg-gray-600 active:border-gray-400 flex items-center justify-center text-white transition-colors ${className}`}
        // Touch Events
        onTouchStart={(e) => handleStart(code, e)}
        onTouchEnd={(e) => handleEnd(code, e)}
        onTouchCancel={(e) => handleEnd(code, e)} // Crucial: Handles interruptions like alerts/scrolls
        // Mouse Events (for hybrid devices/testing)
        onMouseDown={(e) => handleStart(code, e)}
        onMouseUp={(e) => handleEnd(code, e)}
        onMouseLeave={(e) => handleEnd(code, e)}
        // Prevent Context Menu (Right click / Long press)
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
        <Icon size={24} className="md:w-8 md:h-8" />
    </button>
  );

  const ActionBtn = ({ code, label, color, icon: Icon, className }: any) => (
      <button
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-black/30 shadow-xl active:scale-95 active:brightness-110 transition-all flex flex-col items-center justify-center text-white font-bold ${className}`}
        style={{ backgroundColor: color, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        // Touch Events
        onTouchStart={(e) => handleStart(code, e)}
        onTouchEnd={(e) => handleEnd(code, e)}
        onTouchCancel={(e) => handleEnd(code, e)} // Crucial: Handles interruptions like alerts/scrolls
        // Mouse Events
        onMouseDown={(e) => handleStart(code, e)}
        onMouseUp={(e) => handleEnd(code, e)}
        onMouseLeave={(e) => handleEnd(code, e)}
        // Prevent Context Menu
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
          {Icon && <Icon size={20} className="md:w-6 md:h-6 mb-1" strokeWidth={2.5} />}
          <span className="text-[10px] md:text-xs leading-none">{label}</span>
      </button>
  );

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end pb-4 px-6 md:pb-6 md:px-10 select-none touch-none">
        <div className="flex justify-between items-end w-full pointer-events-auto">
            {/* D-Pad */}
            <div className="relative w-36 h-36 md:w-48 md:h-48 mb-2">
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

            {/* Action Buttons - Spaced out better */}
            <div className="relative w-40 h-40 md:w-56 md:h-56">
                {/* Jump (Space) - Bottom Right */}
                <div className="absolute bottom-0 right-0">
                    <ActionBtn code="Space" icon={ArrowUp} label="跳跃" color="#22c55e" className="scale-110" />
                </div>
                {/* Attack (J) - Left of Jump */}
                <div className="absolute bottom-0 right-[65px] md:right-[85px]">
                    <ActionBtn code="KeyJ" icon={Target} label="攻击" color="#ef4444" className="" />
                </div>
                {/* Dig (K) - Above Jump */}
                 <div className="absolute bottom-[65px] md:bottom-[85px] right-0">
                    <ActionBtn code="KeyK" icon={Pickaxe} label="挖掘" color="#eab308" className="w-12 h-12 md:w-14 md:h-14" />
                </div>
                {/* Fly (F) - Top Left of cluster */}
                <div className="absolute top-0 left-0">
                     <ActionBtn code="KeyF" icon={Feather} label="飞行" color="#a855f7" className="w-12 h-12 md:w-14 md:h-14" />
                </div>
            </div>
        </div>
    </div>
  );
};

// Menu Screen - Designed for Vertical Scrolling (Portrait Friendly)
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
  setBiome,
  lengthMultiplier,
  setLengthMultiplier,
  isMobileMode,
  toggleMobileMode
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
  setBiome: (b: BiomeType) => void,
  lengthMultiplier: number,
  setLengthMultiplier: (n: number) => void,
  isMobileMode: boolean,
  toggleMobileMode: () => void
}) => (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y relative flex flex-col items-center py-12 px-6">
        {/* Background Overlay */}
        <div className="fixed inset-0 z-0 opacity-20 bg-[url('https://picsum.photos/id/237/200/300')] bg-repeat bg-cover filter blur-sm pointer-events-none"></div>
        
        {/* Header */}
        <div className="z-10 text-center mb-8 shrink-0">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 drop-shadow-[0_5px_0_#fff]">
                我的世界<br/>马里奥
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mt-4 tracking-widest uppercase bg-gray-900/50 inline-block px-4 py-1 rounded-full">冒险模式</p>
        </div>

        {/* Main Menu Container */}
        <div className="z-10 w-full max-w-md flex flex-col gap-6 mb-12">
            
            {/* Start Game Button (Primary) */}
            <button 
                onClick={() => setScreen('CHARACTER_SELECT')}
                className="mc-btn w-full py-5 bg-green-600 border-b-4 border-green-800 active:border-b-0 hover:bg-green-500 text-white font-bold text-2xl rounded-xl flex items-center justify-center gap-3 shadow-lg"
            >
                <Play className="w-8 h-8 fill-current" /> 开始游戏
            </button>

            {/* Difficulty Selector */}
            <div className="bg-gray-800/90 p-4 rounded-xl border-2 border-gray-600 backdrop-blur-sm">
                <label className="text-gray-400 text-sm mb-2 block uppercase font-bold tracking-wider">游戏难度</label>
                <div className="flex gap-2">
                     {['EASY', 'NORMAL', 'HARD'].map(d => (
                         <button 
                            key={d}
                            onClick={() => setDifficulty(d as Difficulty)}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                                difficulty === d 
                                ? (d === 'EASY' ? 'bg-green-600 border-green-800 text-white' : d === 'NORMAL' ? 'bg-blue-600 border-blue-800 text-white' : 'bg-red-600 border-red-800 text-white') 
                                : 'bg-gray-700 border-gray-900 text-gray-400'
                            }`}
                         >
                            {d === 'EASY' ? '简单' : d === 'NORMAL' ? '普通' : '困难'}
                         </button>
                     ))}
                </div>
            </div>
            
            {/* Biome Selector */}
             <div className="bg-gray-800/90 p-4 rounded-xl border-2 border-gray-600 backdrop-blur-sm">
                <label className="text-gray-400 text-sm mb-2 block uppercase font-bold tracking-wider">选择生物群系</label>
                <div className="grid grid-cols-3 gap-2">
                     {[
                         {id: 'PLAINS', name: '平原', color: 'bg-green-600'},
                         {id: 'DESERT', name: '沙漠', color: 'bg-yellow-600'},
                         {id: 'SNOW', name: '雪地', color: 'bg-cyan-600'},
                         {id: 'NETHER', name: '地狱', color: 'bg-red-700'},
                         {id: 'THE_END', name: '末地', color: 'bg-purple-800'},
                     ].map((b) => (
                         <button 
                            key={b.id}
                            onClick={() => setBiome(b.id as BiomeType)}
                            className={`py-2 rounded-lg text-sm font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                                biome === b.id 
                                ? `${b.color} border-black/30 text-white shadow-md` 
                                : 'bg-gray-700 border-gray-900 text-gray-400'
                            }`}
                         >
                            {b.name}
                         </button>
                     ))}
                </div>
            </div>

            {/* Map Length Slider */}
            <div className="bg-gray-800/90 p-4 rounded-xl border-2 border-gray-600 backdrop-blur-sm">
                <label className="text-gray-400 text-sm mb-3 block uppercase font-bold tracking-wider flex justify-between">
                    <span className="flex items-center gap-2"><Ruler size={16}/> 地图长度</span>
                    <span className="text-yellow-400">{lengthMultiplier}x ({lengthMultiplier * 150} 格)</span>
                </label>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">短</span>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        value={lengthMultiplier} 
                        onChange={(e) => setLengthMultiplier(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 border border-gray-600"
                    />
                    <span className="text-xs text-gray-500">长</span>
                </div>
            </div>

            {/* AI Generator */}
            <div className="bg-purple-900/40 p-4 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm">
                <label className="text-purple-300 text-sm mb-2 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI 世界生成器
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="输入主题 (例如: 赛博朋克)"
                        className="flex-1 bg-gray-900/80 border-2 border-purple-900/50 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 placeholder-gray-600"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button 
                        onClick={handleLevelGen}
                        className="w-12 bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-800 active:border-b-0 rounded-lg flex items-center justify-center text-white"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Top Right Controls */}
        <div className="fixed top-4 right-4 flex gap-3 z-50">
             <button 
                onClick={toggleMobileMode}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 border-2 border-gray-600 shadow-lg active:scale-95 transition-transform"
                title={isMobileMode ? "切换到电脑模式" : "切换到手机模式"}
            >
                {isMobileMode ? <Smartphone className="text-green-400 w-5 h-5" /> : <Monitor className="text-blue-400 w-5 h-5" />}
            </button>
            <button 
                onClick={toggleMute}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 border-2 border-gray-600 shadow-lg active:scale-95 transition-transform"
            >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-gray-200" />}
            </button>
        </div>
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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y flex flex-col items-center py-8 bg-gray-900">
        <h2 className="text-4xl text-white mb-8 font-bold shrink-0 drop-shadow-md">选择角色</h2>
        
        {/* Grid for Characters - Vertical scroll friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 w-full max-w-3xl mb-32">
            {CHARACTERS.map(char => (
                <div 
                    key={char.id}
                    onClick={() => { setCharacter(char.id as CharacterType); }}
                    className={`cursor-pointer group flex flex-col items-center p-4 rounded-xl border-4 transition-all active:scale-95 ${
                        character === char.id 
                        ? 'border-green-500 bg-gray-800 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                        : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800/60'
                    }`}
                >
                    {/* Character Face */}
                    <div className="w-20 h-20 mb-3 relative bg-black/20 shadow-inner rounded-sm overflow-hidden">
                        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                            {char.face?.map((row, rIndex) => 
                                row.map((col, cIndex) => (
                                    <div key={`${rIndex}-${cIndex}`} style={{ backgroundColor: col }} className="w-full h-full" />
                                ))
                            )}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1">{char.name}</h3>
                    <p className="text-xs text-gray-400">{char.desc}</p>
                </div>
            ))}
        </div>
        
        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900/95 border-t border-gray-700 backdrop-blur-md z-20 flex gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <button 
                onClick={() => setScreen('MENU')}
                className="flex-1 mc-btn py-4 bg-gray-700 border-b-4 border-gray-900 text-white rounded-xl font-bold text-lg"
            >
                返回
            </button>
            <button 
                onClick={startGame}
                className="flex-[2] mc-btn py-4 bg-green-600 border-b-4 border-green-800 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 animate-pulse"
            >
                确认出发 <ArrowRight className="w-5 h-5" />
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
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [lengthMultiplier, setLengthMultiplier] = useState(1);

  useEffect(() => {
    // Detect mobile device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobileMode(isTouch);
    
    // Check orientation
    const checkOrientation = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const toggleMobileMode = () => {
    setIsMobileMode(!isMobileMode);
  };

  const startGame = () => {
    if (!aiPrompt && screen !== 'GENERATING_LEVEL') {
        const randomMap = generateProceduralLevel(difficulty, biome, lengthMultiplier);
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

  // Determine when to show orientation warning:
  // Only if on mobile, currently in portrait, AND in a game-active state.
  const showOrientationWarning = isMobileMode && isPortrait && (screen === 'GAME' || screen === 'WIN' || screen === 'GAME_OVER');

  return (
    <div className="w-full h-full bg-gray-900 font-vt323 overflow-hidden fixed inset-0">
        {showOrientationWarning && <OrientationWarning />}

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
                lengthMultiplier={lengthMultiplier}
                setLengthMultiplier={setLengthMultiplier}
                isMobileMode={isMobileMode}
                toggleMobileMode={toggleMobileMode}
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
            <div className="relative w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden touch-none select-none">
                <div className="absolute top-4 left-4 text-white text-2xl flex gap-4 z-20">
                    <span className="flex items-center gap-2"><Trophy className="text-yellow-400"/> {score}</span>
                </div>
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <button 
                        onClick={toggleMobileMode}
                        className="p-2 bg-gray-800 rounded text-white text-xs border-b-2 border-gray-600 active:border-b-0 shadow-lg"
                        title={isMobileMode ? "切换到电脑模式" : "切换到手机模式"}
                    >
                        {isMobileMode ? <Smartphone size={16} /> : <Monitor size={16} />}
                     </button>
                     <button onClick={() => { setScreen('MENU'); audioController.stopBGM(); }} className="px-4 py-2 bg-red-600 text-white text-xs border-b-2 border-red-800 active:border-b-0 rounded shadow-lg">退出</button>
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
                
                {/* Mobile Controls Overlay - Conditional rendering */}
                {isMobileMode && <MobileControls />}

                {/* Desktop Hint (Hidden if mobile mode) */}
                {!isMobileMode && (
                    <div className="absolute bottom-2 text-gray-500 text-sm hidden md:block">
                        操作说明：WASD 移动/跳跃 | 长按 J 开火 | K 挖掘 | <span className="text-yellow-400">F 切换飞行模式</span>
                    </div>
                )}
            </div>
        )}

        {screen === 'GAME_OVER' && (
            <div className="flex flex-col items-center justify-center w-full h-full bg-black/90 text-white space-y-6 z-50 absolute inset-0">
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
            <div className="flex flex-col items-center justify-center w-full h-full bg-yellow-900/90 text-white space-y-6 z-50 absolute inset-0">
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