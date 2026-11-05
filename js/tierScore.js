// Tier -> number -> list points

// NLW tiers (21+). Tiers 1-20 are written as "Tier 1" ... "Tier 20" and are parsed directly.
const nlwTierValues = {
    beginner: 21,
    easy: 22,
    medium: 23,
    hard: 24,
    "very hard": 25,
    insane: 26,
    extreme: 27,
    remorseless: 28,
    relentless: 29,
    terrifying: 30,
    catastrophic: 31,
    inexorable: 32,
    excruciating: 33,
    merciless: 34,
    monstrous: 35,
    apocalyptic: 36,
    demonic: 37,
    menacing: 38,
    unreal: 39,
    nightmare: 40,
};

// Lowercases and strips a trailing "NLW" so "Extreme NLW" and "Extreme" both match
const normalizeTier = (s) =>
    String(s ?? "").replace(/\s*nlw\s*$/i, "").trim().toLowerCase();

/** "Tier 7" -> 7, "Remorseless" -> 28, anything unrecognized -> null */
export function tierValue(level) {
    const raw = normalizeTier(level?.tier);
    const match = raw.match(/^tier\s*(\d+)$/);
    if (match) return Number(match[1]);
    return nlwTierValues[raw] ?? null;
}

/** The list-points formula, as a function of the tier number x */
export function listPoints(x) {
    if (x === null || x < 1) return 0;
    if (x < 21) return 0.5 * (x - 1) ** 2 + 1;
    return (5 / 4) * (x - 22 / 3) ** 2 + 21;
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Points for a level at a given record percent.
 * Returns null if the level's tier isn't recognized.
 * Partial records (percent < 100) give that percentage of the full points.
 */
export function levelScore(level, percent = 100) {
    const x = tierValue(level);
    if (x === null) return null;
    return round2(listPoints(x) * (percent / 100));
}