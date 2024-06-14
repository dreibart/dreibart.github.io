<script lang="ts">
	let { characterId }: { characterId: number } = $props();

    let open=$state(false);
</script>
{#if open}
<dialog open onclick={()=>{open=!open}}>
    
    <img style="border-radius: 1rem;"
    src="https://dreibart.de/rpgdb/image.php?character={characterId}"
    alt="Charakter Bild"
    />
    
</dialog>
{/if}
<img onclick={()=>{open=!open}}
	class="character-image"
	src="https://dreibart.de/rpgdb/image.php?character={characterId}"
	alt="Charakter Bild"
/>
<style lang="scss">
    img{
        cursor: pointer;
        max-height: 90vh;
        max-width: 90vw;
    }

</style>