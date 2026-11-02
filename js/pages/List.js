import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, getCurrentList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

// Pill colors by difficulty (everything except "extreme")
const difficultyColors = {
    easy: "#a4bb83",
    medium: "#b6b388",
    hard: "#c788ae",
    insane: "#d9a293",
};

// Pill colors by tier, used when difficulty is "extreme".
// These hex values were estimated from a screenshot of the table;
// swap in the exact ones if you have them.
const tierColors = {
    beginner: "#ea9999",
    easy: "#f28b8b",
    medium: "#f97c7c",
    hard: "#ff6b6b",
    "very hard": "#ff4d4d",
    insane: "#ff2a2a",
    extreme: "#ff0000",
    remorseless: "#cc0000",
    relentless: "#aa0000",
    terrifying: "#800000",
    catastrophic: "#550000",
    inexorable: "#2b0000",
    excrutiating: "#000000",
    excruciating: "#000000",
    merciless: "#222222",
};

// Lowercases and strips a trailing "NLW" so "Extreme NLW" and "Extreme" both match
const normalize = (s) =>
    String(s ?? "").replace(/\s*nlw\s*$/i, "").trim().toLowerCase();

function pillColor(level) {
    const fromDifficulty = difficultyColors[normalize(level.difficulty)];
    if (fromDifficulty) return fromDifficulty;
    return tierColors[normalize(level.tier)] || "#888888";
}

function isDarkColor_(hex) {
    const clean = String(hex).replace("#", "");

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    // Perceived brightness.
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128;
}

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="isUpcoming || i + 1 <= 25" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 > 25 && i + 1 <= 50" class="type-label-lg">(E) #{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">(L) #{{ i + 1 }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i" style="display: flex; align-items: center;">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                                <span v-if="pillText(level)" :style="pillStyle(level)">{{ pillText(level) }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier" :upcoming="isUpcoming"></LevelAuthors>
                    <iframe v-if="!isUpcoming" class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats" v-if="!isUpcoming">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Endscreen %</div>
                            <p>{{ level.endpercent || 100 }}% </p>
                        </li>
                    </ul>
                    <ul class="stats" v-else>
                        <li>
                            <div class="type-title-sm">Status</div>
                            <p>{{ level.status || 'Unknown' }}</p>
                        </li>
                    </ul>
                    <template v-if="!isUpcoming">
                        <h2>Records</h2>
                        <p v-if="selected + 1 <= 75"><strong>{{ ((level.percentToQualify / level.endpercent) * 100).toFixed(2) }}%</strong> GP ({{ level.percentToQualify }}%) or better to qualify</p>
                        <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                        <p v-else>This level does not accept new records.</p>
                        <table class="records">
                            <tr v-for="record in level.records" class="record">
                                <td class="percent">
                                    <p>
                                        <template v-if="Number(record.percent) === 100">100%</template>
                                        <template v-else>
                                            {{ ((record.percent / level.endpercent) * 100).toFixed(2) }}% ({{ record.percent }}%)
                                        </template>
                                    </p>
                                </td>
                                <td class="user">
                                    <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                                </td>
                                <td class="mobile">
                                    <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                                </td>
                                <td class="hz">
                                    <p>{{ record.hz }}</p>
                                </td>
                            </tr>
                        </table>
                    </template>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <template v-if="!isUpcoming">
                        <h3>Submission Requirements</h3>
                        <p>
                            Achieved the record without using hacks (FPS bypass and CBF are allowed)
                        </p>
                        <p>
                            Achieved the record on the level that is listed on the site - please check the level ID before you submit a record
                        </p>
                        <p>
                            Have either source audio or clicks/taps in the video. Edited audio only does not count
                        </p>
                        <p>
                            The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                        </p>
                        <p>
                            The recording must also show the player hit the endwall, or the completion will be invalidated.
                        </p>
                        <p>
                            Do not use secret routes or bug routes
                        </p>
                        <p>
                            Do not use easy modes, only a record of the unmodified level qualifies
                        </p>
                    </template>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        isUpcoming: false,
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list?.[this.selected]?.[0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        store.list = this;
        await resetList();
    },
    methods: {
        embed,
        score,
        pillText(level) {
            if (!level) return "";
            return level.tier;
        },
        pillStyle(level) {
            const background = pillColor(level);
            return {
                backgroundColor: background,
                color: isDarkColor_(background) ? "#fff" : "#000",
                fontFamily: "'Lexend Deca', sans-serif",
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
                padding: "2px 12px",
                borderRadius: "12px",
                marginLeft: "10px",
                display: "inline-block",
            };
        },
    },
};

export async function resetList() {
    // List page isn't mounted yet (e.g. direct load of /upcoming);
    // its own mounted() hook will call this again.
    if (!store.list) return;

    console.log("resetting");

    store.list.loading = true;
    store.list.errors = [];
    store.list.selected = 0;

    // Hide loading spinner
    store.list.list = await fetchList();
    store.list.editors = await fetchEditors();
    store.list.isUpcoming = getCurrentList() === "ul";

    // Error handling
    if (!store.list.list) {
        store.list.errors = [
            "Failed to load list. Retry in a few minutes or notify list staff.",
        ];
    } else {
        store.list.errors.push(
            ...store.list.list
                .filter(([_, err]) => err)
                .map(([_, err]) => {
                    return `Failed to load level. (${err}.json)`;
                })
        );
        if (!store.list.editors) {
            store.list.errors.push("Failed to load list editors.");
        }
    }

    store.list.loading = false;
}