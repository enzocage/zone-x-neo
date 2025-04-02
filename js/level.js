/**
 * Zone X - Level-Manager
 */
class Level {
    constructor(game) {
        this.game = game;
        this.grid = Array(CONFIG.GRID_HEIGHT).fill().map(() => Array(CONFIG.GRID_WIDTH).fill(null));
        this.currentLevel = 1;
        this.totalLevels = 11;
        this.walls = [];
        this.enemies = [];
        this.plutonium = [];
        this.barrels = [];
        this.blocks = [];
        this.exit = null;
        this.startPosition = { x: 0, y: 0 };
    }
    
    /**
     * Lädt ein Level aus einer CSV-Datei
     * @param {number} levelNumber Level-Nummer (1-11)
     */
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        // Test mit direktem Dateinamen ohne URL-Encoding
        const levelFile = `Zone X Levels - Zone 1-${levelNumber}.csv`;
        const levelPath = `${CONFIG.LEVEL_PATH}${levelFile}`;
        
        console.log("Versuche Level zu laden:", levelPath);
        
        // Zurücksetzen des Levels
        this.resetLevel();
        
        // Versuche erst mit URL-Encoding zu laden
        Utils.loadCSV(`${CONFIG.LEVEL_PATH}${encodeURIComponent(levelFile)}`)
            .then(grid => {
                console.log("Level geladen (mit URL-Encoding), Zeilen:", grid.length);
                this.parseLevel(grid);
                this.game.initLevel();
            })
            .catch(error1 => {
                console.error('Fehler beim Laden des Levels mit URL-Encoding:', error1);
                console.log("Versuche Level direkt zu laden:", levelPath);
                
                // Versuche ohne URL-Encoding zu laden
                Utils.loadCSV(levelPath)
                    .then(grid => {
                        console.log("Level geladen (direkter Pfad), Zeilen:", grid.length);
                        this.parseLevel(grid);
                        this.game.initLevel();
                    })
                    .catch(error2 => {
                        console.error('Fehler beim direkten Laden des Levels:', error2);
                        
                        // Versuche mit Level-Dateinamen ohne Leerzeichen
                        const simpleFileName = `level-${levelNumber}.csv`;
                        console.log("Versuche vereinfachten Dateinamen:", simpleFileName);
                        
                        Utils.loadCSV(`${CONFIG.LEVEL_PATH}${simpleFileName}`)
                            .then(grid => {
                                console.log("Level mit vereinfachtem Namen geladen, Zeilen:", grid.length);
                                this.parseLevel(grid);
                                this.game.initLevel();
                            })
                            .catch(error3 => {
                                console.error('Alle Ladeversuche fehlgeschlagen:', error3);
                                alert('Fehler beim Laden des Levels. Lade Fallback-Level.');
                                this.loadFallbackLevel();
                            });
                    });
            });
    }
    
    /**
     * Lädt ein einfaches Fallback-Level, falls das CSV-Laden fehlschlägt
     */
    loadFallbackLevel() {
        console.log('Lade eingebettetes Fallback-Level...');
        
        // Zurücksetzen des Levels
        this.resetLevel();
        
        // Wenn ein eingebettetes Level in CONFIG definiert ist, verwende dieses
        if (CONFIG.FALLBACK_LEVEL && CONFIG.FALLBACK_LEVEL.length > 0) {
            console.log('Verwende vordefiniertes Fallback-Level');
            
            const levelData = CONFIG.FALLBACK_LEVEL;
            const height = levelData.length;
            const width = levelData[0].length;
            
            for (let y = 0; y < height; y++) {
                const row = levelData[y];
                for (let x = 0; x < width; x++) {
                    if (x >= row.length) continue;
                    
                    const cell = row[x];
                    
                    switch (cell) {
                        case CONFIG.SYMBOLS.WALL:
                            this.walls.push({ x, y });
                            this.grid[y][x] = 'wall';
                            break;
                        case CONFIG.SYMBOLS.PLAYER:
                            this.startPosition = { x, y };
                            this.grid[y][x] = 'empty';
                            break;
                        case CONFIG.SYMBOLS.ENEMY_RIGHT:
                            this.enemies.push({ x, y, direction: { x: 1, y: 0 } });
                            this.grid[y][x] = 'enemy';
                            break;
                        case CONFIG.SYMBOLS.ENEMY_LEFT:
                            this.enemies.push({ x, y, direction: { x: -1, y: 0 } });
                            this.grid[y][x] = 'enemy';
                            break;
                        case CONFIG.SYMBOLS.PLUTONIUM:
                            this.plutonium.push({ x, y });
                            this.grid[y][x] = 'plutonium';
                            break;
                        case CONFIG.SYMBOLS.BARREL:
                            this.barrels.push({ x, y });
                            this.grid[y][x] = 'barrel';
                            break;
                        case CONFIG.SYMBOLS.EXIT:
                            this.exit = { x, y };
                            this.grid[y][x] = 'exit';
                            break;
                        default:
                            this.grid[y][x] = 'empty';
                            break;
                    }
                }
            }
        } else {
            console.log('Erstelle generiertes Fallback-Level');
            
            // Alternativ: Generiere ein einfaches Level
            const gridSize = 20; // Kleineres Grid für das Fallback-Level
            
            // Erstelle Wände am Rand
            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1) {
                        this.walls.push({ x, y });
                        this.grid[y][x] = 'wall';
                    }
                }
            }
            
            // Spieler-Startposition
            this.startPosition = { x: 2, y: 2 };
            
            // Ein paar Gegner
            this.enemies.push({ x: 5, y: 5, direction: { x: 1, y: 0 } });
            this.enemies.push({ x: 10, y: 10, direction: { x: 0, y: 1 } });
            this.grid[5][5] = 'enemy';
            this.grid[10][10] = 'enemy';
            
            // Plutonium
            this.plutonium.push({ x: 15, y: 5 });
            this.grid[5][15] = 'plutonium';
            
            // Tonne
            this.barrels.push({ x: 5, y: 15 });
            this.grid[15][5] = 'barrel';
            
            // Exit
            this.exit = { x: 15, y: 15 };
            this.grid[15][15] = 'exit';
            
            // Block
            this.blocks.push({ x: 8, y: 8 });
            this.grid[8][8] = 'block';
        }
        
        // Initialisiere das Level
        this.game.initLevel();
    }
    
    /**
     * Zurücksetzen des Levels
     */
    resetLevel() {
        this.grid = Array(CONFIG.GRID_HEIGHT).fill().map(() => Array(CONFIG.GRID_WIDTH).fill(null));
        this.walls = [];
        this.enemies = [];
        this.plutonium = [];
        this.barrels = [];
        this.blocks = [];
        this.exit = null;
        
        // Entfernt alle 3D-Objekte
        if (this.game.scene) {
            const objectsToRemove = [];
            this.game.scene.traverse((object) => {
                if (object.userData.type !== 'camera') {
                    objectsToRemove.push(object);
                }
            });
            
            objectsToRemove.forEach(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
                this.game.scene.remove(object);
            });
        }
    }
    
    /**
     * Parst den CSV-Inhalt und erstellt das Level
     * @param {Array} grid CSV-Inhalt als Array
     */
    parseLevel(grid) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const cell = grid[y][x];
                
                switch (cell) {
                    case CONFIG.SYMBOLS.WALL:
                        this.grid[y][x] = 'wall';
                        this.walls.push({ x, y });
                        break;
                    case CONFIG.SYMBOLS.PLAYER:
                        this.grid[y][x] = 'empty';
                        this.startPosition = { x, y };
                        break;
                    case CONFIG.SYMBOLS.ENEMY_RIGHT:
                    case CONFIG.SYMBOLS.ENEMY_LEFT:
                    case CONFIG.SYMBOLS.ENEMY_UP:
                    case CONFIG.SYMBOLS.ENEMY_DOWN:
                    case CONFIG.SYMBOLS.ENEMY_RIGHT_SLASH:
                    case CONFIG.SYMBOLS.ENEMY_LEFT_SLASH:
                        this.grid[y][x] = 'enemy';
                        this.enemies.push({ 
                            x, 
                            y, 
                            direction: this.getEnemyDirection(cell) 
                        });
                        break;
                    case CONFIG.SYMBOLS.PLUTONIUM:
                        this.grid[y][x] = 'plutonium';
                        this.plutonium.push({ x, y });
                        break;
                    case CONFIG.SYMBOLS.BARREL:
                        this.grid[y][x] = 'barrel';
                        this.barrels.push({ x, y });
                        break;
                    case CONFIG.SYMBOLS.BLOCK:
                        this.grid[y][x] = 'block';
                        this.blocks.push({ x, y });
                        break;
                    case CONFIG.SYMBOLS.EXIT:
                        this.grid[y][x] = 'exit';
                        this.exit = { x, y };
                        break;
                    case CONFIG.SYMBOLS.DIRECTION_RIGHT:
                    case CONFIG.SYMBOLS.DIRECTION_LEFT:
                    case CONFIG.SYMBOLS.DIRECTION_UP:
                    case CONFIG.SYMBOLS.DIRECTION_DOWN:
                    case CONFIG.SYMBOLS.DIRECTION_IDLE:
                    case CONFIG.SYMBOLS.UNKNOWN:
                    case CONFIG.SYMBOLS.DONUT:
                    case CONFIG.SYMBOLS.EMPTY:
                    default:
                        this.grid[y][x] = 'empty';
                        break;
                }
            }
        }
    }
    
    /**
     * Ermittelt die Richtung eines Gegners anhand des Symbols
     * @param {string} symbol Gegner-Symbol
     * @returns {Object} Richtungsvektor {x, y}
     */
    getEnemyDirection(symbol) {
        switch (symbol) {
            case CONFIG.SYMBOLS.ENEMY_RIGHT:
            case CONFIG.SYMBOLS.ENEMY_RIGHT_SLASH:
                return { x: 1, y: 0 };
            case CONFIG.SYMBOLS.ENEMY_LEFT:
            case CONFIG.SYMBOLS.ENEMY_LEFT_SLASH:
                return { x: -1, y: 0 };
            case CONFIG.SYMBOLS.ENEMY_UP:
                return { x: 0, y: -1 };
            case CONFIG.SYMBOLS.ENEMY_DOWN:
                return { x: 0, y: 1 };
            default:
                return { x: 1, y: 0 }; // Standardrichtung rechts
        }
    }
    
    /**
     * Prüft, ob an einer Position eine Wand ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn eine Wand vorhanden ist
     */
    isWall(x, y) {
        if (!Utils.isInBounds(x, y)) return true;
        return this.grid[y][x] === 'wall';
    }
    
    /**
     * Prüft, ob an einer Position ein Gegner ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn ein Gegner vorhanden ist
     */
    isEnemy(x, y) {
        if (!Utils.isInBounds(x, y)) return false;
        return this.grid[y][x] === 'enemy';
    }
    
    /**
     * Prüft, ob an einer Position Plutonium ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn Plutonium vorhanden ist
     */
    isPlutonium(x, y) {
        if (!Utils.isInBounds(x, y)) return false;
        return this.grid[y][x] === 'plutonium';
    }
    
    /**
     * Prüft, ob an einer Position eine Tonne ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn eine Tonne vorhanden ist
     */
    isBarrel(x, y) {
        if (!Utils.isInBounds(x, y)) return false;
        return this.grid[y][x] === 'barrel';
    }
    
    /**
     * Prüft, ob an einer Position ein Block ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn ein Block vorhanden ist
     */
    isBlock(x, y) {
        if (!Utils.isInBounds(x, y)) return false;
        return this.grid[y][x] === 'block';
    }
    
    /**
     * Prüft, ob an einer Position der Ausgang ist
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn der Ausgang vorhanden ist
     */
    isExit(x, y) {
        if (!Utils.isInBounds(x, y)) return false;
        return this.grid[y][x] === 'exit';
    }
    
    /**
     * Ändert den Typ einer Zelle im Grid
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @param {string} type Neuer Typ der Zelle
     */
    setCell(x, y, type) {
        if (Utils.isInBounds(x, y)) {
            this.grid[y][x] = type;
        }
    }
    
    /**
     * Entfernt Plutonium von einer Position
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    removePlutonium(x, y) {
        if (this.isPlutonium(x, y)) {
            this.plutonium = this.plutonium.filter(p => p.x !== x || p.y !== y);
            this.setCell(x, y, 'empty');
        }
    }
    
    /**
     * Entfernt einen Block von einer Position
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    removeBlock(x, y) {
        if (this.isBlock(x, y)) {
            this.blocks = this.blocks.filter(b => b.x !== x || b.y !== y);
            this.setCell(x, y, 'empty');
        }
    }
    
    /**
     * Fügt einen Block an einer Position hinzu
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    addBlock(x, y) {
        if (Utils.isInBounds(x, y) && this.grid[y][x] === 'empty') {
            this.blocks.push({ x, y });
            this.setCell(x, y, 'block');
            return true;
        }
        return false;
    }
    
    /**
     * Lädt das nächste Level
     */
    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.loadLevel(this.currentLevel + 1);
        } else {
            this.game.gameWon();
        }
    }
} 