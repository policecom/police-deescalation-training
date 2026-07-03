/**
 * game-controller.js - Enhanced Game Controller with Progress Bar Fix
 * Main game logic and controls with detailed performance analysis
 */

class GameController {
    constructor() {
        this.pendingTimeouts = []; // Registry of scheduled dialogue/choice timeouts (cancellable)
        this.initializeEventListeners();
        this.reviewData = null; // Will hold the review JSON for current scenario
    }

    // Schedule a timeout that can be cancelled when the player leaves a scenario,
    // so stale NPC lines/choices never leak into a new run.
    scheduleTimeout(callback, delay) {
        const id = setTimeout(() => {
            this.pendingTimeouts = this.pendingTimeouts.filter(t => t !== id);
            callback();
        }, delay);
        this.pendingTimeouts.push(id);
        return id;
    }

    clearPendingTimeouts() {
        this.pendingTimeouts.forEach(id => clearTimeout(id));
        this.pendingTimeouts = [];
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (gameState.currentState === 'PLAYING') {
                const choices = document.querySelectorAll('.choice-button');
                if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    if (choices[index]) {
                        choices[index].click();
                    }
                } else if (e.key === 'Enter' && gameState.selectedChoice !== null) {
                    // If focus is on a choice button, let its own click activation handle
                    // Enter — otherwise Enter would submit the previously selected choice.
                    if (e.target && e.target.classList && e.target.classList.contains('choice-button')) {
                        return;
                    }
                    this.submitChoice();
                }
            }
        });

        // Escape closes dialogs that have a close affordance (review modal, badge popup)
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const reviewModal = document.getElementById('review-modal-overlay');
            if (reviewModal && reviewModal.classList.contains('show')) {
                this.closeReviewModal();
                return;
            }
            const badgePopup = document.getElementById('badge-earned');
            if (badgePopup && badgePopup.classList.contains('show')) {
                this.closeBadgePopup();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameState.choiceTimer) {
                this.pauseTimer();
            } else if (!document.hidden && gameState.currentState === 'PLAYING') {
                this.resumeTimer();
            }
        });
    }

    async init() {
        console.log('Initializing multilingual game...');
        gameState.setState('LOADING');
        
        try {
            await i18n.init();
            await this.loadGameData(i18n.currentLanguage);
            this.loadProgress();
            
            UIManager.hideLoading();
            
            // Ensure progress indicator is hidden on initial load
            const progressIndicator = document.getElementById('progress-indicator');
            if (progressIndicator) {
                progressIndicator.style.display = 'none';
                progressIndicator.classList.remove('show');
            }
            
            gameState.setState('MENU');
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            gameState.setState('ERROR');
            UIManager.showError(i18n.t('error.title'), error.message);
        }
    }

    async loadGameData(language) {
        const indexPath = CONFIG.FILE_PATHS.scenariosIndex[language];
        const indexData = await this.loadJSON(CONFIG.BASE_URL + indexPath);
        
        if (!indexData || !indexData.scenarios || !indexData.badges) {
            throw new Error('Invalid game data structure');
        }
        
        gameState.scenarios = indexData.scenarios;
        gameState.badges = indexData.badges;
        gameState.currentLanguage = language;
        await this.mergeCustomScenarios();
    }

    async loadJSON(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            throw error;
        }
    }

    async loadReviewData(scenarioId) {
        // Custom scenarios carry their review inside the IndexedDB record; it was
        // stashed by selectScenario. No review => score-only report (supported).
        if (typeof CustomStore !== 'undefined' && CustomStore.isCustomId(scenarioId)) {
            this.reviewData = this._customReview || null;
            if (gameState) gameState.reviewData = this.reviewData;
            return;
        }
        const lang = gameState.currentLanguage;
        try {
            const reviewPath = `${CONFIG.BASE_URL}scenarios/reviews/review-${scenarioId}-${lang}.json`;
            this.reviewData = await this.loadJSON(reviewPath);
            if (gameState) gameState.reviewData = this.reviewData;
            console.log('Review data loaded for scenario:', scenarioId);
        } catch (e) {
            this.reviewData = null;
            if (gameState) gameState.reviewData = null;
        }
    }

    // Append user-created scenarios (from IndexedDB) to the menu data and give
    // their completion badges a name so popups render. Safe if CustomStore or
    // IndexedDB is unavailable — the built-in menu still loads.
    async mergeCustomScenarios() {
        if (typeof CustomStore === 'undefined') return;
        try {
            await CustomStore.ready();
            const customs = await CustomStore.list();
            customs
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                .forEach(meta => {
                    gameState.scenarios.push({
                        id: meta.id,
                        title: meta.title,
                        description: meta.description,
                        icon: meta.icon || '🎓',
                        difficulty: meta.difficulty || 3,
                        duration: meta.duration || '10-15',
                        isCustom: true,
                        lang: meta.lang || 'cs',
                        hasReview: !!meta.hasReview,
                        badges: {}
                    });
                    gameState.badges[`scenario-${meta.id}-complete`] = {
                        name: `${meta.title} — dokončeno`,
                        description: 'Dokončení vlastního scénáře',
                        icon: '✅'
                    };
                    gameState.badges[`perfect-scenario-${meta.id}`] = {
                        name: `${meta.title} — bez chyby`,
                        description: 'Perfektní průchod vlastním scénářem',
                        icon: '🌟'
                    };
                });
        } catch (e) {
            console.warn('Vlastní scénáře nedostupné:', e);
        }
    }

    loadProgress() {
        // localStorage may be blocked (iframe embeds) or hold corrupted values —
        // never let that kill initialization.
        try {
            const savedBadges = localStorage.getItem(CONFIG.STORAGE_KEYS.BADGES);
            if (savedBadges) {
                const badges = JSON.parse(savedBadges);
                if (Array.isArray(badges)) {
                    gameState.earnedBadges = badges;
                }
            }
        } catch (e) {
            console.warn('Could not restore saved badges:', e);
            gameState.earnedBadges = [];
        }

        try {
            const savedProgress = localStorage.getItem(CONFIG.STORAGE_KEYS.PROGRESS);
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                // Restore saved progress data
                if (progress && progress.totalScore !== undefined) {
                    gameState.score = progress.totalScore;
                }
                if (progress && progress.language) {
                    gameState.currentLanguage = progress.language;
                }
            }
        } catch (e) {
            console.warn('Could not restore saved progress:', e);
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.BADGES, JSON.stringify(gameState.earnedBadges));
            localStorage.setItem(CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify({
                lastPlayed: Date.now(),
                totalScore: gameState.score,
                language: gameState.currentLanguage
            }));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    startGame() {
        document.getElementById('animation-overlay').classList.add('hidden');
        UIManager.showScenarioSelection();
    }

    async selectScenario(scenarioId) {
        console.log('Selecting scenario:', scenarioId);
        // Cancel any dialogue/choice timeouts left over from a previous run
        this.clearPendingTimeouts();
        gameState.setState('LOADING');
        UIManager.showLoading();
        
        try {
            const lang = gameState.currentLanguage || (typeof i18n !== 'undefined' ? i18n.currentLanguage : null) || CONFIG.DEFAULT_LANGUAGE;

            let scenarioData;
            if (typeof CustomStore !== 'undefined' && CustomStore.isCustomId(scenarioId)) {
                // User-created scenario: read from IndexedDB, not from the file map.
                const rec = await CustomStore.get(scenarioId);
                if (!rec || !rec.scenario) {
                    throw new Error('Vlastní scénář se nepodařilo načíst.');
                }
                scenarioData = rec.scenario;
                this._customReview = rec.review || null;
            } else {
                const languageScenarios = CONFIG.FILE_PATHS.scenarios[lang] || {};
                const id = scenarioId != null ? String(scenarioId) : scenarioId;
                // Prefer an explicit path from CONFIG; otherwise fall back to the
                // file-naming convention. This lets self-hosters add a scenario by
                // just dropping scenarios/<lang>/scenario-<id>-<lang>.json and
                // listing it in scenarios/index-<lang>.json — no config.js edit.
                let scenarioPath = languageScenarios[scenarioId] || languageScenarios[id];
                if (!scenarioPath && typeof scenarioId === 'number') {
                    scenarioPath = languageScenarios[String(scenarioId)];
                }
                if (!scenarioPath) {
                    scenarioPath = `scenarios/${lang}/scenario-${id}-${lang}.json`;
                }
                scenarioData = await this.loadJSON(CONFIG.BASE_URL + scenarioPath);
                if (!scenarioData) {
                    throw new Error('Failed to load scenario data');
                }
                this._customReview = null;
            }

            // Load review data for comprehensive analysis
            await this.loadReviewData(scenarioId);
            
            gameState.currentScenario = scenarioData;
            gameState.currentStage = 0;
            gameState.gameHistory = [];
            gameState.perfectStages = 0;
            gameState.stageAttempts = {};
            gameState.choiceTypes = []; // Track choice types for pattern analysis
            gameState.communicationScores = []; // Track communication effectiveness
            gameState.metrics = {
                totalChoices: 0,
                positiveChoices: 0,
                neutralChoices: 0,
                negativeChoices: 0,
                partiallyPositiveChoices: 0,
                retryCount: 0,
                perfectStages: 0,
                earnedPoints: 0,
                totalInteractiveStages: 0,
                averageResponseTime: 0,
                criticalSuccesses: 0,
                criticalFailures: 0,
                empathyShown: 0,
                escalations: 0,
                deescalations: 0,
                missedCues: 0,
                proceduralErrors: 0
            };
            
            // Grade-based scoring: totalStages is the denominator for percentage
            gameState.maxScore = 0; // Unused in new system; kept for compatibility
            
            UIManager.hideLoading();
            gameState.setState('INTRO');
            
        } catch (error) {
            console.error('Error loading scenario:', error);
            UIManager.showError(i18n.t('error.scenarioLoad'), error.message);
        }
    }

    beginScenario() {
        UIManager.hideInstructorIntro();
        gameState.setState('PLAYING');
        
        // Initialize stage attempts
        gameState.currentScenario.stages.forEach((stage, index) => {
            gameState.stageAttempts[index] = 0;
        });
        
        UIManager.updateScore();
        DialogueManager.clear();
        
        // Initialize the progress bar with the number of interactive stages (excluding autoDialogue/finalScene stages)
        const interactiveStages = gameState.currentScenario.stages.filter(stage => !stage.autoDialogue && !stage.finalScene);
        const totalStages = interactiveStages.length;
        gameState.interactiveStageCount = totalStages;
        gameState.totalStages = totalStages; // For percentage calculation
        gameState.metrics.totalInteractiveStages = totalStages;
        UIManager.initializeProgressBar(totalStages);
        
        // Show the progress indicator
        const progressIndicator = document.getElementById('progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'block';
            progressIndicator.classList.add('show');
        }
        
        // Load the first stage
        this.loadStage(0);
    }

    loadStage(stageIndex) {
        console.log('Loading stage:', stageIndex);
        
        if (!gameState.currentScenario) {
            console.error('No scenario loaded');
            return;
        }
        
        gameState.currentStage = stageIndex;
        const stage = gameState.currentScenario.stages[stageIndex];
        
        if (!stage) {
            console.error('Stage not found:', stageIndex);
            return;
        }
        
        const dialogueHistory = document.getElementById('dialogue-history');
        dialogueHistory.style.display = 'block';
        dialogueHistory.classList.add('show');
        
        if (stage.options && !stage.finalScene) {
            gameState.stageAttempts[stageIndex] = (gameState.stageAttempts[stageIndex] || 0) + 1;
        }
        
        if (stage.sceneUpdate) {
            SceneManager.updateScene(stage.sceneUpdate);
        }
        
        UIManager.updateProgress();
        
        if (stage.finalScene && stage.autoDialogue) {
            this.playFinalScene(stage);
        } else {
            this.playStageDialogue(stage);
        }
    }

    playStageDialogue(stage) {
        const dialogueHistory = document.getElementById('dialogue-history');
        dialogueHistory.style.display = 'block';
        dialogueHistory.classList.add('show');
        
        document.getElementById('choice-container').style.display = 'block';
        
        if (stage.npcDialogue) {
            stage.npcDialogue.forEach((dialogue, index) => {
                const entry = typeof dialogue === 'string'
                    ? { character: 'npc', text: dialogue }
                    : (dialogue?.character != null && dialogue?.text != null ? dialogue : { character: 'npc', text: String(dialogue) });
                this.scheduleTimeout(() => {
                    const typingIndicator = DialogueManager.showTypingIndicator(entry.character);
                    this.scheduleTimeout(() => {
                        typingIndicator.remove();
                        DialogueManager.addMessage(entry.character, entry.text);
                    }, CONFIG.TIMERS.TYPING_DELAY);
                }, index * CONFIG.TIMERS.MESSAGE_DELAY);
            });
        }

        this.scheduleTimeout(() => {
            if (!stage.options || stage.options.length === 0) {
                document.getElementById('choice-container').style.display = 'none';
                this.showFinalRevelation();
            } else {
                this.showChoices(stage.options, stage.prompt);
            }
        }, (stage.npcDialogue ? stage.npcDialogue.length : 0) * CONFIG.TIMERS.MESSAGE_DELAY + 1000);
    }

    playFinalScene(stage) {
        const dialogueHistory = document.getElementById('dialogue-history');
        dialogueHistory.style.display = 'block';
        dialogueHistory.classList.add('show');
        
        document.getElementById('choice-container').style.display = 'none';
        
        stage.dialogueSequence.forEach((dialogue, index) => {
            this.scheduleTimeout(() => {
                const typingIndicator = DialogueManager.showTypingIndicator(dialogue.character);

                this.scheduleTimeout(() => {
                    typingIndicator.remove();
                    DialogueManager.addMessage(
                        dialogue.character,
                        dialogue.text,
                        dialogue.character === 'officer'
                    );

                    if (index === stage.dialogueSequence.length - 1) {
                        this.scheduleTimeout(() => {
                            this.showFinalRevelation();
                        }, 3000);
                    }
                }, CONFIG.TIMERS.TYPING_DELAY);
            }, index * 3000);
        });
    }

    showChoices(options, prompt) {
        if (!options || options.length === 0) return;

        gameState.isSubmitting = false;
        const choiceContainer = document.getElementById('choice-container');
        const choicePrompt = document.getElementById('choice-prompt');
        const choiceOptions = document.getElementById('choice-options');
        
        choiceContainer.style.display = 'block';
        choiceContainer.classList.add('show');
        
        if (prompt) {
            choicePrompt.textContent = prompt;
        }
        
        choiceOptions.innerHTML = '';
        gameState.selectedChoice = null;

        // Render options in a random order so the correct answer has no fixed
        // position (data files often list it first). data-index keeps the
        // ORIGINAL index — all game logic (submitChoice, scoring, review)
        // keeps working on stage.options[originalIndex].
        const displayOrder = options.map((option, index) => ({ option, index }));
        for (let i = displayOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [displayOrder[i], displayOrder[j]] = [displayOrder[j], displayOrder[i]];
        }

        displayOrder.forEach(({ option, index }, pos) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.innerHTML = `<span style="opacity: 0.6">${pos + 1}.</span> ${esc(option.text)}`;
            button.onclick = () => this.selectChoice(index, button);
            button.setAttribute('data-index', index);
            choiceOptions.appendChild(button);
        });
        
        document.querySelector('.submit-choice').disabled = true;
        
        /* Timer disabled - no auto-submit; user submits when ready */
    }

    selectChoice(index, button) {
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        gameState.selectedChoice = index;
        
        document.querySelector('.submit-choice').disabled = false;
        
        this.playSound('click');
    }

    submitChoice() {
        if (gameState.selectedChoice === null) return;
        if (gameState.isSubmitting) return;
        gameState.isSubmitting = true;

        // Auto-switch to dialogue focus so user can read the response
        var gc = document.getElementById('game-content');
        if (gc) gc.classList.add('dialogue-focus');
        
        this.stopChoiceTimer();
        
        const stage = gameState.currentScenario.stages[gameState.currentStage];
        const selectedOption = stage.options[gameState.selectedChoice];
        
        // Track choice type for pattern analysis
        gameState.choiceTypes.push(selectedOption.type);
        
        // Calculate communication effectiveness score (choice type only)
        const communicationScore = this.calculateCommunicationScore(selectedOption);
        gameState.communicationScores.push(communicationScore);
        
        const canAdvance = selectedOption.type === 'positive' || selectedOption.type === 'partially_positive';
        // partially_positive advances and scores 75 — do not style it as a wrong (red) bubble
        const isWrong = !canAdvance;
        DialogueManager.addMessage('officer', selectedOption.text, true, isWrong);
        
        // Graduated scoring: 100 (first-try positive), 75 (first-try partial), 50 (retry success)
        if (canAdvance) {
            const attempt = gameState.stageAttempts[gameState.currentStage];
            if (attempt === 1 && selectedOption.type === 'positive') {
                gameState.perfectStages = (gameState.perfectStages || 0) + 1;
                gameState.metrics.perfectStages = gameState.perfectStages;
                gameState.metrics.earnedPoints += 100;
            } else if (attempt === 1 && selectedOption.type === 'partially_positive') {
                gameState.metrics.earnedPoints += 75;
            } else {
                gameState.metrics.earnedPoints += 50; // retry success
            }
        }
        UIManager.updateScore();
        
        this.scheduleTimeout(() => {
            const typingIndicator = DialogueManager.showTypingIndicator('trainer');

            this.scheduleTimeout(() => {
                typingIndicator.remove();
                DialogueManager.addMessage(
                    'trainer',
                    selectedOption.feedback,
                    false,
                    false,
                    selectedOption.type
                );

                if (selectedOption.type === 'positive') {
                    this.playSound('success');
                } else {
                    this.playSound('error');
                }
            }, CONFIG.TIMERS.TYPING_DELAY);
        }, 500);
        
        // Enhanced game history with more detail
        gameState.gameHistory.push({
            stage: gameState.currentStage,
            stageTitle: stage.title,
            stageId: stage.id,
            choice: selectedOption.text,
            choiceIndex: gameState.selectedChoice,
            feedback: selectedOption.feedback,
            type: selectedOption.type,
            points: selectedOption.points || 0,
            attempt: gameState.stageAttempts[gameState.currentStage],
            timestamp: Date.now(),
            communicationScore: communicationScore
        });
        
        // Record choice for metrics
        this.recordChoiceMetrics(gameState.selectedChoice, gameState.currentStage, selectedOption);
        
        document.getElementById('choice-container').style.display = 'none';
        
        this.scheduleTimeout(() => {
            gameState.isSubmitting = false;
            if (canAdvance && gameState.currentStage < gameState.currentScenario.stages.length - 1) {
                this.continueToNextStage();
            } else if (selectedOption.type === 'negative' || selectedOption.type === 'neutral') {
                gameState.stageAttempts[gameState.currentStage] = (gameState.stageAttempts[gameState.currentStage] || 0) + 1;
                this.retryStage(selectedOption.type);
            }
        }, CONFIG.TIMERS.FEEDBACK_DELAY);
    }

    recordChoiceMetrics(choice, stage, option) {
        // Update metrics
        gameState.metrics.totalChoices++;
        
        switch(option.type) {
            case 'positive':
                gameState.metrics.positiveChoices++;
                gameState.metrics.deescalations++;
                break;
            case 'partially_positive':
                gameState.metrics.partiallyPositiveChoices++;
                gameState.metrics.deescalations++;
                break;
            case 'neutral':
                gameState.metrics.neutralChoices++;
                break;
            case 'negative':
                gameState.metrics.negativeChoices++;
                gameState.metrics.escalations++;
                break;
        }
        
        // Track if this is a retry
        if (gameState.stageAttempts[stage] > 1) {
            gameState.metrics.retryCount++;
        }
        
        // Check for critical moments
        if (this.isCriticalStage(stage)) {
            if (option.type === 'positive') {
                gameState.metrics.criticalSuccesses++;
            } else {
                gameState.metrics.criticalFailures++;
            }
        }
        
        // Analyze for empathy
        if (this.detectsEmpathy(option)) {
            gameState.metrics.empathyShown++;
        }
        
        // Check for missed cues
        if (option.type === 'negative' && this.isMissedCue(option)) {
            gameState.metrics.missedCues++;
        }
    }

    isCriticalStage(stageIndex) {
        // Define critical stages based on scenario
        const criticalStages = CONFIG.REVIEW?.CRITICAL_STAGES?.[gameState.currentScenario?.id] || 
                               CONFIG.REVIEW?.CRITICAL_STAGES?.default || 
                               [3, 4, 5];
        return criticalStages.includes(stageIndex);
    }

    detectsEmpathy(option) {
        const empathyKeywords = CONFIG.REVIEW?.PATTERN_KEYWORDS?.empathy || 
                                ['understand', 'sorry', 'help', 'listen', 'concern', 'support'];
        const text = option.text.toLowerCase();
        return option.type === 'positive' && 
               empathyKeywords.some(keyword => text.includes(keyword));
    }

    isMissedCue(option) {
        const missedCueKeywords = CONFIG.REVIEW?.PATTERN_KEYWORDS?.missed_cues || 
                                  ['dismiss', 'ignore', 'overlook', 'fail', 'miss'];
        const text = option.text.toLowerCase();
        return missedCueKeywords.some(keyword => text.includes(keyword));
    }

    calculateCommunicationScore(option) {
        // Calculate communication effectiveness score based on choice type only
        if (option.type === 'positive') return 100;
        if (option.type === 'neutral') return 50;
        return 0;
    }

    retryStage(type) {
        const stage = gameState.currentScenario.stages[gameState.currentStage];
        const retryMessage = type === 'negative' ? 
            i18n.t('game.retryNegative') : 
            i18n.t('game.retryNeutral');
        
        const typingIndicator = DialogueManager.showTypingIndicator('trainer');

        this.scheduleTimeout(() => {
            typingIndicator.remove();
            DialogueManager.addMessage('trainer', retryMessage);

            this.scheduleTimeout(() => {
                document.getElementById('choice-container').style.display = 'block';
                this.showChoices(stage.options, stage.prompt);
            }, 1500);
        }, CONFIG.TIMERS.TYPING_DELAY);
    }

    continueToNextStage() {
        document.getElementById('choice-container').style.display = 'block';
        this.loadStage(gameState.currentStage + 1);
    }

    showFinalRevelation() {
        const trainerFeedback = document.getElementById('trainer-feedback');
        const trainerText = document.getElementById('trainer-text');
        const scenario = gameState.currentScenario;
        
        const analysis = this.analyzePerformance();
        
        // Reset classes and add scenario-complete to allow expansion
        trainerFeedback.className = '';
        trainerFeedback.id = 'trainer-feedback';
        trainerFeedback.classList.add('scenario-complete');
        
        if (analysis.performanceLevel === 'perfect' || analysis.performanceLevel === 'good') {
            trainerFeedback.classList.add('positive');
        } else if (analysis.performanceLevel === 'poor') {
            trainerFeedback.classList.add('negative');
        }
        
        this.checkAndAwardBadges(analysis.performanceLevel, analysis.perfectRun);
        
        const performanceMessages = scenario.performanceReviews?.[analysis.performanceLevel] || {};
        
        // Build key lessons HTML if available
        let keyLessonsHTML = '';
        if (scenario.finalMessage?.keyLessons && scenario.finalMessage.keyLessons.length > 0) {
            keyLessonsHTML = `
                <div class="key-lessons">
                    <h4>📚 ${esc(i18n.t('review.keyLessons') || 'Key Lessons')}</h4>
                    <ul>
                        ${scenario.finalMessage.keyLessons.map(lesson => `<li>${linkifyLaw(esc(lesson), scenario.lawContext)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let finalHTML = `
            <div class="final-score">
                <span class="score-emoji">${esc(performanceMessages.emoji || '🎯')}</span>
                <div>
                    <div>${esc(performanceMessages.title || i18n.t('review.complete'))}</div>
                    <div>${analysis.percentage}% — ${esc(i18n.t('review.grade') || 'Grade')} ${analysis.grade}</div>
                </div>
            </div>

            <div class="revelation message-text">
                ${paragraphsHTML(scenario.finalMessage?.revelation || i18n.t('review.wellDone'), scenario.lawContext)}
            </div>

            ${keyLessonsHTML}

            <button class="trainer-view-report-btn" onclick="gameController.prepareGameReview()">
                📊 ${esc(i18n.t('review.viewComplete'))}
            </button>
        `;
        
        trainerText.innerHTML = finalHTML;
        trainerFeedback.style.display = 'block';
        trainerFeedback.classList.add('show');
        
        this.playSound('victory');
        
        // Hide the floating review button since we have one in the trainer feedback
        (()=>{const btn=document.getElementById('show-review-button')||document.querySelector('.show-review-button'); if(btn){btn.classList.remove('show'); btn.style.display = 'none';}})();
        
        this.saveProgress();
    }

    analyzePerformance() {
        const totalStages = gameState.metrics.totalInteractiveStages || gameState.totalStages || gameState.interactiveStageCount || 1;
        const maxPoints = totalStages * 100;
        const earnedPoints = gameState.metrics.earnedPoints || 0;
        const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
        const grade = this.percentageToGrade(percentage);
        const perfectRun = percentage >= 100;
        const totalMistakes = gameState.gameHistory.filter(item => item.type === 'negative').length;

        let performanceLevel = 'poor';
        if (percentage >= 100) performanceLevel = 'perfect';
        else if (percentage >= 80) performanceLevel = 'good';
        else if (percentage >= 50) performanceLevel = 'average';
        
        const patterns = this.identifyPatterns();
        
        return {
            performanceLevel,
            perfectRun,
            percentage,
            grade,
            totalMistakes,
            patterns
        };
    }

    percentageToGrade(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    identifyPatterns() {
        return {
            escalation: gameState.metrics.escalations || 0,
            deescalation: gameState.metrics.deescalations || 0,
            empathy: gameState.metrics.empathyShown || 0,
            procedural: 0,
            missed_cues: gameState.metrics.missedCues || 0
        };
    }

    checkAndAwardBadges(performanceLevel, perfectRun) {
        const scenario = gameState.currentScenario;
        const scenarioConfig = gameState.scenarios.find(s => s.id === scenario.id);
        
        this.earnBadge(`scenario-${scenario.id}-complete`);
        
        if (perfectRun) {
            this.earnBadge(`perfect-scenario-${scenario.id}`);
        }
        
        if (scenarioConfig?.badges) {
            const totalStages = gameState.metrics.totalInteractiveStages || gameState.totalStages || gameState.interactiveStageCount || 1;
            const maxPoints = totalStages * 100;
            const earnedPoints = gameState.metrics.earnedPoints || 0;
            const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
            Object.keys(scenarioConfig.badges).forEach(badgeId => {
                const requirement = scenarioConfig.badges[badgeId];
                if (percentage >= (requirement.minScore || 0)) {
                    this.earnBadge(badgeId);
                }
            });
        }
        
        const allComplete = gameState.scenarios.filter(s => !s.isCustom).every(s =>
            gameState.earnedBadges.includes(`scenario-${s.id}-complete`)
        );
        if (allComplete) {
            this.earnBadge('master-communicator');
        }
    }

    earnBadge(badgeId) {
        if (gameState.earnedBadges.includes(badgeId)) return;
        
        gameState.earnedBadges.push(badgeId);
        this.saveProgress();
        
        const badge = gameState.badges[badgeId];
        if (badge) {
            this.showBadgeEarned(badge);
        }
    }

    showBadgeEarned(badge) {
        const popup = document.getElementById('badge-earned');
        const iconEl = document.getElementById('badge-icon-large');
        const descEl = document.getElementById('badge-earned-desc');
        
        iconEl.textContent = badge.icon || '🏅';
        descEl.innerHTML = `<strong>${esc(badge.name)}</strong><br>${esc(badge.description)}`;
        
        popup.classList.add('show');
        this.playSound('fanfare');
    }

    closeBadgePopup() {
        document.getElementById('badge-earned').classList.remove('show');
    }

    async prepareGameReview() {
        // Review data (gameState.reviewData) was already loaded by loadReviewData()
        // during scenario selection — it is the single source of truth.
        this.showGameReview();
        this.showGameReviewModal();
    }

    showComprehensiveReview() {
        // [Keep existing comprehensive review code - too long to include here]
        // The comprehensive review implementation remains the same as before
        this.showGameReview(); // For now, fallback to basic review
    }

    showBasicReview() {
        this.showGameReview();
    }

    showGameReview() {
        const reviewContent = document.getElementById('review-content');
        const totalStages = gameState.metrics.totalInteractiveStages || gameState.totalStages || gameState.interactiveStageCount || 1;
        const maxPoints = totalStages * 100;
        const earnedPoints = gameState.metrics.earnedPoints || 0;
        const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
        const grade = this.percentageToGrade(percentage);
        const perfectRun = percentage >= 100;
        const totalMistakes = gameState.gameHistory.filter(item => item.type === 'negative').length;
        
        let performanceRating = perfectRun ? i18n.t('review.perfect') : 
            percentage >= 80 ? i18n.t('review.excellent') : 
            percentage >= 60 ? i18n.t('review.good') : i18n.t('review.needsImprovement');
        
        const gradeLabel = i18n.t('review.grade') || 'Grade';
        let reviewHTML = `
            <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 15px; margin-bottom: 2rem;">
                <h3 style="font-size: 2rem; margin-bottom: 1rem;">${performanceRating}</h3>
                <p style="font-size: 1.5rem;">${percentage}% — ${gradeLabel} ${grade}</p>
            </div>
        `;
        if (typeof ReviewManager !== 'undefined' && gameState.reviewData) {
            const detailed = ReviewManager.buildDetailedReview();
            if (detailed) reviewHTML += detailed;
        }
        reviewHTML += `
            <div style="text-align: center; margin-top: 2rem;">
                <button class="submit-choice" onclick="location.reload()">
                    ${i18n.t('review.restart')}
                </button>
            </div>
        `;
        
        reviewContent.innerHTML = reviewHTML;
    }

    showGameReviewModal() {
        const modal = document.getElementById('review-modal-overlay');
        modal.classList.add('show');
    }

    closeReviewModal() {
        const modal = document.getElementById('review-modal-overlay');
        modal.classList.remove('show');
    }

    async reloadWithLanguage(lang) {
        const previousState = gameState.currentState;
        gameState.setState('LOADING');
        UIManager.showLoading();
        
        try {
            await this.loadGameData(lang);
            UIManager.hideLoading();
            
            // Show scenario selection if we were on menu/idle or the scenario selection was visible
            const scenarioSelection = document.getElementById('scenario-selection');
            const wasShowingScenarios = scenarioSelection && !scenarioSelection.classList.contains('hide') && scenarioSelection.style.display !== 'none';
            
            if (previousState === 'MENU' || previousState === 'IDLE' || previousState === 'INIT' || wasShowingScenarios) {
                gameState.setState('MENU');
                UIManager.showScenarioSelection();
            } else {
                // Restore previous state if we were in the middle of something else
                gameState.setState(previousState);
            }
        } catch (error) {
            console.error('Error reloading with language:', error);
            UIManager.showError(i18n.t('error.languageSwitch'), error.message);
        }
    }

    startChoiceTimer() {
        const timerContainer = document.getElementById('choice-timer');
        const timerFill = document.getElementById('timer-fill');
        const timerValue = document.getElementById('timer-value');
        
        timerContainer.classList.add('show');
        gameState.timeRemaining = CONFIG.TIMERS.CHOICE_TIMEOUT;
        
        gameState.choiceTimer = setInterval(() => {
            gameState.timeRemaining -= 1000;
            const percentage = (gameState.timeRemaining / CONFIG.TIMERS.CHOICE_TIMEOUT) * 100;
            timerFill.style.width = `${percentage}%`;
            timerValue.textContent = `${Math.ceil(gameState.timeRemaining / 1000)}s`;
            
            if (gameState.timeRemaining <= 0) {
                this.stopChoiceTimer();
                if (!gameState.isSubmitting) {
                    this.autoSubmitChoice();
                }
            }
        }, 1000);
    }

    stopChoiceTimer() {
        if (gameState.choiceTimer) {
            clearInterval(gameState.choiceTimer);
            gameState.choiceTimer = null;
            document.getElementById('choice-timer').classList.remove('show');
        }
    }

    pauseTimer() {
        if (gameState.choiceTimer) {
            clearInterval(gameState.choiceTimer);
        }
    }

    resumeTimer() {
        /* Timer disabled - no-op */
    }

    autoSubmitChoice() {
        if (gameState.isSubmitting) return;
        if (gameState.selectedChoice === null) {
            const firstChoice = document.querySelector('.choice-button');
            if (firstChoice) {
                firstChoice.click();
            }
        }
        if (gameState.selectedChoice !== null) {
            this.submitChoice();
        }
    }

    playSound(type) {
        if (gameState && gameState.soundEnabled === false) return;
        let audio;
        switch(type) {
            case 'success':
                audio = document.getElementById('success-sound');
                break;
            case 'error':
                audio = document.getElementById('error-sound');
                break;
            case 'click':
                audio = document.getElementById('click-sound');
                break;
            case 'victory':
                audio = document.getElementById('victory-sound');
                break;
            case 'fanfare':
                audio = document.getElementById('fanfare-sound');
                break;
            case 'good':
                audio = document.getElementById('good-sound');
                break;
            default:
                break;
        }
        if (audio) {
            audio.volume = 0.3;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
}