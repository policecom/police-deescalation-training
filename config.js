/**
 * config.js - Enhanced Configuration with Review System
 * Police De-escalation Training System
 */

const CONFIG = {
    // ?base= override is only accepted as a same-origin relative path (no absolute URLs,
    // no protocol-relative //, no data:/javascript: schemes) to prevent loading attacker-controlled JSON.
    BASE_URL: (function(){ try{ const u=new URL(window.location.href); const b=u.searchParams.get('base'); if(b && !/^[a-z]+:/i.test(b) && b.indexOf('//') !== 0){ return b.endsWith('/')?b:b+'/'; } var path=u.pathname.replace(/\/[^/]*$/, '/'); return u.origin + path; }catch(e){} return ''; })(),
    SUPPORTED_LANGUAGES: ['en', 'cs', 'lt', 'ro'],
    DEFAULT_LANGUAGE: 'en',
    FILE_PATHS: {
        translations: {
            en: 'translations/ui-en.json',
            cs: 'translations/ui-cs.json',
            lt: 'translations/ui-lt.json',
            ro: 'translations/ui-ro.json'
        },
        scenariosIndex: {
            en: 'scenarios/index-en.json',
            cs: 'scenarios/index-cs.json',
            lt: 'scenarios/index-lt.json',
            ro: 'scenarios/index-ro.json'
        },
        scenarios: {
            en: {
                1: 'scenarios/en/scenario-1-en.json',
                2: 'scenarios/en/scenario-2-en.json',
                3: 'scenarios/en/scenario-3-en.json',
                4: 'scenarios/en/scenario-4-en.json',
                5: 'scenarios/en/scenario-5-en.json',
                6: 'scenarios/en/scenario-6-en.json',
                7: 'scenarios/en/scenario-7-en.json',
                'domestic-crisis': 'scenarios/en/scenario-domestic-crisis-en.json',
                'custody-exchange': 'scenarios/en/scenario-custody-exchange-en.json',
                'hospital-disturbance': 'scenarios/en/scenario-hospital-disturbance-en.json',
                'road-rage': 'scenarios/en/scenario-road-rage-en.json',
                'street-vendor': 'scenarios/en/scenario-street-vendor-en.json',
                'traffic-stop': 'scenarios/en/scenario-traffic-stop-en.json',
                'youth-park': 'scenarios/en/scenario-youth-park-en.json'
            },
            cs: {
                1: 'scenarios/cs/scenario-1-cs.json',
                2: 'scenarios/cs/scenario-2-cs.json',
                3: 'scenarios/cs/scenario-3-cs.json',
                4: 'scenarios/cs/scenario-4-cs.json',
                5: 'scenarios/cs/scenario-5-cs.json',
                6: 'scenarios/cs/scenario-6-cs.json',
                7: 'scenarios/cs/scenario-7-cs.json',
                'domestic-crisis': 'scenarios/cs/scenario-domestic-crisis-cs.json',
                'custody-exchange': 'scenarios/cs/scenario-custody-exchange-cs.json',
                'hospital-disturbance': 'scenarios/cs/scenario-hospital-disturbance-cs.json',
                'road-rage': 'scenarios/cs/scenario-road-rage-cs.json',
                'street-vendor': 'scenarios/cs/scenario-street-vendor-cs.json',
                'traffic-stop': 'scenarios/cs/scenario-traffic-stop-cs.json',
                'youth-park': 'scenarios/cs/scenario-youth-park-cs.json'
            },
            lt: {
                1: 'scenarios/lt/scenario-1-lt.json',
                2: 'scenarios/lt/scenario-2-lt.json',
                3: 'scenarios/lt/scenario-3-lt.json',
                4: 'scenarios/lt/scenario-4-lt.json',
                5: 'scenarios/lt/scenario-5-lt.json',
                6: 'scenarios/lt/scenario-6-lt.json',
                7: 'scenarios/lt/scenario-7-lt.json',
                'domestic-crisis': 'scenarios/lt/scenario-domestic-crisis-lt.json',
                'custody-exchange': 'scenarios/lt/scenario-custody-exchange-lt.json',
                'hospital-disturbance': 'scenarios/lt/scenario-hospital-disturbance-lt.json',
                'road-rage': 'scenarios/lt/scenario-road-rage-lt.json',
                'street-vendor': 'scenarios/lt/scenario-street-vendor-lt.json',
                'traffic-stop': 'scenarios/lt/scenario-traffic-stop-lt.json',
                'youth-park': 'scenarios/lt/scenario-youth-park-lt.json'
            },
            ro: {
                1: 'scenarios/ro/scenario-1-ro.json',
                2: 'scenarios/ro/scenario-2-ro.json',
                3: 'scenarios/ro/scenario-3-ro.json',
                4: 'scenarios/ro/scenario-4-ro.json',
                5: 'scenarios/ro/scenario-5-ro.json',
                6: 'scenarios/ro/scenario-6-ro.json',
                7: 'scenarios/ro/scenario-7-ro.json',
                'domestic-crisis': 'scenarios/ro/scenario-domestic-crisis-ro.json',
                'custody-exchange': 'scenarios/ro/scenario-custody-exchange-ro.json',
                'hospital-disturbance': 'scenarios/ro/scenario-hospital-disturbance-ro.json',
                'road-rage': 'scenarios/ro/scenario-road-rage-ro.json',
                'street-vendor': 'scenarios/ro/scenario-street-vendor-ro.json',
                'traffic-stop': 'scenarios/ro/scenario-traffic-stop-ro.json',
                'youth-park': 'scenarios/ro/scenario-youth-park-ro.json'
            }
        },
        // NEW: Review data files for comprehensive analysis
        reviews: {
            en: {
                1: 'scenarios/reviews/review-1-en.json',
                2: 'scenarios/reviews/review-2-en.json',
                3: 'scenarios/reviews/review-3-en.json',
                4: 'scenarios/reviews/review-4-en.json',
                5: 'scenarios/reviews/review-5-en.json',
                6: 'scenarios/reviews/review-6-en.json',
                7: 'scenarios/reviews/review-7-en.json',
                'domestic-crisis': 'scenarios/reviews/review-domestic-crisis-en.json',
                'custody-exchange': 'scenarios/reviews/review-custody-exchange-en.json',
                'hospital-disturbance': 'scenarios/reviews/review-hospital-disturbance-en.json',
                'road-rage': 'scenarios/reviews/review-road-rage-en.json',
                'street-vendor': 'scenarios/reviews/review-street-vendor-en.json',
                'traffic-stop': 'scenarios/reviews/review-traffic-stop-en.json',
                'youth-park': 'scenarios/reviews/review-youth-park-en.json'
            },
            cs: {
                1: 'scenarios/reviews/review-1-cs.json',
                2: 'scenarios/reviews/review-2-cs.json',
                3: 'scenarios/reviews/review-3-cs.json',
                4: 'scenarios/reviews/review-4-cs.json',
                5: 'scenarios/reviews/review-5-cs.json',
                6: 'scenarios/reviews/review-6-cs.json',
                7: 'scenarios/reviews/review-7-cs.json',
                'domestic-crisis': 'scenarios/reviews/review-domestic-crisis-cs.json',
                'custody-exchange': 'scenarios/reviews/review-custody-exchange-cs.json',
                'hospital-disturbance': 'scenarios/reviews/review-hospital-disturbance-cs.json',
                'road-rage': 'scenarios/reviews/review-road-rage-cs.json',
                'street-vendor': 'scenarios/reviews/review-street-vendor-cs.json',
                'traffic-stop': 'scenarios/reviews/review-traffic-stop-cs.json',
                'youth-park': 'scenarios/reviews/review-youth-park-cs.json'
            },
            lt: {
                1: 'scenarios/reviews/review-1-lt.json',
                2: 'scenarios/reviews/review-2-lt.json',
                3: 'scenarios/reviews/review-3-lt.json',
                4: 'scenarios/reviews/review-4-lt.json',
                5: 'scenarios/reviews/review-5-lt.json',
                6: 'scenarios/reviews/review-6-lt.json',
                7: 'scenarios/reviews/review-7-lt.json',
                'domestic-crisis': 'scenarios/reviews/review-domestic-crisis-lt.json',
                'custody-exchange': 'scenarios/reviews/review-custody-exchange-lt.json',
                'hospital-disturbance': 'scenarios/reviews/review-hospital-disturbance-lt.json',
                'road-rage': 'scenarios/reviews/review-road-rage-lt.json',
                'street-vendor': 'scenarios/reviews/review-street-vendor-lt.json',
                'traffic-stop': 'scenarios/reviews/review-traffic-stop-lt.json',
                'youth-park': 'scenarios/reviews/review-youth-park-lt.json'
            },
            ro: {
                1: 'scenarios/reviews/review-1-ro.json',
                2: 'scenarios/reviews/review-2-ro.json',
                3: 'scenarios/reviews/review-3-ro.json',
                4: 'scenarios/reviews/review-4-ro.json',
                5: 'scenarios/reviews/review-5-ro.json',
                6: 'scenarios/reviews/review-6-ro.json',
                7: 'scenarios/reviews/review-7-ro.json',
                'domestic-crisis': 'scenarios/reviews/review-domestic-crisis-ro.json',
                'custody-exchange': 'scenarios/reviews/review-custody-exchange-ro.json',
                'hospital-disturbance': 'scenarios/reviews/review-hospital-disturbance-ro.json',
                'road-rage': 'scenarios/reviews/review-road-rage-ro.json',
                'street-vendor': 'scenarios/reviews/review-street-vendor-ro.json',
                'traffic-stop': 'scenarios/reviews/review-traffic-stop-ro.json',
                'youth-park': 'scenarios/reviews/review-youth-park-ro.json'
            }
        }
    },
    TIMERS: {
        TYPING_DELAY: 800,
        MESSAGE_DELAY: 1500,
        CHOICE_TIMEOUT: 30000,
        FEEDBACK_DELAY: 2000
    },
    ANIMATIONS: {
        FADE_DURATION: 300,
        SLIDE_DURATION: 500
    },
    STORAGE_KEYS: {
        BADGES: 'deescalation-badges',
        PROGRESS: 'deescalation-progress',
        SETTINGS: 'deescalation-settings',
        LANGUAGE: 'deescalation-language',
        SOUND_ENABLED: 'deescalation-sound-enabled',
        SESSION_HISTORY: 'deescalation-sessions' // NEW: Store session performance data
    },
    // NEW: Review system configuration
    REVIEW: {
        CRITICAL_STAGES: {
            'domestic-crisis': [3, 4, 5], // Child interaction and mental health stages
            'default': [] // Default for scenarios without defined critical stages
        },
        PERFORMANCE_THRESHOLDS: {
            perfect: 100,
            good: 80,
            average: 50,
            poor: 0
        },
        PATTERN_KEYWORDS: {
            empathy: ['understand', 'sorry', 'help', 'listen', 'concern', 'support', 'feeling'],
            escalation: ['force', 'demand', 'threaten', 'yell', 'aggressive', 'confront'],
            deescalation: ['calm', 'peaceful', 'help', 'understand', 'talk', 'discuss'],
            missed_cues: ['dismiss', 'ignore', 'overlook', 'fail', 'miss']
        },
        METRICS_WEIGHTS: {
            communication: 0.3,
            empathy: 0.25,
            procedure: 0.2,
            safety: 0.15,
            decision_speed: 0.1
        },
        MIN_STAGES_FOR_PATTERN: 3, // Minimum stages to identify a pattern
        EXPORT_FORMAT: 'json', // Format for exporting session data
        ENABLE_ANALYTICS: true, // Enable detailed analytics tracking
        SAVE_SESSION_HISTORY: true // Save all session data for later analysis
    },
    // NEW: Scoring configuration
    SCORING: {
        CONFIDENCE_MULTIPLIER: true, // Whether to apply confidence multiplier to scores
        RETRY_PENALTY: 0.8, // Score multiplier for retry attempts
        TIME_BONUS: {
            enabled: true,
            fast: 10, // Under 10 seconds
            medium: 5, // 10-20 seconds
            slow: 0 // Over 20 seconds
        },
        PERFECT_RUN_BONUS: 50, // Bonus points for perfect run
        NO_RETRY_BONUS: 20, // Bonus for completing without retries
        EMPATHY_BONUS: 10, // Bonus per empathetic response
        CRITICAL_SUCCESS_BONUS: 25 // Bonus for handling critical moments well
    },
    // NEW: UI Configuration
    UI: {
        SHOW_TIMER: true,
        SHOW_CONFIDENCE: false,
        SHOW_SCORE: true,
        SHOW_STAGE_PROGRESS: true,
        ENABLE_KEYBOARD_SHORTCUTS: true,
        AUTO_SCROLL_DIALOGUE: true,
        SHOW_TYPING_INDICATOR: true,
        ENABLE_SOUND_EFFECTS: true,
        REVIEW_CHART_COLORS: {
            positive: '#10b981',
            neutral: '#f59e0b',
            negative: '#ef4444',
            empathy: '#667eea',
            escalation: '#dc2626'
        }
    },
    // NEW: Debug settings
    DEBUG: {
        ENABLED: false,
        LOG_CHOICES: false,
        LOG_SCORES: false,
        LOG_PATTERNS: false,
        SKIP_ANIMATIONS: false,
        SHOW_ALL_STAGES: false,
        UNLIMITED_TIME: false
    }
};

/**
 * HTML-escape helper for data-derived strings injected via innerHTML.
 * All scenario/review/translation JSON text is plain text, so it must be
 * escaped before being interpolated into HTML templates (XSS hardening).
 */
function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Turn Czech statute citations in ALREADY-ESCAPED text into links to the
 * public law collection (zakonyprolidi.cz) so players can read the source.
 * Hrefs are built only from matched digits / a fixed act table, so the
 * output stays safe to inject via innerHTML.
 */
function linkifyLaw(html, lawContext) {
    const ODST_PISM = '((?:\\s+odst\\.\\s*\\d+)?(?:\\s+písm\\.\\s*[a-z]\\))?(?:\\s+a\\s+násl\\.)?)';
    // Acts commonly referred to by name (slug = zakonyprolidi.cz/cs/<slug>)
    const NAMED_ACTS = [
        ['trestního\\s+zákoníku|trestní\\s+zákoník|tr\\.\\s*zák\\.', '2009-40'],
        ['trestního\\s+řádu|tr\\.\\s*řádu', '1961-141'],
        ['zákon[au]?\\s+o\\s+[Pp]olicii(?:\\s+ČR)?', '2008-273'],
        ['zákon[au]?\\s+o\\s+silničním\\s+provozu', '2000-361'],
        ['zákon[auě]?\\s+o\\s+zdravotních\\s+službách', '2011-372'],
    ];
    const anchor = (par) => {
        if (!par) return '';
        const m = par.match(/(\d+[a-z]?)(?:[^\d]*odst\.\s*(\d+))?(?:.*?písm\.\s*([a-z])\))?/);
        if (!m) return '';
        return '#p' + m[1] + (m[2] ? '-' + m[2] : '') + (m[3] ? '-' + m[3] : '');
    };
    const link = (slug, par, label) =>
        `<a class="law-link" href="https://www.zakonyprolidi.cz/cs/${slug}${anchor(par)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    // Apply fn only to segments not already inside an <a> element
    const outsideAnchors = (text, fn) =>
        text.split(/(<a\b[^>]*>[^]*?<\/a>)/g).map((seg, i) => (i % 2 ? seg : fn(seg))).join('');

    let out = String(html == null ? '' : html);
    // 1) "§ X [odst. N] [písm. y)] zák./zákona č. N/YYYY Sb." — paragraph with act number
    out = outsideAnchors(out, (t) => t.replace(
        new RegExp('§\\s*(\\d+[a-z]?)' + ODST_PISM + '\\s+(?:zákona|zák\\.|zákon[auěem]*)\\s*(?:č\\.\\s*)?(\\d{1,3})\\/(\\d{4})\\s*Sb\\.', 'g'),
        (m, par, tail, num, year) => link(`${year}-${num}`, `§ ${par}${tail}`, m)
    ));
    // 2) "§ X trestního zákoníku" and other acts referenced by name
    for (const [name, slug] of NAMED_ACTS) {
        out = outsideAnchors(out, (t) => t.replace(
            new RegExp('§\\s*(\\d+[a-z]?)' + ODST_PISM + '\\s+(?:' + name + ')', 'g'),
            (m, par, tail) => link(slug, `§ ${par}${tail}`, m)
        ));
    }
    // 3) bare "§ N" resolved through the scenario's lawContext map
    //    (scenario JSON: "lawContext": { "11": "2008-273", ... })
    if (lawContext) {
        out = outsideAnchors(out, (t) => t.replace(
            new RegExp('§\\s*(\\d+[a-z]?)' + ODST_PISM, 'g'),
            (m, par, tail) => {
                const slug = lawContext[par.toLowerCase()];
                return slug ? link(slug, `§ ${par}${tail}`, m) : m;
            }
        ));
    }
    // 4) bare act references: "zák. č. N/YYYY Sb." / "N/YYYY Sb."
    out = outsideAnchors(out, (t) => t.replace(
        /((?:zákona|zák\.|zákon[auěem]*)\s*(?:č\.\s*)?)?(\d{1,3})\/(\d{4})\s*Sb\./g,
        (m, pre, num, year) => link(`${year}-${num}`, '', m)
    ));
    return out;
}

/**
 * Render plain dialogue/revelation text as HTML: escape, linkify statutes,
 * and split on blank lines into <p> paragraphs for readability.
 */
function paragraphsHTML(rawText, lawContext) {
    return String(rawText == null ? '' : rawText)
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length)
        .map(p => `<p>${linkifyLaw(esc(p), lawContext)}</p>`)
        .join('');
}

// Category detection for feedback labels (Proč / DŮSLEDKY / Reflexe and their
// EN/LT/RO equivalents) — used to pick an icon and a section class.
const FEEDBACK_CATEGORIES = [
    { icon: '💡', cls: 'fb-why',      keys: ['proč', 'why', 'kodėl', 'de ce'] },
    { icon: '➡️', cls: 'fb-effect',   keys: ['důsledky', 'dusledky', 'consequences', 'pasekmės', 'padariniai', 'consecințe', 'consecinte'] },
    { icon: '🤔', cls: 'fb-reflect',  keys: ['reflexe', 'reflection', 'refleksija', 'reflectare', 'reflecție', 'reflectie'] },
];

/**
 * Format a choice-feedback string into labelled blocks. The data uses
 * "Proč: … | DŮSLEDKY: … | Reflexe: …" (localised label + '|' separator),
 * so we split on '|', pull the leading "Label:" off each part, and render
 * each as an icon + heading + body. Language-agnostic: the icon is chosen by
 * matching the label keywords, falling back to position, then to none.
 * Statute citations in the body stay clickable.
 */
function formatFeedbackHTML(rawText, lawContext) {
    const parts = String(rawText == null ? '' : rawText)
        .split(/\s*\|\s*/)
        .map(p => p.trim())
        .filter(p => p.length);
    if (!parts.length) return '';

    return parts.map((part, i) => {
        let label = '', body = part;
        const colon = part.indexOf(':');
        if (colon > 0 && colon <= 24) {          // a real leading "Label:"
            label = part.slice(0, colon).trim();
            body = part.slice(colon + 1).trim();
        }
        const low = label.toLowerCase();
        let cat = FEEDBACK_CATEGORIES.find(c => c.keys.some(k => low.startsWith(k)));
        if (!cat && parts.length === 3) cat = FEEDBACK_CATEGORIES[i];  // fall back to position
        const icon = cat ? cat.icon : '';
        const cls = cat ? cat.cls : '';
        const bodyHTML = linkifyLaw(esc(body), lawContext);
        const labelHTML = label
            ? `<span class="fb-label">${icon ? icon + ' ' : ''}${esc(label)}</span>`
            : '';
        return `<div class="fb-block ${cls}">${labelHTML}<span class="fb-body">${bodyHTML}</span></div>`;
    }).join('');
}