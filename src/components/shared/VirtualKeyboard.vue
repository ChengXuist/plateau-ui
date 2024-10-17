<template>
<div class="keyboard" v-if="visible">
    <div class="keyboard-row" v-for="(row, index) in keys" :key="index">
        <button v-for="key in row" :key="key" @click="keyPressed(key)" @touchstart="keyPressed(key)" :class="['key', {'large-key': key === 'Space'} , {'large-key':  key === 'Backspace'} ]">
            {{ key }}
        </button>
    </div>
    <button class="close-button" @click="closeKeyboard" @touchstart="closeKeyboard">Close Keyboard</button>
</div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            keys: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
                ['Space', 'Backspace'],
            ],
        };
    },
    methods: {
        keyPressed(key) {
            this.$emit('key-press', key);
        },
        closeKeyboard() {
            this.visible = false;
        },
        openKeyboard() {
            this.visible = true;
        },
        
    }
};
</script>

<style>
.keyboard {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    background: #f9f9f9;
    position: absolute;
    left: 0;
    right: 0;
    padding: 10px;
    z-index: 100;
    /* Ensure it's above other content */
    width: 500px;
}

.keyboard-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
}

button {
    padding: 5px;
    font-size: 1.5em;
}

.key {
    width: 55px;
    height: 55px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f0f0f0;
    color: #333;
    cursor: pointer;
}

.large-key {
    width: 150px;
    /* Wider button for Space and Back */
    height: 55px;
    /* Same height to keep consistency */
}
.large-key2 {
    width: 150px;
    /* Wider button for Space and Back */
    height: 55px;
    /* Same height to keep consistency */
}
</style>
