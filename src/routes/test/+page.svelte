<script>
	import { onMount } from 'svelte';
	import { draw } from 'svelte/transition';

	let visible = false;
	onMount(async () => {
		visible = false;
		setTimeout(() => {
			visible = true;
		}, 400);
	});
</script>

<label>
	visible
	<input type="checkbox" bind:checked={visible} />
</label>
{#if visible}
	<svg
		version="1.1"
		id="svg2"
		x="0px"
		y="0px"
		viewBox="0 0 400 400"
		xml:space="preserve"
	>
		<g id="layer1" >
			<ellipse
            id="path3815"
				fill="transparent"
				stroke="red"
				cx="200"
				cy="200"
				rx="100"
				ry="100"
                stroke-width="8.8707"
				in:draw={{ duration: 5000, delay: 1000 }}
			/>
			<!-- class="st4" -->
			<ellipse
				id="path3817"
				fill="transparent"
				stroke="red"
				cx="200"
				cy="200"
				rx="150"
				ry="150"
				stroke-width="8.8707"
				in:draw={{ duration: 5000, delay: 4300 }}
			/>
		</g>
	</svg>
{/if}

<style>
	svg {
		width: 30vw;
		display: block;
		margin: 1rem auto;
	}
</style>
