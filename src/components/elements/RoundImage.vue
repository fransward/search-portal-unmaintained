<template>
    <div class="round-image" :class="image.class" :style="{ backgroundImage: 'url(' + image.src + ')' }"></div>
</template>

<script>
    export default {
        props: ['image']
    };
</script>
