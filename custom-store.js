/**
 * CustomStore — IndexedDB persistence for user-created ("custom") scenarios.
 *
 * A record is { id, scenario, review, meta, updatedAt }:
 *   id       — "custom:<slug>-<suffix>" (also stored as scenario.id)
 *   scenario — the full scenario JSON (same schema as built-in scenarios)
 *   review   — the paired review JSON, or null (game degrades to score-only)
 *   meta     — { title, description, icon, lang, difficulty, duration, hasReview }
 *
 * All methods return Promises. localStorage is NOT used (a scenario+review is
 * ~100 kB and would crowd the ~5 MB shared quota); IndexedDB is effectively
 * unbounded and async. Everything is wrapped so a blocked/erroring store never
 * throws synchronously — callers get a rejected promise they can catch.
 */
(function (global) {
    'use strict';

    const DB_NAME = 'deesc-custom';
    const DB_VERSION = 1;
    const STORE = 'scenarios';
    const CUSTOM_PREFIX = 'custom:';

    let dbPromise = null;

    function openDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            let req;
            try {
                req = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (e) {
                reject(e);
                return;
            }
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE, { keyPath: 'id' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
            req.onblocked = () => reject(new Error('IndexedDB blocked'));
        });
        return dbPromise;
    }

    function tx(mode, fn) {
        return openDB().then(db => new Promise((resolve, reject) => {
            const t = db.transaction(STORE, mode);
            const store = t.objectStore(STORE);
            let result;
            Promise.resolve(fn(store)).then(r => { result = r; }).catch(reject);
            t.oncomplete = () => resolve(result);
            t.onerror = () => reject(t.error || new Error('IndexedDB transaction failed'));
            t.onabort = () => reject(t.error || new Error('IndexedDB transaction aborted'));
        }));
    }

    function reqToPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ASCII slug from a title; keeps a-z0-9 and dashes.
    function slugify(text) {
        return String(text || 'scenar')
            .normalize('NFKD').replace(/[̀-ͯ]/g, '')  // strip diacritics
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'scenar';
    }

    function randSuffix() {
        return Math.random().toString(36).slice(2, 8);
    }

    const CustomStore = {
        PREFIX: CUSTOM_PREFIX,

        isCustomId(id) {
            return typeof id === 'string' && id.startsWith(CUSTOM_PREFIX);
        },

        /** Resolve once the DB is usable (or reject if IndexedDB is unavailable). */
        ready() {
            if (typeof indexedDB === 'undefined') {
                return Promise.reject(new Error('IndexedDB unavailable'));
            }
            return openDB().then(() => true);
        },

        /** New unique custom id from a title, e.g. "custom:zakrok-u-skoly-x7f2a1". */
        newId(title) {
            return CUSTOM_PREFIX + slugify(title) + '-' + randSuffix();
        },

        /** List stored records' metadata (no heavy scenario/review payloads). */
        list() {
            return tx('readonly', store => reqToPromise(store.getAll()))
                .then(rows => (rows || []).map(row => Object.assign(
                    { id: row.id, updatedAt: row.updatedAt || 0 },
                    row.meta || {}
                )));
        },

        /** Full record { id, scenario, review, meta, updatedAt } or null. */
        get(id) {
            return tx('readonly', store => reqToPromise(store.get(id)))
                .then(row => row || null);
        },

        /**
         * Save a scenario (+ optional review). `scenario.id` is forced to `id`.
         * `meta` is derived by the caller (CustomValidator.deriveMeta) or built here.
         */
        save(id, scenario, review, meta) {
            const record = {
                id,
                scenario: Object.assign({}, scenario, { id }),
                review: review || null,
                meta: Object.assign({ hasReview: !!review }, meta || {}),
                updatedAt: Date.now()
            };
            return tx('readwrite', store => { store.put(record); }).then(() => record);
        },

        delete(id) {
            return tx('readwrite', store => { store.delete(id); }).then(() => true);
        }
    };

    global.CustomStore = CustomStore;
})(typeof window !== 'undefined' ? window : this);
