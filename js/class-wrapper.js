/**
 * Klassenübergreifender Wrapper für Zone X
 * 
 * Dieses Skript stellt sicher, dass alle Klassen im globalen Scope verfügbar sind
 */
(function() {
    console.log("Class-Wrapper initialisiert");
    
    // Speichert geladene Klassen
    const loadedClasses = {};
    
    // Speichert Event-Listener für Klassen
    const classListeners = {};
    
    // Wartet auf alle benötigten Klassen
    const requiredClasses = ['Player', 'Enemy', 'Level', 'UI', 'Game'];
    
    // Minimale Implementierungen für jede Klasse
    const fallbackClasses = {
        Player: class Player {
            constructor(game, x, y) {
                this.game = game;
                this.gridX = x;
                this.gridY = y;
                this.x = x;
                this.y = y;
                this.lives = 5;
                this.mesh = null;
                console.warn("Fallback Player-Klasse initialisiert");
            }
            update() {}
            move() {}
        },
        
        Enemy: class Enemy {
            constructor(game, x, y, direction) {
                this.game = game;
                this.x = x;
                this.y = y;
                this.direction = direction || { x: 1, y: 0 };
                console.warn("Fallback Enemy-Klasse initialisiert");
            }
            update() {}
        },
        
        Level: class Level {
            constructor(game) {
                this.game = game;
                this.walls = [];
                this.enemies = [];
                this.plutonium = [];
                this.barrels = [];
                this.blocks = [];
                this.startPosition = { x: 2, y: 2 };
                console.warn("Fallback Level-Klasse initialisiert");
            }
            loadLevel() {}
            loadFallbackLevel() {
                // Erstelle Wände am Rand
                for (let x = 0; x < 20; x++) {
                    for (let y = 0; y < 20; y++) {
                        if (x === 0 || y === 0 || x === 19 || y === 19) {
                            this.walls.push({ x, y });
                        }
                    }
                }
                this.startPosition = { x: 2, y: 2 };
            }
        },
        
        UI: class UI {
            constructor(game) {
                this.game = game;
                console.warn("Fallback UI-Klasse initialisiert");
            }
            updateLivesCount() {}
            updateBlocksCount() {}
            updatePlutoniumCount() {}
            updateScore() {}
            startTimer() {}
            stopTimer() {}
        },
        
        Game: class Game {
            constructor() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 1000);
                this.renderer = null;
                this.level = null;
                this.player = null;
                console.warn("Fallback Game-Klasse initialisiert");
                
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    try {
                        this.renderer = new THREE.WebGLRenderer({ 
                            canvas: canvas,
                            antialias: true 
                        });
                    } catch (e) {
                        console.error("Renderer-Fehler:", e);
                    }
                }
            }
            init() {}
            update() {}
            render() {}
        }
    };
    
    // Funktion zum Extrahieren der Klassendefinition aus einer Datei
    function extractClass(className, fileContent) {
        // Versuche, die Klassendefinition zu finden
        const classRegex = new RegExp(`class\\s+${className}\\s*{[\\s\\S]*?}\\s*;?\\s*$`, 'm');
        const match = fileContent.match(classRegex);
        
        if (match) {
            return match[0];
        }
        
        // Wenn keine Klasse gefunden wurde, suche nach einer Funktionskonstruktor-Definition
        const constructorRegex = new RegExp(`function\\s+${className}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?}\\s*;?\\s*$`, 'm');
        const constructorMatch = fileContent.match(constructorRegex);
        
        if (constructorMatch) {
            return constructorMatch[0];
        }
        
        return null;
    }
    
    // Funktion zum Laden einer Klasse
    function loadClass(className) {
        if (loadedClasses[className]) {
            return Promise.resolve(loadedClasses[className]);
        }
        
        return new Promise((resolve, reject) => {
            // Füge Event-Listener für diese Klasse hinzu
            if (!classListeners[className]) {
                classListeners[className] = [];
            }
            classListeners[className].push(resolve);
            
            // Versuche, die Klasse im globalen Scope zu finden
            if (typeof window[className] !== 'undefined') {
                loadedClasses[className] = window[className];
                notifyClassLoaded(className);
                return;
            }
            
            // Versuche, die Klassendatei zu laden
            const script = document.createElement('script');
            script.src = `js/${className.toLowerCase()}.js`;
            
            script.onload = function() {
                // Überprüfe, ob die Klasse jetzt verfügbar ist
                if (typeof window[className] !== 'undefined') {
                    loadedClasses[className] = window[className];
                    notifyClassLoaded(className);
                } else {
                    console.warn(`${className}-Klasse wurde nicht im globalen Scope gefunden`);
                    
                    // Setze die Fallback-Klasse
                    window[className] = fallbackClasses[className];
                    loadedClasses[className] = window[className];
                    notifyClassLoaded(className);
                }
            };
            
            script.onerror = function() {
                console.error(`Fehler beim Laden von ${className}.js`);
                
                // Setze die Fallback-Klasse
                window[className] = fallbackClasses[className];
                loadedClasses[className] = window[className];
                notifyClassLoaded(className);
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Benachrichtige alle Listener, dass eine Klasse geladen wurde
    function notifyClassLoaded(className) {
        if (classListeners[className]) {
            classListeners[className].forEach(callback => callback(loadedClasses[className]));
            classListeners[className] = [];
        }
        
        // Überprüfe, ob alle Klassen geladen wurden
        checkAllClassesLoaded();
    }
    
    // Überprüft, ob alle benötigten Klassen geladen wurden
    function checkAllClassesLoaded() {
        const allLoaded = requiredClasses.every(className => loadedClasses[className]);
        
        if (allLoaded) {
            console.log("Alle Klassen wurden geladen");
            document.dispatchEvent(new Event('all-classes-loaded'));
        }
    }
    
    // Lade alle Klassen
    Promise.all(requiredClasses.map(loadClass))
        .then(() => {
            console.log("Alle Klassen bereit");
        })
        .catch(error => {
            console.error("Fehler beim Laden der Klassen:", error);
        });
})(); 