<script lang="ts">
    import '@picocss/pico';
</script>

<main class='container'>

    <slot></slot>
</main>

<style lang="scss">
    main{
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
    }
</style>