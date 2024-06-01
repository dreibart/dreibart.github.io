<script lang="ts">
	import { onMount } from 'svelte';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { distinct } from '$lib/misc';
	import { browser } from '$app/environment';

	let data: Result<'/character/list', 'GET'>['characters'][number][] = $state([]);

	let loadingCharacters = $state(false);

	onMount(async () => {
		const step = 50;
		loadingCharacters = true;

		const list = await requestFromBackend('/character/list', 'GET');

		data.push(...list.characters.map((c) => c));

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

<h1 aria-busy={loadingCharacters}>Charactere</h1>
<table>
	<thead>
		<tr>
			<th></th>
			<th>Name</th>
			<th>Attributpunkte</th>
			<th>Fertigkeitspunkte</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each distinct(...data.map((x) => x.world)).sort() as w}
			<tr>
				<td colspan="5"><strong>{w}</strong></td>
			</tr>
			{#each data.filter((x) => x.world == w) as c}
				<tr>
					<td style="width: 3rem; padding: 0;"
						><img
							onerror={faildLoadImage}
							class="character-image"
							src="https://dreibart.de/rpgdb/image.php?character={c.id}"
							alt="Charakter Bild"
						/></td
					>
					<td style="display: grid;"><span>{c.name}</span><em>{c.world}</em></td>
					<td
						>{c['attribute-points'].used} / {c['attribute-points'].available +
							c['attribute-points'].used}<br />
						<small>
							(verfügbar {c['attribute-points'].available})
						</small>
					</td>
					<td
						>{c['skill-points'].used} / {c['skill-points'].available + c['skill-points'].used}
						<br />
						<small>
							(verfügbar {c['skill-points'].available})
						</small>
					</td>
					<td style="width: 0;"><a href="?character-id={c.id}">Auswählen…</a></td>
				</tr>
			{/each}
		{/each}
	</tbody>
</table>

<style lang="scss">
</style>
