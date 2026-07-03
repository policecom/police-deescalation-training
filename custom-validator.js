/**
 * CustomValidator — schema checks for user-supplied scenario/review JSON,
 * ported from the project's validate_redesign.py.
 *
 * validateScenario(obj) -> { ok, errors:[], warnings:[], meta:{...} }
 *   ok === false (errors present) => do NOT import; the scenario is unusable.
 *   warnings never block import; they explain what will render sub-optimally.
 *
 * validateReview(obj, scenario) -> { ok, errors:[], warnings:[] }
 *   ok === false => import the scenario but drop the review (game shows
 *   score-only, which is a supported degradation).
 */
(function (global) {
    'use strict';

    const OPTION_TYPES = ['positive', 'partially_positive', 'neutral', 'negative'];
    const POINTS_OK = {
        positive: [10, 12],
        partially_positive: [5],
        neutral: [2],
        negative: [-8, -10]
    };
    const MAX_BYTES = 2 * 1024 * 1024;

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function nonEmptyStr(v) { return typeof v === 'string' && v.trim().length > 0; }

    // The trainer character key = the non-officer speaker in the final debrief.
    function detectTrainerKey(scenario) {
        const stages = Array.isArray(scenario.stages) ? scenario.stages : [];
        const finalStage = stages.find(s => s && s.finalScene);
        const seq = finalStage && Array.isArray(finalStage.dialogueSequence)
            ? finalStage.dialogueSequence : [];
        for (const line of seq) {
            if (line && line.character && line.character !== 'officer') return line.character;
        }
        return null;
    }

    function deriveMeta(scenario) {
        return {
            title: nonEmptyStr(scenario && scenario.title) ? scenario.title : 'Vlastní scénář',
            description: (scenario && typeof scenario.description === 'string') ? scenario.description : '',
            icon: (scenario && nonEmptyStr(scenario.icon)) ? scenario.icon : '🎓',
            lang: (scenario && nonEmptyStr(scenario.lang)) ? scenario.lang : 'cs',
            difficulty: (scenario && Number(scenario.difficulty)) || 3,
            duration: (scenario && nonEmptyStr(scenario.duration)) ? scenario.duration : '10-15'
        };
    }

    function byteSize(obj) {
        try { return new Blob([JSON.stringify(obj)]).size; }
        catch (e) { return JSON.stringify(obj).length; }
    }

    function validateScenario(obj) {
        const errors = [];
        const warnings = [];

        if (!isObj(obj)) {
            return { ok: false, errors: ['Soubor není platný objekt scénáře.'], warnings, meta: null };
        }
        if (byteSize(obj) > MAX_BYTES) {
            errors.push('Scénář je příliš velký (limit 2 MB).');
        }
        if (!Array.isArray(obj.stages) || obj.stages.length === 0) {
            errors.push('Chybí pole „stages“ (fáze scénáře).');
            return { ok: false, errors, warnings, meta: null };
        }

        const interactive = obj.stages.filter(s => s && !s.finalScene);
        const finals = obj.stages.filter(s => s && s.finalScene);

        if (interactive.length === 0) errors.push('Scénář nemá žádnou interaktivní fázi.');
        if (finals.length !== 1) errors.push(`Scénář musí mít právě jednu závěrečnou fázi (finalScene), našel jsem ${finals.length}.`);
        if (interactive.length !== 7) {
            warnings.push(`Scénář má ${interactive.length} interaktivních fází (obvyklých je 7) — hra to zvládne, ale review a odznaky počítají s běžnou strukturou.`);
        }

        // Interactive stages
        interactive.forEach((st, i) => {
            const label = `Fáze ${st && st.id != null ? st.id : i + 1}`;
            if (!nonEmptyStr(st.prompt)) warnings.push(`${label}: chybí „prompt“ (otázka pro hráče).`);
            if (!isObj(st.sceneUpdate) || !nonEmptyStr(st.sceneUpdate.title) || !nonEmptyStr(st.sceneUpdate.desc)) {
                warnings.push(`${label}: neúplný „sceneUpdate“ (emoji/title/desc).`);
            }
            if (!Array.isArray(st.npcDialogue)) {
                warnings.push(`${label}: chybí „npcDialogue“.`);
            }
            const opts = Array.isArray(st.options) ? st.options : [];
            if (opts.length !== 4) {
                errors.push(`${label}: musí mít právě 4 volby (má ${opts.length}).`);
                return;
            }
            const types = opts.map(o => o && o.type);
            const typeSet = new Set(types);
            if (typeSet.size !== 4 || !OPTION_TYPES.every(t => typeSet.has(t))) {
                errors.push(`${label}: volby musí mít 4 různé typy (positive/partially_positive/neutral/negative), mají: ${types.join(', ')}.`);
            }
            opts.forEach(o => {
                if (!isObj(o)) { errors.push(`${label}: volba není objekt.`); return; }
                if (!nonEmptyStr(o.text)) errors.push(`${label}: volba typu „${o.type}“ nemá text.`);
                if (!nonEmptyStr(o.feedback)) errors.push(`${label}: volba typu „${o.type}“ nemá feedback.`);
                if (typeof o.points !== 'number') warnings.push(`${label}: volba typu „${o.type}“ nemá číselné „points“.`);
                else if (POINTS_OK[o.type] && POINTS_OK[o.type].indexOf(o.points) === -1) {
                    warnings.push(`${label}: volba „${o.type}“ má body ${o.points} (obvyklé: ${POINTS_OK[o.type].join(' nebo ')}). Skóre se počítá z typu, takže hra funguje.`);
                }
                if (nonEmptyStr(o.feedback) && !(o.feedback.indexOf('|') > -1 && /:/.test(o.feedback))) {
                    warnings.push(`${label}: feedback volby „${o.type}“ nemá strukturu „Proč: … | DŮSLEDKY: … | Reflexe: …“ — zobrazí se jako jeden blok.`);
                }
            });
        });

        // Final debrief stage
        const finalStage = finals[0];
        const trainerKey = detectTrainerKey(obj);
        if (finalStage) {
            if (finalStage.autoDialogue !== true) warnings.push('Závěrečná fáze nemá „autoDialogue: true“.');
            const seq = Array.isArray(finalStage.dialogueSequence) ? finalStage.dialogueSequence : [];
            if (seq.length < 1) {
                errors.push('Závěrečná fáze nemá „dialogueSequence“ (rozborový dialog).');
            } else {
                const speakers = new Set(seq.map(l => l && l.character).filter(Boolean));
                if (!speakers.has('officer')) warnings.push('V rozborovém dialogu nemluví „officer“ (Vy).');
                if (!trainerKey) warnings.push('V rozborovém dialogu chybí trenér (postava jiná než officer).');
            }
        }

        // Characters
        const chars = isObj(obj.characters) ? obj.characters : {};
        if (!isObj(obj.characters)) {
            errors.push('Chybí „characters“ (postavy).');
        } else {
            if (!chars.officer) errors.push('„characters“ musí obsahovat klíč „officer“ (hráč/policista).');
            if (trainerKey && !chars[trainerKey]) {
                errors.push(`„characters“ neobsahuje trenéra „${trainerKey}“ použitého v rozboru.`);
            }
            // every speaker referenced anywhere must exist
            const referenced = new Set();
            obj.stages.forEach(st => {
                (st.npcDialogue || []).forEach(d => d && d.character && referenced.add(d.character));
                (st.dialogueSequence || []).forEach(d => d && d.character && referenced.add(d.character));
            });
            referenced.forEach(key => {
                if (!chars[key]) warnings.push(`Postava „${key}“ je použita v dialogu, ale chybí v „characters“ (zobrazí se jako neznámá osoba).`);
            });
        }

        // Nice-to-haves
        if (!nonEmptyStr(obj.title)) errors.push('Scénář nemá „title“.');
        if (!isObj(obj.instructor) || !nonEmptyStr(obj.instructor.introduction)) {
            warnings.push('Chybí „instructor.introduction“ (úvodní řeč instruktora).');
        }
        if (!isObj(obj.finalMessage) || !nonEmptyStr(obj.finalMessage.revelation)) {
            warnings.push('Chybí „finalMessage.revelation“ (odhalení na konci).');
        }
        if (!isObj(obj.performanceReviews)) warnings.push('Chybí „performanceReviews“ (hodnocení podle výkonu) — použije se obecné.');
        if (!isObj(obj.lawContext)) warnings.push('Chybí „lawContext“ — holé „§ 11“ bez uvedeného zákona nebudou klikací.');

        const meta = deriveMeta(obj);
        return {
            ok: errors.length === 0,
            errors,
            warnings,
            meta: Object.assign({ interactiveStages: interactive.length, trainerKey }, meta)
        };
    }

    function validateReview(obj, scenario) {
        const errors = [];
        const warnings = [];
        if (!isObj(obj)) {
            return { ok: false, errors: ['Review není platný objekt.'], warnings };
        }
        if (!isObj(obj.stageAnalysis)) {
            return { ok: false, errors: ['Review nemá „stageAnalysis“.'], warnings };
        }
        const interactive = (scenario && Array.isArray(scenario.stages))
            ? scenario.stages.filter(s => s && !s.finalScene) : [];
        const keys = Object.keys(obj.stageAnalysis);
        if (interactive.length && keys.length !== interactive.length) {
            warnings.push(`Review pokrývá ${keys.length} fází, scénář má ${interactive.length} interaktivních — chybějící fáze se v reportu neukážou.`);
        }
        keys.forEach(k => {
            const block = obj.stageAnalysis[k];
            const ca = isObj(block) && isObj(block.choiceAnalysis) ? block.choiceAnalysis : null;
            if (!ca) { warnings.push(`Review fáze ${k}: chybí „choiceAnalysis“.`); return; }
            OPTION_TYPES.forEach(t => {
                if (!isObj(ca[t]) || !nonEmptyStr(ca[t].choiceText)) {
                    warnings.push(`Review fáze ${k}: typ „${t}“ nemá „choiceText“.`);
                }
            });
        });
        if (scenario && obj.scenarioId != null && String(obj.scenarioId) !== String(scenario.id)) {
            warnings.push(`Review.scenarioId (${obj.scenarioId}) nesouhlasí s id scénáře (${scenario.id}) — po importu se sjednotí.`);
        }
        return { ok: errors.length === 0, errors, warnings };
    }

    global.CustomValidator = {
        validateScenario,
        validateReview,
        deriveMeta,
        detectTrainerKey,
        OPTION_TYPES,
        POINTS_OK
    };
})(typeof window !== 'undefined' ? window : this);
