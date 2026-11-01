export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        creators: {
            type: Array,
            default: () => [],
        },
        verifier: {
            type: String,
            required: true,
        },
        upcoming: {
            type: Boolean,
            default: false,
        },
    },
    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
            <template v-else-if="creators.length === 0">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
                <div class="type-title-sm">{{ upcoming ? 'Will be verified by' : 'Verifier' }}</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in creators" :key="\`creator-\$\{creator\}\`">
                        <span >{{ creator }}</span
                        ><span v-if="index < creators.length - 1">, </span>
                    </template>
                </p>
                <div class="type-title-sm">{{ upcoming ? 'Will be verified by' : 'Verifier' }}</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <template v-if="!upcoming">
                <div class="type-title-sm">Publisher</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return !this.upcoming && this.author === this.verifier && this.creators.length === 0;
        },
    },
};