/**
 * core.js - Enhanced Core Classes with Review Support
 * Includes: I18nManager, GameState with comprehensive tracking
 */

// ============================================
// INTERNATIONALIZATION SYSTEM
// ============================================
class I18nManager {
    constructor() {
        this.currentLanguage = this.getSavedLanguage() || CONFIG.DEFAULT_LANGUAGE;
        this.translations = {};
        this.loadedTranslations = {};
    }

    getSavedLanguage() {
        // localStorage can be unavailable (blocked third-party storage in iframe embeds, privacy modes)
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE);
        } catch (e) {
            console.warn('localStorage unavailable, using default language:', e);
            return null;
        }
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.updateUI();
    }

    async loadTranslations(lang) {
        if (this.loadedTranslations[lang]) {
            this.translations = this.loadedTranslations[lang];
            return;
        }

        try {
            const response = await fetch(CONFIG.BASE_URL + CONFIG.FILE_PATHS.translations[lang]);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            
            const translations = await response.json();
            this.loadedTranslations[lang] = translations;
            this.translations = translations;
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    async setLanguage(lang) {
        if (!CONFIG.SUPPORTED_LANGUAGES.includes(lang)) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        this.currentLanguage = lang;
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
        } catch (e) {
            console.warn('Could not persist language preference:', e);
        }
        
        // Update body data attribute for CSS adjustments
        document.body.setAttribute('data-lang', lang);
        
        // Update language switcher buttons
        document.querySelectorAll('.language-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        // Load new translations
        await this.loadTranslations(lang);
        this.updateUI();

        // Reload scenarios if we have a game controller
        // This should happen whenever language changes and scenarios might be visible
        if (typeof gameController !== 'undefined' && gameController) {
            const state = gameState?.currentState;
            // Reload for any state where scenario selection might be shown or game is active
            if (state === 'MENU' || state === 'IDLE' || state === 'INIT' || state === 'PLAYING') {
                await gameController.reloadWithLanguage(lang);
            }
        }
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'BUTTON' || element.textContent) {
                    element.textContent = translation;
                }
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }

    t(key, params = {}) {
        let translation = this.getTranslation(key);
        
        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            const regex = new RegExp(`{{${param}}}`, 'g');
            translation = translation.replace(regex, params[param]);
        });
        
        return translation;
    }
}

// ============================================
// ENHANCED STATE MANAGEMENT SYSTEM
// ============================================
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentState = 'INIT';
        this.currentLanguage = CONFIG.DEFAULT_LANGUAGE;
        this.scenarios = [];
        this.badges = {};
        this.currentScenario = null;
        this.currentStage = 0;
        this.selectedChoice = null;
        this.gameHistory = [];
        this.score = 0;
        this.maxScore = 0;
        this.stageAttempts = {};
        this.earnedBadges = [];
        this.timeRemaining = CONFIG.TIMERS.CHOICE_TIMEOUT;
        this.choiceTimer = null;
        this.isSubmitting = false;
        try {
            this.soundEnabled = localStorage.getItem(CONFIG.STORAGE_KEYS.SOUND_ENABLED) !== 'false';
        } catch (e) {
            this.soundEnabled = true;
        }
        
        // Enhanced tracking for comprehensive review
        this.choiceTypes = []; // Track pattern of choices (positive/neutral/negative)
        this.communicationScores = []; // Track communication effectiveness
        this.responseTimings = []; // Track how quickly choices were made
        this.criticalMoments = []; // Track handling of critical situations
        this.emotionalIntelligenceScores = []; // Track empathy and emotional awareness
        this.proceduralCompliance = []; // Track adherence to procedures
        
        // Metrics for pattern analysis
        this.metrics = {
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
        
        // Session tracking
        this.sessionStartTime = Date.now();
        this.sessionEndTime = null;
        this.totalSessionTime = 0;
    }

    setState(newState) {
        console.log(`State transition: ${this.currentState} → ${newState}`);
        this.previousState = this.currentState;
        this.currentState = newState;
        this.onStateChange(newState);
    }

    onStateChange(state) {
        switch(state) {
            case 'LOADING':
                UIManager.showLoading();
                break;
            case 'MENU':
                UIManager.showScenarioSelection();
                break;
            case 'INTRO':
                UIManager.showInstructorIntro();
                break;
            case 'PLAYING':
                UIManager.showGameView();
                break;
            case 'REVIEW':
                UIManager.showReview();
                this.sessionEndTime = Date.now();
                this.totalSessionTime = this.sessionEndTime - this.sessionStartTime;
                break;
            case 'ERROR':
                UIManager.showError();
                break;
        }
    }

    recordChoice(choice, stage, option) {
        // Update metrics
        this.metrics.totalChoices++;
        
        switch(option.type) {
            case 'positive':
                this.metrics.positiveChoices++;
                this.metrics.deescalations++;
                break;
            case 'partially_positive':
                this.metrics.partiallyPositiveChoices++;
                this.metrics.deescalations++;
                break;
            case 'neutral':
                this.metrics.neutralChoices++;
                break;
            case 'negative':
                this.metrics.negativeChoices++;
                this.metrics.escalations++;
                break;
        }
        
        // Track if this is a retry
        if (this.stageAttempts[stage] > 1) {
            this.metrics.retryCount++;
        }
        
        // Check for critical moments (e.g., mental health crisis, child interaction)
        if (this.isCriticalStage(stage)) {
            if (option.type === 'positive') {
                this.metrics.criticalSuccesses++;
            } else {
                this.metrics.criticalFailures++;
            }
            
            this.criticalMoments.push({
                stage: stage,
                success: option.type === 'positive',
                choice: choice,
                impact: option.feedback
            });
        }
        
        // Analyze for empathy
        if (this.detectsEmpathy(option)) {
            this.metrics.empathyShown++;
        }
        
        // Check for missed cues
        if (option.type === 'negative' && this.isMissedCue(option)) {
            this.metrics.missedCues++;
        }
    }

    isCriticalStage(stageIndex) {
        // Define critical stages based on scenario
        // For domestic crisis: child interaction (stage 4) and mental health (stage 5)
        const criticalStages = [3, 4, 5]; // 0-indexed
        return criticalStages.includes(stageIndex);
    }

    detectsEmpathy(option) {
        // Simple empathy detection based on keywords and type
        const empathyKeywords = ['understand', 'sorry', 'help', 'listen', 'concern', 'support'];
        const text = option.text.toLowerCase();
        return option.type === 'positive' && 
               empathyKeywords.some(keyword => text.includes(keyword));
    }

    isMissedCue(option) {
        // Check if negative choice represents missing important cues
        const missedCueKeywords = ['dismiss', 'ignore', 'threaten', 'force', 'demand'];
        const text = option.text.toLowerCase();
        return missedCueKeywords.some(keyword => text.includes(keyword));
    }

    calculatePerformanceMetrics() {
        const totalStages = this.metrics.totalInteractiveStages || 1;
        const maxPoints = totalStages * 100;
        const percentage = maxPoints > 0 ? (this.metrics.earnedPoints / maxPoints) * 100 : 0;

        // Calculate performance level
        let level = 'poor';
        if (percentage >= 100) {
            level = 'perfect';
        } else if (percentage >= 80) {
            level = 'good';
        } else if (percentage >= 50) {
            level = 'average';
        }
        
        // Calculate communication effectiveness
        const communicationScore = (
            (this.metrics.deescalations * 2) + 
            (this.metrics.empathyShown * 1.5) - 
            (this.metrics.escalations * 2) - 
            (this.metrics.missedCues * 1)
        ) / this.metrics.totalChoices * 100;
        
        // Calculate decision quality
        const decisionQuality = (
            (this.metrics.positiveChoices * 2) + 
            (this.metrics.neutralChoices * 1) - 
            (this.metrics.negativeChoices * 2)
        ) / this.metrics.totalChoices * 50;
        
        return {
            score: actualPoints,
            maxScore: totalPossiblePoints,
            percentage: Math.round(percentage),
            level: level,
            communicationEffectiveness: Math.max(0, Math.min(100, Math.round(communicationScore))),
            decisionQuality: Math.max(0, Math.min(100, Math.round(decisionQuality))),
            criticalMomentSuccess: this.metrics.criticalSuccesses / 
                (this.metrics.criticalSuccesses + this.metrics.criticalFailures) * 100,
            retryRate: (this.metrics.retryCount / this.metrics.totalChoices) * 100,
            sessionDuration: Math.round(this.totalSessionTime / 1000 / 60) // in minutes
        };
    }

    exportSessionData() {
        // Export all session data for potential analysis or reporting
        return {
            scenario: this.currentScenario?.id,
            timestamp: new Date().toISOString(),
            performance: this.calculatePerformanceMetrics(),
            metrics: this.metrics,
            history: this.gameHistory,
            criticalMoments: this.criticalMoments,
            patterns: {
                choiceTypes: this.choiceTypes,
                communicationScores: this.communicationScores,
                emotionalIntelligence: this.emotionalIntelligenceScores
            }
        };
    }
}