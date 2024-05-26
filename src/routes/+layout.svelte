<script lang="ts">
	import { page } from '$app/stores';
	import '@picocss/pico';
	import { onMount } from 'svelte';

	let loaded = $state(false);

	onMount(() => {
		const token = $page.url.searchParams.get('apitoken');
		console.log('cehck for token', token);
		if (token !== null) {
			window.localStorage.setItem('token', token);
			close();
		} else {
			loaded = true;
		}
	});
</script>

{#if loaded}
	<main class="container">
		<slot></slot>
	</main>
{/if}

<style lang="scss">
</style>
