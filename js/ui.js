/**
 * Zone X - UI
 */
class UI {
    constructor(game) {
        this.game = game;
        this.livesElement = document.getElementById('lives-count');
        this.blocksElement = document.getElementById('blocks-count');
        this.plutoniumElement = document.getElementById('plutonium-count');
        this.scoreElement = document.getElementById('score-count');
        this.timerElement = document.getElementById('timer-count');
        this.timerContainer = document.getElementById('timer');
    }
    
    /**
     * Aktualisiert die Anzeige der verbleibenden Leben
     * @param {number} lives Anzahl der Leben
     */
    updateLivesCount(lives) {
        this.livesElement.textContent = lives;
    }
    
    /**
     * Aktualisiert die Anzeige der gesammelten Blocks
     * @param {number} blocks Anzahl der Blocks
     */
    updateBlocksCount(blocks) {
        this.blocksElement.textContent = blocks;
    }
    
    /**
     * Aktualisiert die Anzeige der verbleibenden Plutoniumproben
     * @param {number} plutonium Anzahl der verbleibenden Plutoniumproben
     */
    updatePlutoniumCount(plutonium) {
        this.plutoniumElement.textContent = plutonium;
    }
    
    /**
     * Aktualisiert die Punkteanzeige
     * @param {number} score Punktestand
     */
    updateScore(score) {
        this.scoreElement.textContent = score;
    }
    
    /**
     * Aktualisiert den Timer
     * @param {number} time Verbleibende Zeit in Sekunden
     */
    updateTimer(time) {
        this.timerElement.textContent = time;
        
        // Bei niedrigem Timer rote Farbe setzen
        if (time <= 5) {
            this.timerElement.style.color = 'red';
        } else {
            this.timerElement.style.color = 'white';
        }
    }
    
    /**
     * Zeigt den Timer an
     */
    showTimer() {
        this.timerContainer.classList.remove('hidden');
    }
    
    /**
     * Versteckt den Timer
     */
    hideTimer() {
        this.timerContainer.classList.add('hidden');
    }
    
    /**
     * Zeigt eine Nachricht an
     * @param {string} message Die anzuzeigende Nachricht
     * @param {boolean} isError Ob es sich um eine Fehlermeldung handelt (rot)
     */
    showMessage(message, isError = false) {
        // Prüfe, ob bereits ein Message-Container existiert
        let messageContainer = document.getElementById('message-container');
        
        if (!messageContainer) {
            // Erstelle einen neuen Container
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.style.position = 'absolute';
            messageContainer.style.top = '50%';
            messageContainer.style.left = '50%';
            messageContainer.style.transform = 'translate(-50%, -50%)';
            messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            messageContainer.style.color = isError ? 'red' : 'white';
            messageContainer.style.padding = '20px';
            messageContainer.style.borderRadius = '5px';
            messageContainer.style.fontSize = '24px';
            messageContainer.style.textAlign = 'center';
            messageContainer.style.zIndex = '100';
            
            document.body.appendChild(messageContainer);
        } else {
            // Aktualisiere den vorhandenen Container
            messageContainer.style.color = isError ? 'red' : 'white';
        }
        
        messageContainer.textContent = message;
        
        // Nach 3 Sekunden ausblenden
        setTimeout(() => {
            if (messageContainer.parentNode) {
                messageContainer.parentNode.removeChild(messageContainer);
            }
        }, 3000);
    }
    
    /**
     * Zeigt den Game-Over-Bildschirm an
     */
    showGameOver() {
        const gameOverContainer = document.createElement('div');
        gameOverContainer.id = 'game-over-container';
        gameOverContainer.style.position = 'absolute';
        gameOverContainer.style.top = '0';
        gameOverContainer.style.left = '0';
        gameOverContainer.style.width = '100%';
        gameOverContainer.style.height = '100%';
        gameOverContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverContainer.style.display = 'flex';
        gameOverContainer.style.flexDirection = 'column';
        gameOverContainer.style.justifyContent = 'center';
        gameOverContainer.style.alignItems = 'center';
        gameOverContainer.style.zIndex = '200';
        
        const gameOverTitle = document.createElement('h1');
        gameOverTitle.textContent = 'Game Over';
        gameOverTitle.style.color = 'red';
        gameOverTitle.style.fontSize = '48px';
        gameOverTitle.style.marginBottom = '20px';
        
        const scoreText = document.createElement('p');
        scoreText.textContent = `Punktestand: ${this.game.player.score}`;
        scoreText.style.color = 'white';
        scoreText.style.fontSize = '24px';
        scoreText.style.marginBottom = '30px';
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Neustart';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.backgroundColor = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameOverContainer);
            this.game.restart();
        });
        
        gameOverContainer.appendChild(gameOverTitle);
        gameOverContainer.appendChild(scoreText);
        gameOverContainer.appendChild(restartButton);
        
        document.body.appendChild(gameOverContainer);
    }
    
    /**
     * Zeigt den Spiel-Gewonnen-Bildschirm an
     */
    showGameWon() {
        const gameWonContainer = document.createElement('div');
        gameWonContainer.id = 'game-won-container';
        gameWonContainer.style.position = 'absolute';
        gameWonContainer.style.top = '0';
        gameWonContainer.style.left = '0';
        gameWonContainer.style.width = '100%';
        gameWonContainer.style.height = '100%';
        gameWonContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameWonContainer.style.display = 'flex';
        gameWonContainer.style.flexDirection = 'column';
        gameWonContainer.style.justifyContent = 'center';
        gameWonContainer.style.alignItems = 'center';
        gameWonContainer.style.zIndex = '200';
        
        const gameWonTitle = document.createElement('h1');
        gameWonTitle.textContent = 'Gewonnen!';
        gameWonTitle.style.color = 'gold';
        gameWonTitle.style.fontSize = '48px';
        gameWonTitle.style.marginBottom = '20px';
        
        const scoreText = document.createElement('p');
        scoreText.textContent = `Endpunktestand: ${this.game.player.score}`;
        scoreText.style.color = 'white';
        scoreText.style.fontSize = '24px';
        scoreText.style.marginBottom = '30px';
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Nochmal spielen';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.backgroundColor = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameWonContainer);
            this.game.restart();
        });
        
        gameWonContainer.appendChild(gameWonTitle);
        gameWonContainer.appendChild(scoreText);
        gameWonContainer.appendChild(restartButton);
        
        document.body.appendChild(gameWonContainer);
    }
    
    /**
     * Zeigt den Level-Gewonnen-Bildschirm an
     * @param {number} level Das aktuelle Level
     */
    showLevelComplete(level) {
        const levelCompleteContainer = document.createElement('div');
        levelCompleteContainer.id = 'level-complete-container';
        levelCompleteContainer.style.position = 'absolute';
        levelCompleteContainer.style.top = '0';
        levelCompleteContainer.style.left = '0';
        levelCompleteContainer.style.width = '100%';
        levelCompleteContainer.style.height = '100%';
        levelCompleteContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        levelCompleteContainer.style.display = 'flex';
        levelCompleteContainer.style.flexDirection = 'column';
        levelCompleteContainer.style.justifyContent = 'center';
        levelCompleteContainer.style.alignItems = 'center';
        levelCompleteContainer.style.zIndex = '200';
        
        const levelCompleteTitle = document.createElement('h1');
        levelCompleteTitle.textContent = `Level ${level} abgeschlossen!`;
        levelCompleteTitle.style.color = 'lightblue';
        levelCompleteTitle.style.fontSize = '48px';
        levelCompleteTitle.style.marginBottom = '20px';
        
        const scoreText = document.createElement('p');
        scoreText.textContent = `Punktestand: ${this.game.player.score}`;
        scoreText.style.color = 'white';
        scoreText.style.fontSize = '24px';
        scoreText.style.marginBottom = '30px';
        
        const nextLevelButton = document.createElement('button');
        nextLevelButton.textContent = 'Nächstes Level';
        nextLevelButton.style.padding = '10px 20px';
        nextLevelButton.style.fontSize = '18px';
        nextLevelButton.style.backgroundColor = '#4CAF50';
        nextLevelButton.style.color = 'white';
        nextLevelButton.style.border = 'none';
        nextLevelButton.style.borderRadius = '5px';
        nextLevelButton.style.cursor = 'pointer';
        
        nextLevelButton.addEventListener('click', () => {
            document.body.removeChild(levelCompleteContainer);
            this.game.level.nextLevel();
        });
        
        levelCompleteContainer.appendChild(levelCompleteTitle);
        levelCompleteContainer.appendChild(scoreText);
        levelCompleteContainer.appendChild(nextLevelButton);
        
        document.body.appendChild(levelCompleteContainer);
    }
} 