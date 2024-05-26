<script lang="ts">
	import { onMount } from 'svelte';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { distinct } from '$lib/misc';
	import { browser } from '$app/environment';

	const playerLookup: Record<number, string> = {
		1: 'Thomas',
		24: 'Patrick'
	};
	let data: (Result<'/character/{id:number}', 'GET'> & { typ: 'character'; id: number })[] = $state(
		[]
	);

	function getLastPlayer() {
		if (browser) {
			const v = window.localStorage.getItem('dreibart-player');
			if (v == null || v == '') {
				return undefined;
			}
			return parseInt(v);
		}
		return undefined;
	}
	let loadingCharacters = $state(false);
	let selectedPlayer: number | undefined = $state(getLastPlayer());
	let players = $derived(
		distinct(
			...Object.keys(playerLookup).map((x) => parseInt(x)),
			...data.map((x) => x.content.creator)
		)
	);

	onMount(async () => {
		const step = 50;
		loadingCharacters = true;
		for (let index = 0; index < 1100; index += step) {
			const characters = await Promise.all(
				Array.from({ length: step }).map(async (_, i) => {
					try {
						const data = await requestFromBackend('/character/{id:number}', 'GET', {
							id: index + i
						});
						return { ...data, id: index + i };
					} catch (error) {
						// console.warn(error);
						return { typ: 'error', description: error };
					}
				})
			);
			data.push(
				...characters.filter(
					(x): x is Result<'/character/{id:number}', 'GET'> & { typ: 'character'; id: number } =>
						x.typ == 'character'
				)
			);
		}
		loadingCharacters = false;
	});
	function faildLoadImage(
		e: Event & {
			currentTarget: EventTarget & Element;
		}
	) {
		const t = e.currentTarget as HTMLImageElement;
		t.src = 'https://dreibart.de/rpgdb/logo_neu.png';
	}
</script>

<label>
	Spieler
	<select
		aria-busy={loadingCharacters}
		bind:value={selectedPlayer}
		onchange={() =>
			window.localStorage.setItem('dreibart-player', selectedPlayer?.toString() ?? '')}
	>
		<option value={undefined} disabled>Bitte Spieler auswählen</option>
		{#each players as p}
			<option value={p}>{playerLookup[p] ?? `Unbekannt ${p}`}</option>
		{/each}
	</select>
</label>
<h1 aria-busy={loadingCharacters}>Charactere</h1>
<table>
	<tbody>
		{#each distinct(...data
				.filter((x) => x.content.creator == selectedPlayer)
				.map((x) => x.content.world)).sort() as w}
			<tr>
				<td colspan="3"><strong>{w}</strong></td>
			</tr>
			{#each data.filter((x) => x.content.creator == selectedPlayer && x.content.world == w) as c}
				<tr>
					<td style="width: 3rem; padding: 0;"
						><img
							onerror={faildLoadImage}
							class="character-image"
							src={c.content.characterPicture}
							alt="Charakter Bild"
						/></td
					>
					<td style="display: grid;"
						><span>{c.content.characterName}</span><em>{c.content.world}</em></td
					>
					<td style="width: 0;"><a href="?character-id={c.id}">Auswählen…</a></td>
				</tr>
			{/each}
		{/each}
	</tbody>
</table>

<style lang="scss">
	img.character-image {
		height: 3rem;
		width: 3rem;
		overflow: hidden;
		background-color: var(--pico-primary);
		object-fit: cover;
		border-radius: 3rem;
	}
</style>
