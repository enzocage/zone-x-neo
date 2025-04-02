/**
 * Zone X - Konfigurationsvariablen
 */
const CONFIG = {
    // Spielfeld
    GRID_WIDTH: 64,
    GRID_HEIGHT: 32,
    TILE_SIZE: 1,
    
    // Spielsteuerung
    USE_FALLBACK_LEVEL: true, // Standardmäßig Fallback-Level verwenden
    
    // Kamera
    CAMERA_FOV: 75,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_POSITION: { x: 0, y: 0, z: 10 },
    
    // Spieler
    PLAYER_SPEED: 2,
    PLAYER_INITIAL_LIVES: 5,
    PLAYER_INITIAL_BLOCKS: 15,
    
    // Gegner
    ENEMY_SPEED: 1.2,
    
    // Spielelemente
    PLUTONIUM_COUNT: 5,
    BARREL_COUNT: 3,
    PLUTONIUM_TIMER: 20, // Sekunden
    
    // Farben
    COLORS: {
        PLAYER: 0x00ff00,
        ENEMY: 0xff0000,
        WALL: 0x888888,
        PLUTONIUM: 0xffff00,
        BARREL: 0x8B4513,
        BLOCK: 0x00aaff,
        EXIT: 0xff00ff,
        START: 0x0000ff,
        BACKGROUND: 0x000000
    },
    
    // Level
    LEVEL_PATH: 'levels/',
    
    // Fallback-Level direkt im Code definiert (für den Fall, dass CSV-Laden fehlschlägt)
    // Das Level ist ein 20x20 Grid mit Wänden, Gegnern, Plutonium, Tonnen und Exit
    FALLBACK_LEVEL: [
        "████████████████████",
        "█O                 █",
        "█  ███████████    █",
        "█  █         █    █",
        "█  █  r      █    █",
        "█  █    ████ █    █",
        "█  █    █  █ █    █",
        "█  ███  █  █X█    █",
        "█    █  ████ █    █",
        "█    █       █    █",
        "█    █████████    █",
        "█                 █",
        "█ █████████████   █",
        "█ █X            █ █",
        "█ █        r    █ █",
        "█ █  █████      █ █",
        "█ █  █K  █      █ █",
        "█ █  ████       █ █",
        "█A█              █ █",
        "████████████████████"
    ],
    
    // Symbole in CSV-Dateien
    SYMBOLS: {
        WALL: '█',
        PLAYER: 'O',
        ENEMY_RIGHT: 'r',
        ENEMY_LEFT: 'l',
        ENEMY_UP: 'u',
        ENEMY_DOWN: 'd',
        ENEMY_RIGHT_SLASH: 'r/',
        ENEMY_LEFT_SLASH: 'l/',
        BARREL: 'K',
        PLUTONIUM: 'X',
        BLOCK: 'M',
        EXIT: 'A',
        EMPTY: ' ',
        UNKNOWN: '?',
        DONUT: 'ᴗ',
        DIRECTION_RIGHT: 'R',
        DIRECTION_LEFT: 'L/',
        DIRECTION_UP: 'U',
        DIRECTION_DOWN: 'D',
        DIRECTION_IDLE: 'I'
    }
}; 