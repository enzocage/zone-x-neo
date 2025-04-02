/**
 * Zone X - Hauptspielklasse
 */
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.level = null;
        this.player = null;
        this.enemies = [];
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false
        };
        this.deltaTime = 0;
        this.lastTime = 0;
        this.isGameOver = false;
        this.isGamePaused = false;
        this.plutoniumDelivered = 0;
        this.ui = null;
        this.zoomFactor = 1.0;
        
        console.log('Zone X wird initialisiert...');
        try {
            this.init();
            console.log('Zone X erfolgreich initialisiert!');
        } catch (error) {
            console.error('Fehler bei Initialisierung:', error);
            alert('Fehler bei Initialisierung: ' + error.message);
        }
    }
    
    /**
     * Initialisiert das Spiel
     */
    init() {
        console.log('Initialisiere Three.js Scene...');
        if (typeof debugLog === 'function') debugLog("Initialisiere Three.js Scene");
        
        // Three.js Scene initialisieren
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);
        
        console.log('Erstelle Kamera...');
        if (typeof debugLog === 'function') debugLog("Erstelle Kamera");
        
        // Orthographische Kamera erstellen
        const aspect = window.innerWidth / window.innerHeight;
        const frustrumSize = 20;
        this.camera = new THREE.OrthographicCamera(
            frustrumSize * aspect / -2,
            frustrumSize * aspect / 2,
            frustrumSize / 2,
            frustrumSize / -2,
            1,
            1000
        );
        this.camera.position.set(CONFIG.CAMERA_POSITION.x, CONFIG.CAMERA_POSITION.y, CONFIG.CAMERA_POSITION.z);
        this.camera.lookAt(0, 0, 0);
        this.camera.userData = { type: 'camera' };
        
        console.log('Erstelle Renderer...');
        if (typeof debugLog === 'function') debugLog("Suche Canvas-Element");
        
        // Renderer erstellen
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            const err = "Canvas-Element mit ID 'game-canvas' nicht gefunden!";
            console.error(err);
            if (typeof debugLog === 'function') debugLog("FEHLER: " + err);
            throw new Error(err);
        }
        
        if (typeof debugLog === 'function') {
            debugLog("Canvas-Element gefunden: " + 
                     (canvas.tagName === 'CANVAS' ? "CANVAS √" : "KEIN CANVAS! (" + canvas.tagName + ")"));
        }
        
        // WebGL-Unterstützung testen
        try {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                console.warn("WebGL wird nicht unterstützt. Das Spiel wird möglicherweise nicht funktionieren.");
                if (typeof debugLog === 'function') debugLog("WARNUNG: WebGL nicht verfügbar im Canvas");
            } else {
                if (typeof debugLog === 'function') debugLog("WebGL verfügbar √");
            }
        } catch (e) {
            console.error("WebGL-Fehler:", e);
            if (typeof debugLog === 'function') debugLog("WebGL-Fehler: " + e.message);
        }
        
        // Renderer direkt mit Canvas-Element erstellen
        try {
            if (typeof debugLog === 'function') debugLog("Erstelle WebGL-Renderer");
            
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true 
            });
            
            if (typeof debugLog === 'function') debugLog("Setze Renderer-Größe");
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            console.log('Renderer erfolgreich erstellt');
            if (typeof debugLog === 'function') debugLog("Renderer erstellt √");
        } catch (error) {
            console.error("Fehler beim Erstellen des Renderers:", error);
            if (typeof debugLog === 'function') debugLog("FEHLER: Renderer konnte nicht erstellt werden: " + error.message);
            throw error;
        }
        
        console.log('Füge Lichter hinzu...');
        // Lichter hinzufügen
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 30);
        this.scene.add(directionalLight);
        
        console.log('Initialisiere UI...');
        // UI initialisieren
        this.ui = new UI(this);
        
        console.log('Initialisiere Level-Manager...');
        // Level-Manager initialisieren
        this.level = new Level(this);
        
        console.log('Registriere Event-Listener...');
        // Event-Listener für Tastatureingaben
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Event-Listener für Fenstergröße
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Event-Listener für Mausrad (Zoom)
        window.addEventListener('wheel', this.handleWheel.bind(this));
        
        console.log('Lade erstes Level...');
        // Wenn USE_FALLBACK_LEVEL gesetzt ist, lade direkt das Fallback-Level
        if (CONFIG.USE_FALLBACK_LEVEL) {
            console.log('Lade direkt Fallback-Level...');
            if (typeof debugLog === 'function') debugLog("Lade Fallback-Level direkt");
            this.level.loadFallbackLevel();
        } else {
            // Sonst versuche, das erste Level zu laden
            this.level.loadLevel(1);
        }
        
        console.log('Starte Animation...');
        // Animation starten
        this.animate(0);
    }
    
    /**
     * Verarbeitet Tastendruck-Ereignisse
     * @param {KeyboardEvent} event Tastendruck-Ereignis
     */
    handleKeyDown(event) {
        if (this.isGameOver || this.isGamePaused) return;
        
        switch (event.key.toLowerCase()) {
            case 'w':
                this.input.up = true;
                break;
            case 'a':
                this.input.left = true;
                break;
            case 's':
                this.input.down = true;
                break;
            case 'd':
                this.input.right = true;
                break;
            case ' ':
                this.input.action = true;
                break;
        }
    }
    
    /**
     * Verarbeitet Tastenfreigabe-Ereignisse
     * @param {KeyboardEvent} event Tastenfreigabe-Ereignis
     */
    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.input.up = false;
                break;
            case 'a':
                this.input.left = false;
                break;
            case 's':
                this.input.down = false;
                break;
            case 'd':
                this.input.right = false;
                break;
            case ' ':
                this.input.action = false;
                if (!this.isGameOver && !this.isGamePaused) {
                    this.player.placeBlock();
                }
                break;
        }
    }
    
    /**
     * Verarbeitet Größenänderung des Fensters
     */
    handleResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const frustrumSize = 20 * this.zoomFactor;
        
        this.camera.left = frustrumSize * aspect / -2;
        this.camera.right = frustrumSize * aspect / 2;
        this.camera.top = frustrumSize / 2;
        this.camera.bottom = frustrumSize / -2;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Verarbeitet Mausrad-Ereignisse für Zoom
     * @param {WheelEvent} event Mausrad-Ereignis
     */
    handleWheel(event) {
        const delta = Math.sign(event.deltaY);
        const zoomSpeed = 0.1;
        
        this.zoomFactor += delta * zoomSpeed;
        this.zoomFactor = Math.max(0.5, Math.min(this.zoomFactor, 2.5)); // Beschränke Zoom
        
        const aspect = window.innerWidth / window.innerHeight;
        const frustrumSize = 20 * this.zoomFactor;
        
        this.camera.left = frustrumSize * aspect / -2;
        this.camera.right = frustrumSize * aspect / 2;
        this.camera.top = frustrumSize / 2;
        this.camera.bottom = frustrumSize / -2;
        
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Initialisiert ein Level
     */
    initLevel() {
        // Spieler erstellen
        if (this.player) {
            this.scene.remove(this.player.mesh);
        }
        
        this.player = new Player(this, this.level.startPosition.x, this.level.startPosition.y);
        this.plutoniumDelivered = 0;
        
        // UI aktualisieren
        this.ui.updateLivesCount(this.player.lives);
        this.ui.updateBlocksCount(this.player.blocks);
        this.ui.updatePlutoniumCount(CONFIG.PLUTONIUM_COUNT);
        this.ui.updateScore(this.player.score);
        
        // Wände erstellen
        this.createWalls();
        
        // Gegner erstellen
        this.createEnemies();
        
        // Plutonium erstellen
        this.createPlutonium();
        
        // Tonnen erstellen
        this.createBarrels();
        
        // Blöcke erstellen
        this.createBlocks();
        
        // Exit erstellen
        this.createExit();
        
        // Kamera auf Spieler ausrichten
        this.updateCamera();
    }
    
    /**
     * Erstellt die Wände im Level
     */
    createWalls() {
        const geometry = new THREE.BoxGeometry(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.WALL });
        
        for (const wall of this.level.walls) {
            const mesh = new THREE.Mesh(geometry, material);
            const worldPos = Utils.gridToWorld(wall.x, wall.y);
            mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE / 2);
            mesh.userData = { type: 'wall' };
            
            this.scene.add(mesh);
        }
    }
    
    /**
     * Erstellt die Gegner im Level
     */
    createEnemies() {
        this.enemies = [];
        
        for (const enemyData of this.level.enemies) {
            const enemy = new Enemy(this, enemyData.x, enemyData.y, enemyData.direction);
            this.enemies.push(enemy);
        }
    }
    
    /**
     * Erstellt das Plutonium im Level
     */
    createPlutonium() {
        const geometry = new THREE.SphereGeometry(CONFIG.TILE_SIZE * 0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.PLUTONIUM });
        
        for (const plutonium of this.level.plutonium) {
            const mesh = new THREE.Mesh(geometry, material);
            const worldPos = Utils.gridToWorld(plutonium.x, plutonium.y);
            mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.3);
            mesh.userData = { type: 'plutonium' };
            
            this.scene.add(mesh);
        }
    }
    
    /**
     * Erstellt die Tonnen im Level
     */
    createBarrels() {
        const geometry = new THREE.CylinderGeometry(
            CONFIG.TILE_SIZE * 0.4,
            CONFIG.TILE_SIZE * 0.4,
            CONFIG.TILE_SIZE * 0.8,
            16
        );
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.BARREL });
        
        for (const barrel of this.level.barrels) {
            const mesh = new THREE.Mesh(geometry, material);
            const worldPos = Utils.gridToWorld(barrel.x, barrel.y);
            mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.4);
            mesh.userData = { type: 'barrel' };
            
            this.scene.add(mesh);
        }
    }
    
    /**
     * Erstellt die Blöcke im Level
     */
    createBlocks() {
        for (const block of this.level.blocks) {
            this.createBlockMesh(block.x, block.y);
        }
    }
    
    /**
     * Erstellt ein einzelnes Block-Mesh
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    createBlockMesh(x, y) {
        const geometry = new THREE.BoxGeometry(
            CONFIG.TILE_SIZE * 0.8,
            CONFIG.TILE_SIZE * 0.8,
            CONFIG.TILE_SIZE * 0.4
        );
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.BLOCK });
        const mesh = new THREE.Mesh(geometry, material);
        
        const worldPos = Utils.gridToWorld(x, y);
        mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.2);
        mesh.userData = { type: 'block' };
        
        this.scene.add(mesh);
    }
    
    /**
     * Erstellt den Exit im Level
     */
    createExit() {
        if (!this.level.exit) return;
        
        const geometry = new THREE.BoxGeometry(
            CONFIG.TILE_SIZE * 0.9,
            CONFIG.TILE_SIZE * 0.9,
            CONFIG.TILE_SIZE * 0.1
        );
        const material = new THREE.MeshLambertMaterial({ 
            color: CONFIG.COLORS.EXIT,
            transparent: true,
            opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        const worldPos = Utils.gridToWorld(this.level.exit.x, this.level.exit.y);
        mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.05);
        mesh.userData = { type: 'exit' };
        
        this.scene.add(mesh);
    }
    
    /**
     * Aktiviert den Exit (blinken)
     */
    activateExit() {
        // Sucht das Exit-Mesh
        let exitMesh = null;
        this.scene.traverse((object) => {
            if (object.userData.type === 'exit') {
                exitMesh = object;
            }
        });
        
        if (exitMesh) {
            // Blinken-Animation starten
            const blinkInterval = setInterval(() => {
                exitMesh.visible = !exitMesh.visible;
            }, 500);
            
            // Intervall in das Mesh speichern, um es später zu löschen
            exitMesh.userData.blinkInterval = blinkInterval;
            
            // Nachricht anzeigen
            this.ui.showMessage('Exit aktiviert! Erreiche den Ausgang!');
        }
    }
    
    /**
     * Aktualisiert die Kameraposition (folgt dem Spieler)
     */
    updateCamera() {
        if (!this.player) return;
        
        const worldPos = Utils.gridToWorld(this.player.x, this.player.y);
        this.camera.position.x = worldPos.x;
        this.camera.position.y = worldPos.y;
    }
    
    /**
     * Verarbeitet Spielereingaben
     */
    processInput() {
        if (!this.player || this.player.isMoving || this.isGameOver || this.isGamePaused) return;
        
        if (this.input.up) {
            this.player.move(0, -1);
        } else if (this.input.down) {
            this.player.move(0, 1);
        } else if (this.input.left) {
            this.player.move(-1, 0);
        } else if (this.input.right) {
            this.player.move(1, 0);
        }
    }
    
    /**
     * Aktualisiert das Spiel
     * @param {number} time Aktuelle Zeit in Millisekunden
     */
    update(time) {
        // Berechne Delta-Zeit
        this.deltaTime = (time - this.lastTime) / 1000; // in Sekunden
        this.lastTime = time;
        
        // Begrenze die Delta-Zeit (bei Tab-Wechsel etc.)
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Verarbeite Eingaben
        this.processInput();
        
        // Aktualisiere Spieler
        if (this.player) {
            this.player.update();
        }
        
        // Aktualisiere Gegner
        for (const enemy of this.enemies) {
            enemy.update();
        }
    }
    
    /**
     * Rendert das Spiel
     */
    render() {
        try {
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Fehler beim Rendern:', error);
            if (typeof debugLog === 'function') debugLog("FEHLER beim Rendern: " + error.message);
            throw error;
        }
    }
    
    /**
     * Animations-Loop
     * @param {number} time Aktuelle Zeit in Millisekunden
     */
    animate(time) {
        try {
            requestAnimationFrame(this.animate.bind(this));
            
            if (!this.isGamePaused) {
                this.update(time);
                this.render();
            }
        } catch (error) {
            console.error('Fehler im Animations-Loop:', error);
            if (typeof debugLog === 'function') debugLog("FEHLER im Animations-Loop: " + error.message);
            
            // Bei Fehlern im Animations-Loop nicht weiter Animation versuchen
            this.isGamePaused = true;
            
            // Zeige Fehlermeldung an
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                document.getElementById('start-screen').style.display = 'flex';
                errorMessage.textContent = 'Fehler bei der Spielanimation: ' + error.message;
            }
        }
    }
    
    /**
     * Beendet das Spiel (Game Over)
     */
    gameOver() {
        this.isGameOver = true;
        this.ui.showGameOver();
    }
    
    /**
     * Beendet das Spiel (Gewonnen)
     */
    gameWon() {
        this.isGameOver = true;
        this.ui.showGameWon();
    }
    
    /**
     * Zeigt den Level-Completed-Bildschirm an
     */
    levelComplete() {
        this.isGamePaused = true;
        this.ui.showLevelComplete(this.level.currentLevel);
    }
    
    /**
     * Startet das Spiel neu
     */
    restart() {
        this.isGameOver = false;
        this.isGamePaused = false;
        this.level.loadLevel(1);
    }
} 