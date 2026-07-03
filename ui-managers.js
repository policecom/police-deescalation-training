/**
 * ui-managers.js - UI Management Classes with Enhanced Progress Bar (FIXED)
 * Includes: UIManager, DialogueManager, SceneManager
 */

// ============================================
// UI MANAGER
// ============================================
class UIManager {
    static showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.remove('hide');
        loadingScreen.style.display = 'flex';
    }

    static hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, CONFIG.ANIMATIONS.FADE_DURATION);
    }

    static showError(message, details) {
        const errorScreen = document.getElementById('error-screen');
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-details').textContent = details;
        errorScreen.classList.add('show');
        this.hideLoading();
    }

    static showScenarioSelection() {
        this.hideAll();
        
        // Add welcome-mode class to body to hide game panels
        document.body.classList.add('welcome-mode');
        // Remove game-mode class to show language switcher
        document.body.classList.remove('game-mode');
        
        // IMPORTANT: Hide progress indicator when showing scenario selection
        const progressIndicator = document.getElementById('progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
            progressIndicator.classList.remove('show');
        }
        
        // Hide the back to scenarios button
        const backContainer = document.getElementById('back-to-scenarios-container');
        if (backContainer) {
            backContainer.classList.remove('show');
        }
        
        const scenarioSelection = document.getElementById('scenario-selection');
        scenarioSelection.style.display = 'block';
        scenarioSelection.classList.add('show');
        
        // Hide game content panels on welcome screen
        const gameContent = document.querySelector('.game-content');
        if (gameContent) {
            gameContent.style.display = 'none';
        }
        
        this.createScenarioCards();
    }

    static createScenarioCards() {
        const grid = document.getElementById('scenario-grid');
        grid.innerHTML = '';

        gameState.scenarios.forEach((scenario, index) => {
            const scenarioNumber = index + 1;
            const isCompleted = gameState.earnedBadges.includes(`scenario-${scenario.id}-complete`);
            const isPerfect = gameState.earnedBadges.includes(`perfect-scenario-${scenario.id}`);
            
            const card = document.createElement('div');
            card.className = 'scenario-card';
            if (isCompleted) card.classList.add('completed');
            if (isPerfect) card.classList.add('perfect');
            
            card.onclick = () => gameController.selectScenario(scenario.id);
            // Keyboard accessibility: cards act as buttons
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    gameController.selectScenario(scenario.id);
                }
            });

            let statusIcon = '';
            if (isPerfect) statusIcon = '🌟';
            else if (isCompleted) statusIcon = '✅';
            
            const difficulty = '⭐'.repeat(scenario.difficulty || 3);
            const duration = esc(scenario.duration || '10-15');
            const cardTitle = `${esc(i18n.t('scenarios.scenario'))} ${scenarioNumber}: ${esc(scenario.title)}`;

            // Generate POLCOM module tags (show scores >= 4)
            let moduleTags = '';
            if (scenario.modules) {
                const moduleColors = {
                    AL:   '#3B82F6',
                    RNDC: '#10B981',
                    CHPS: '#EF4444',
                    CDR:  '#8B5CF6',
                    NPT:  '#F59E0B',
                    EIC:  '#EC4899'
                };
                const tags = [];
                for (const [key, score] of Object.entries(scenario.modules)) {
                    if (score >= 4) {
                        const color = moduleColors[key] || '#6B7280';
                        const name = i18n.t(`polcomModules.${key}`) || key;
                        const cls = score >= 5 ? 'module-tag primary' : 'module-tag';
                        tags.push(`<span class="${cls}" style="--mod-color:${color}" title="${esc(name)}: ${esc(score)}/5">${esc(name)}</span>`);
                    }
                }
                if (tags.length) {
                    moduleTags = `<div class="scenario-modules">${tags.join('')}</div>`;
                }
            }

            const FLAGS = { cs: '🇨🇿', en: '🇬🇧', lt: '🇱🇹', ro: '🇷🇴' };
            let customRibbon = '';
            let customTools = '';
            if (scenario.isCustom) {
                card.classList.add('custom-scenario');
                const flag = FLAGS[scenario.lang] || '🌐';
                customRibbon = `<div class="scenario-custom-badge">${flag} ${esc(i18n.t('custom.ribbon') || 'Vlastní')}</div>`;
                customTools = `
                    <div class="scenario-custom-tools">
                        <button type="button" class="scenario-tool" data-act="edit" title="${esc(i18n.t('custom.edit') || 'Upravit')}">✏️</button>
                        <button type="button" class="scenario-tool" data-act="export" title="${esc(i18n.t('custom.export') || 'Export')}">⬇</button>
                        <button type="button" class="scenario-tool" data-act="delete" title="${esc(i18n.t('custom.delete') || 'Smazat')}">🗑</button>
                    </div>`;
            }

            card.innerHTML = `
                ${customRibbon}
                ${statusIcon ? `<div class="scenario-status">${statusIcon}</div>` : ''}
                <div class="scenario-icon">${esc(scenario.icon)}</div>
                <div class="scenario-card-title">${cardTitle}</div>
                <div class="scenario-description">${esc(scenario.description)}</div>
                ${moduleTags}
                <div class="scenario-stats">
                    <div class="scenario-difficulty">${difficulty}</div>
                    <div class="scenario-duration">${duration} ${esc(i18n.t('scenarios.minutes'))}</div>
                </div>
                ${customTools}
            `;

            if (scenario.isCustom) {
                card.querySelectorAll('.scenario-tool').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const act = btn.dataset.act;
                        if (act === 'edit') UIManager.editCustomScenario(scenario.id);
                        else if (act === 'export') UIManager.exportCustomScenario(scenario.id);
                        else if (act === 'delete') UIManager.deleteCustomScenario(scenario.id, scenario.title);
                    });
                });
            }

            grid.appendChild(card);
        });

        // Entry card: create / upload a custom scenario
        const addCard = document.createElement('div');
        addCard.className = 'scenario-card scenario-add-card';
        addCard.setAttribute('tabindex', '0');
        addCard.setAttribute('role', 'button');
        addCard.innerHTML = `
            <div class="scenario-add-icon">➕</div>
            <div class="scenario-add-title">${esc(i18n.t('custom.addTitle') || 'Vlastní scénář')}</div>
            <div class="scenario-add-sub">${esc(i18n.t('custom.addSub') || 'Vytvořit, nahrát a zahrát vlastní scénář')}</div>
        `;
        const openChooser = () => UIManager.openCustomChooser();
        addCard.addEventListener('click', openChooser);
        addCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChooser(); }
        });
        grid.appendChild(addCard);
    }

    /** Rebuild the menu data (incl. custom scenarios) and re-render the cards. */
    static async refreshMenu() {
        try {
            await gameController.loadGameData(gameState.currentLanguage || i18n.currentLanguage);
            UIManager.createScenarioCards();
        } catch (e) {
            console.warn('Nepodařilo se obnovit menu:', e);
        }
    }

    static editCustomScenario(id) {
        window.location.href = `editor.html?id=${encodeURIComponent(id)}`;
    }

    static async exportCustomScenario(id) {
        try {
            const rec = await CustomStore.get(id);
            if (!rec) return;
            const slug = String(id).replace(/^custom:/, '');
            UIManager._download(`scenario-${slug}.json`, JSON.stringify(rec.scenario, null, 2));
            if (rec.review) {
                UIManager._download(`review-${slug}.json`, JSON.stringify(rec.review, null, 2));
            }
        } catch (e) {
            alert((i18n.t('custom.exportError') || 'Export se nezdařil') + ': ' + e.message);
        }
    }

    static async deleteCustomScenario(id, title) {
        const msg = (i18n.t('custom.deleteConfirm') || 'Opravdu smazat vlastní scénář') + ` „${title}"?`;
        if (!window.confirm(msg)) return;
        try {
            await CustomStore.delete(id);
            await UIManager.refreshMenu();
        } catch (e) {
            alert((i18n.t('custom.deleteError') || 'Smazání se nezdařilo') + ': ' + e.message);
        }
    }

    static _download(filename, text) {
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    static openCustomChooser() {
        const overlay = document.getElementById('custom-chooser-overlay');
        if (overlay) { overlay.classList.add('show'); overlay.style.display = 'flex'; }
    }

    static showInstructorIntro() {
        const introOverlay = document.getElementById('instructor-intro-overlay');
        const scenario = gameState.currentScenario;
        const instructor = scenario?.instructor || {
            avatar: '👨‍🏫',
            name: 'Training Instructor',
            introduction: 'Complete this scenario to practice de-escalation and communication skills.'
        };
        
        const avatarEl = document.getElementById('instructor-avatar');
        const nameEl = document.getElementById('instructor-name');
        const messageEl = document.getElementById('instructor-message');
        if (avatarEl) avatarEl.textContent = instructor.avatar;
        if (nameEl) nameEl.textContent = instructor.name;
        if (messageEl) messageEl.textContent = instructor.introduction;
        
        introOverlay.style.display = 'flex';
        introOverlay.classList.add('show');
    }

    static hideInstructorIntro() {
        const introOverlay = document.getElementById('instructor-intro-overlay');
        introOverlay.classList.remove('show');
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, CONFIG.ANIMATIONS.FADE_DURATION);
    }

    static initializeProgressBar(totalStages) {
        const progressIndicator = document.getElementById('progress-indicator');
        if (!progressIndicator) return;
        
        console.log('Initializing progress bar with', totalStages, 'stages');
        
        // Completely clear and rebuild the progress indicator
        const stageLabel = i18n.t('game.stage') || 'Stage';
        const ofLabel = i18n.t('game.of') || 'of';
        progressIndicator.innerHTML = `
            <div class="progress-container">
                <div class="progress-line-bg"></div>
                <div class="progress-line-fill" id="progress-line-fill" style="transform: translateY(-50%) scaleX(0);"></div>
                <div class="stage-dots" id="stage-dots"></div>
            </div>
        `;
        
        // Create the stage dots
        const dotsContainer = document.getElementById('stage-dots');
        if (dotsContainer) {
            // Ensure container is empty before adding dots
            dotsContainer.innerHTML = '';
            
            for (let i = 0; i < totalStages; i++) {
                const dot = document.createElement('div');
                dot.className = 'stage-dot';
                
                if (i === 0) {
                    dot.classList.add('active');
                    dot.innerHTML = `<span>1</span>`;
                } else {
                    dot.classList.add('upcoming');
                    dot.innerHTML = `<span>${i + 1}</span>`;
                }
                
                dotsContainer.appendChild(dot);
            }
            
            console.log('Created', dotsContainer.children.length, 'dots');
        }
        
        // Show the progress indicator
        progressIndicator.style.display = 'block';
        progressIndicator.classList.add('show');
    }

    static showGameView() {
        this.hideAll();
        
        // Remove welcome-mode class to show game panels
        document.body.classList.remove('welcome-mode');
        // Add game-mode class to hide language switcher
        document.body.classList.add('game-mode');
        
        // Show the back to scenarios button
        const backContainer = document.getElementById('back-to-scenarios-container');
        if (backContainer) {
            backContainer.classList.add('show');
        }
        
        // Layout (grid on desktop/landscape, single-column flow in portrait)
        // is fully CSS-driven via html.device-* classes; just clear the inline
        // display left by showScenarioSelection and any stale panel-focus state.
        const gc = document.getElementById('game-content');
        if (gc) {
            gc.style.display = '';
            gc.classList.remove('dialogue-focus');
        }
        // Progress bar is initialized in beginScenario() to avoid double-init
        // Ensure dialogue history is visible
        const dialogueHistory = document.getElementById('dialogue-history');
        dialogueHistory.style.display = 'block';
        dialogueHistory.classList.add('show');
        
        document.getElementById('choice-container').style.display = 'block';
        document.getElementById('choice-container').classList.add('show');
        
        // Hide score display during gameplay
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
            scoreDisplay.classList.remove('show');
        }
        
        const scenario = gameState.currentScenario;
        if (scenario) {
            const idx = gameState.scenarios.findIndex(s => s.id === scenario.id);
            const scenarioNumber = idx >= 0 ? idx + 1 : null;
            const headerTitle = scenarioNumber != null
                ? `${i18n.t('scenarios.scenario')} ${scenarioNumber}: ${scenario.title}`
                : `${i18n.t('scenarios.scenario')}: ${scenario.title}`;
            document.querySelector('header h1').textContent = `🚔 ${headerTitle}`;
        }
    }

    static showReview() {
        (()=>{const btn=document.getElementById('show-review-button')||document.querySelector('.show-review-button'); if(btn){btn.classList.add('show');}})();
    }

    static hideAll() {
        document.getElementById('scenario-selection').style.display = 'none';
        document.getElementById('instructor-intro-overlay').style.display = 'none';
        document.getElementById('animation-overlay').classList.add('hidden');
        document.getElementById('trainer-feedback').style.display = 'none';
        
        // Hide progress indicator
        const progressIndicator = document.getElementById('progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
            progressIndicator.classList.remove('show');
        }
        
        // Hide score display
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }
    }

    static updateProgress() {
        if (!gameState.currentScenario) return;
        
        // Count only interactive stages (excluding autoDialogue/finalScene)
        const interactiveStages = gameState.currentScenario.stages.filter(stage => !stage.autoDialogue && !stage.finalScene);
        const totalStages = interactiveStages.length;
        
        // Find which interactive stage we're on
        let interactiveStageIndex = 0;
        for (let i = 0; i <= gameState.currentStage && i < gameState.currentScenario.stages.length; i++) {
            const stage = gameState.currentScenario.stages[i];
            if (!stage.autoDialogue && !stage.finalScene) {
                if (i < gameState.currentStage) {
                    interactiveStageIndex++;
                } else if (i === gameState.currentStage) {
                    // We're on this interactive stage
                    break;
                }
            }
        }
        
        const currentInteractiveStage = interactiveStageIndex + 1;
        
        // Update the progress line
        // The line should only extend from the first dot to the last COMPLETED dot
        // When all stages are done, the line should reach the last dot (index totalStages-1)
        const progressLine = document.getElementById('progress-line-fill');
        if (progressLine && totalStages > 1) {
            // Cap interactiveStageIndex to totalStages - 1 (the last dot position)
            const cappedIndex = Math.min(interactiveStageIndex, totalStages - 1);
            // Calculate scale as fraction of total distance (0 to 1)
            const progressScale = cappedIndex / (totalStages - 1);
            progressLine.style.transform = `translateY(-50%) scaleX(${progressScale})`;
        } else if (progressLine) {
            progressLine.style.transform = `translateY(-50%) scaleX(0)`;
        }
        
        // Update the progress label
        const progressLabel = document.getElementById('progress-label');
        if (progressLabel) {
            const stageLabel = i18n.t('game.stage') || 'Stage';
            const ofLabel = i18n.t('game.of') || 'of';
            progressLabel.textContent = `${stageLabel} ${currentInteractiveStage} ${ofLabel} ${totalStages}`;
        }
        
        // Update the dots
        const dots = document.querySelectorAll('.stage-dot');
        dots.forEach((dot, index) => {
            dot.className = 'stage-dot'; // Reset classes
            
            if (index < interactiveStageIndex) {
                // Completed stages
                dot.classList.add('completed');
                dot.innerHTML = '<span class="checkmark">✓</span>';
            } else if (index === interactiveStageIndex) {
                // Current stage
                dot.classList.add('active');
                dot.innerHTML = `<span>${index + 1}</span>`;
            } else {
                // Upcoming stages
                dot.classList.add('upcoming');
                dot.innerHTML = `<span>${index + 1}</span>`;
            }
        });
        
        // Show stage notification for current stage
        const stage = gameState.currentScenario.stages[gameState.currentStage];
        if (stage && stage.title && !stage.autoDialogue && !stage.finalScene) {
            this.showStageNotification(currentInteractiveStage, totalStages, stage.title);
        }
    }

    static showStageNotification(stageNumber, totalStages, stageName) {
        // Remove any existing notification
        const existingNotification = document.getElementById('stage-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const ofLabel = i18n.t('game.of') || 'of';
        const stageLabel = i18n.t('game.stage') || 'Stage';
        // Create new notification
        const notification = document.createElement('div');
        notification.id = 'stage-notification';
        notification.className = 'stage-notification';
        notification.innerHTML = `
            <div class="stage-notification-content">
                <span class="stage-number">${esc(stageLabel)} ${stageNumber} ${esc(ofLabel)} ${totalStages}</span>
                <span class="stage-name">${esc(stageName || 'In Progress')}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    static updateScore() {
        // Show earned points progress during gameplay
        const totalStages = gameState.metrics.totalInteractiveStages || gameState.totalStages || gameState.interactiveStageCount || 0;
        const earnedPoints = gameState.metrics.earnedPoints || 0;
        const maxPoints = totalStages * 100;
        const scoreEl = document.getElementById('score-value');
        const maxEl = document.getElementById('max-score');
        if (scoreEl && maxEl && totalStages > 0) {
            scoreEl.textContent = earnedPoints;
            maxEl.textContent = maxPoints;
        }
    }

    static createParticles() {
        const container = document.getElementById('scene-particles');
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }
}

// ============================================
// DIALOGUE MANAGER - FIXED
// ============================================
class DialogueManager {
    static addMessage(character, text, isPlayer = false, isWrong = false, feedbackType = '') {
        const dialogueHistory = document.getElementById('dialogue-history');
        
        // Ensure dialogue history is always visible when adding messages
        if (!dialogueHistory.classList.contains('show')) {
            dialogueHistory.classList.add('show');
        }
        dialogueHistory.style.display = 'block';
        
        dialogueHistory.querySelectorAll('.typing-message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        let classes = ['dialogue-message'];
        classes.push(isPlayer ? 'right' : 'left');
        if (isWrong) classes.push('wrong');
        if (feedbackType) classes.push(`trainer-feedback ${feedbackType}`);
        
        messageDiv.className = classes.join(' ');
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const lawCtx = (typeof gameState !== 'undefined' && gameState && gameState.currentScenario && gameState.currentScenario.lawContext) || null;
        // Trainer feedback ("Proč | DŮSLEDKY | Reflexe") renders as labelled
        // blocks; everything else as readable paragraphs.
        const bodyHTML = feedbackType
            ? formatFeedbackHTML(text, lawCtx)
            : paragraphsHTML(text, lawCtx);
        const textClass = feedbackType ? 'message-text feedback-blocks' : 'message-text';

        messageDiv.innerHTML = `
            <div class="message-avatar">${esc(this.getCharacterAvatar(character))}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-name">${esc(this.getCharacterName(character))}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="${textClass}">${bodyHTML}</div>
            </div>
        `;
        
        dialogueHistory.appendChild(messageDiv);
        this.scrollToBottom();
    }

    static showTypingIndicator(character) {
        const dialogueHistory = document.getElementById('dialogue-history');
        
        // Ensure dialogue history is visible
        if (!dialogueHistory.classList.contains('show')) {
            dialogueHistory.classList.add('show');
        }
        dialogueHistory.style.display = 'block';
        
        const indicator = document.createElement('div');
        indicator.className = 'dialogue-message left typing-message';
        indicator.innerHTML = `
            <div class="message-avatar">${esc(this.getCharacterAvatar(character))}</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        dialogueHistory.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
    }

    static getCharacterAvatar(character) {
        if (character == null) return '👤';
        const characters = gameState.currentScenario?.characters;
        return characters?.[character]?.avatar || '👤';
    }

    static getCharacterName(character) {
        if (character == null) return 'Unknown Person';
        const characters = gameState.currentScenario?.characters;
        return characters?.[character]?.name || 'Unknown Person';
    }

    static scrollToBottom() {
        const dialogueHistory = document.getElementById('dialogue-history');
        setTimeout(() => {
            dialogueHistory.scrollTop = dialogueHistory.scrollHeight;
        }, 100);
    }

    static clear() {
        document.getElementById('dialogue-history').innerHTML = '';
    }
}

// ============================================
// SCENE MANAGER
// ============================================
class SceneManager {
    static updateScene(sceneData) {
        const sceneImage = document.getElementById('scene-image');
        
        sceneImage.style.opacity = '0';
        
        setTimeout(() => {
            sceneImage.innerHTML = `
                <div class="scene-particles" id="scene-particles"></div>
                <div class="scene-content">
                    <div class="scene-emoji">${esc(sceneData.emoji)}</div>
                    <h3 class="scene-title">${esc(sceneData.title)}</h3>
                    <p class="scene-description">${esc(sceneData.desc)}</p>
                </div>
            `;
            sceneImage.style.opacity = '1';
            UIManager.createParticles();
        }, CONFIG.ANIMATIONS.FADE_DURATION);
    }
}