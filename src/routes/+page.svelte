<script lang="ts">
	import { onMount } from 'svelte';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { distinct, distinctBy, highlight } from '$lib/misc';
	import { browser } from '$app/environment';
	import Logo from '$lib/logo.svelte';
	import CharacterImage from '$lib/characterImage.svelte';
	import DOMPurify from 'dompurify';
	import { fade } from 'svelte/transition';

	let data: Result<'/character', 'GET'>['characters'][number][] = $state([]);
	let showFilter = $state(false);
	let searchQuery = $state('');
	let filterMinAttributes: undefined | number = $state();
	let filterMaxAttributes: undefined | number = $state();
	let filterMinSkills: undefined | number = $state();
	let filterMaxSkills: undefined | number = $state();

	let selectedWorlds: number[] = $state([]);

	let loadingCharacters = $state(false);
	let errorLoadingCharacters = $state(false);

	let worlds = $derived.by(() => {
		return distinctBy(([f]) => f, ...data.map((x) => [x.worldId, x.world] as const));
	});

	let filtered = $derived.by(() => {
		function mergeIntervals(
			intervals: (readonly [number, number])[]
		): (readonly [number, number])[] {
			if (intervals.length === 0) return [];

			// Zuerst die Intervalle nach dem Startwert sortieren
			intervals.sort((a, b) => a[0] - b[0]);

			const merged: (readonly [number, number])[] = [];
			let current = intervals[0];

			for (let i = 1; i < intervals.length; i++) {
				const [currentStart, currentEnd] = current;
				const [nextStart, nextEnd] = intervals[i];

				if (currentEnd > nextStart) {
					// Wenn die Intervalle sich überlappen, zusammenfassen
					current = [currentStart, Math.max(currentEnd, nextEnd)];
				} else {
					// Andernfalls das aktuelle Intervall speichern und zum nächsten übergehen
					merged.push(current);
					current = intervals[i];
				}
			}

			// Das letzte Intervall hinzufügen
			merged.push(current);

			return merged;
		}

		const parts = searchQuery
			.split(/(^ +)|((?<!>[^\\]) +)/gi)
			.map((x) => (x ?? '').trim())
			.filter((x) => x.length > 0)
			.map((x) => new RegExp(x, 'gi'));

		const filtred = data.flatMap((char) => {
			const name = char.name;
			const type = char.type;
			const isMatch = parts.every((p) => {
				return p.test(name) || p.test(type);
			});
			if (!isMatch) {
				return [];
			}
			if (filterMaxAttributes != undefined && char['attribute-points'].used > filterMaxAttributes) {
				return [];
			}
			if (filterMinAttributes != undefined && char['attribute-points'].used < filterMinAttributes) {
				return [];
			}
			if (filterMaxSkills != undefined && char['skill-points'].used > filterMaxSkills) {
				return [];
			}
			if (filterMinSkills != undefined && char['skill-points'].used < filterMinSkills) {
				return [];
			}
			const nameIndexes = mergeIntervals(
				parts.flatMap((reg) => {
					const nameMatches = [...name.matchAll(new RegExp(reg))];
					return [...nameMatches].map((x) => [x.index, x.index + x[0].length] as const);
				})
			);
			const typeIndexes = mergeIntervals(
				parts.flatMap((reg) => {
					const nameMatches = type.matchAll(new RegExp(reg));
					return [...nameMatches].map((x) => [x.index, x.index + x[0].length] as const);
				})
			);
			console.log(typeIndexes);
			return [{ ...char, typeIndexes, nameIndexes }];
		});

		return filtred;
	});

	onMount(async () => {
		loadingCharacters = true;

		try {
			const list = await requestFromBackend('/character', 'GET');
			if (list.success)
				data.push(
					...list.result.characters
					// .map((c) => ({...c,  world:'' }))
				);
			else {
				data = [];
			}
		} catch (error) {
			errorLoadingCharacters = true;
			console.error('fehler beim laden der Charactere', error);
		}
		loadingCharacters = false;
	});
</script>

{#if errorLoadingCharacters}
	<dialog open>Fehler beim abfragen der Charactere.</dialog>
{/if}

<Logo />

<h1 aria-busy={loadingCharacters}>Charactere</h1>

<label>
	<input type="checkbox" bind:checked={showFilter} />
	Filter
</label>
{#if showFilter}
	<aside in:fade out:fade>
		<input bind:value={searchQuery} type="text" />

		<details class="dropdown">
			<summary
				>{selectedWorlds.length == 0 || selectedWorlds.length == worlds.length
					? 'Jede Welt'
					: selectedWorlds.map((id) => worlds.filter((x) => x[0] == id)[0][1]).join(', ')}</summary
			>

			<ul>
				{#each worlds as [id, name]}
					<li>
						<label class:muted={filtered.filter((x) => x.worldId == id).length}>
							<input value={id} type="checkbox" bind:group={selectedWorlds} />
							{name} ({filtered.filter((x) => x.worldId == id).length})
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<div>Attribute</div>
		<div role="group">
			<label>
				Min.
				<input type="number" bind:value={filterMinAttributes} />
			</label>
			<label>
				Max.
				<input type="number" bind:value={filterMaxAttributes} />
			</label>
		</div>
		<div>Fertigkeiten</div>
		<div role="group">
			<label>
				Min.
				<input type="number" bind:value={filterMinSkills} />
			</label>
			<label>
				Max.
				<input type="number" bind:value={filterMaxSkills} />
			</label>
		</div>
	</aside>
{/if}

<table>
	<thead>
		<tr>
			<th></th>
			<th>Name</th>
			<th>Type</th>
			<th>Attributpunkte</th>
			<th>Fertigkeitspunkte</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each worlds as [worldId, worldName]}
			{@const chars = filtered.filter((x) => x.worldId == worldId)}
			{#if chars.length > 0 && (selectedWorlds.length == 0 || selectedWorlds.includes(worldId))}
				<tr class="header">
					<td colspan="5"><strong>{worldName}</strong></td>
				</tr>
				{#each chars as c}
					<tr class="row">
						<td class="picture"><CharacterImage characterId={c.id} /> </td>
						<td class="name"
							><span
								>{@html DOMPurify.sanitize(
									highlight(c.name, '<span class="highlight">', '</span>', c.nameIndexes)
								)}</span
							></td
						>
						<td class="name"
							><span
								>{@html DOMPurify.sanitize(
									highlight(c.type, '<span class="highlight">', '</span>', c.typeIndexes)
								)}</span
							></td
						>
						<td class="attributes"
							><span
								>{c['attribute-points'].used} / {c['attribute-points'].available +
									c['attribute-points'].used}</span
							>
							<small>
								(verfügbar {c['attribute-points'].available})
							</small>
						</td>
						<td class="skills">
							<span
								>{c['skill-points'].used} / {c['skill-points'].available +
									c['skill-points'].used}</span
							>
							<small>
								(verfügbar {c['skill-points'].available})
							</small>
						</td>
						<td class="selection"><a href="?character-id={c.id}">Auswählen…</a></td>
					</tr>
				{/each}
			{/if}
		{/each}
	</tbody>
</table>

<style lang="scss">
	table :global(.highlight) {
		border: 1px solid var(--pico-color-yellow-100);
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-color-yellow-550);
		color: #fff;
	}
	th {
		display: none;
	}

	tr {
		$break: 400;

		@media (max-width: #{$break - 1}px) {
			// smaler then break
			display: grid;
			grid-auto-flow: row;
			justify-items: stretch;
			justify-content: stretch;

			grid-template-columns: min-content min-content 1fr;

			grid-template-areas:
				'image name select'
				// 'image select select select'
				'skill skill skill'
				'attribute attribute attribute';

			.picture {
				grid-area: image;
			}

			&.header {
				// &:first-of-type{
				// 	margin-top: 30vh;
				// }
				position: sticky;
				top: 0;
				margin: 0 calc(-1 * var(--pico-spacing));
				td {
					background-color: var(--pico-secondary-background);
				}
				background-color: var(--pico-secondary-background);
				color: var(--pico-secondary-inverse);
			}

			.name {
				grid-area: name;
			}

			.selection {
				grid-area: select;
				justify-self: end;
			}

			.attributes,
			.skills {
				display: grid;
				grid-template-columns: 1fr 2fr;
				grid-template-rows: auto auto;
				&::before {
					grid-row: span 2;
				}
			}
			.skills {
				&::before {
					content: 'Fertigkeiten';
				}
				grid-area: skill;
			}

			.attributes {
				&::before {
					content: 'Attribute';
				}
				grid-area: attribute;
			}

			& > * {
				border: none;
			}
			padding-top: var(--pico-spacing);
			padding-bottom: calc(var(--pico-spacing) / 2);
			border-bottom: var(--pico-border-width) solid var(--pico-table-border-color);
		}
		@media (min-width: #{$break}px) {
			// bigger then break
			& > .selection {
				width: 0;
			}
			& > .picture {
				width: 3rem;
				padding: var(--pico-spacing) 0;
			}
		}
	}

	.logo {
		margin: var(--pico-spacing) auto;
		display: block;

		background-color: var(--pico-primary);
		border-radius: 9999rem;
		padding: calc(var(--pico-spacing) / 3);
		animation-name: spin;
		animation-duration: 480s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		@keyframes spin {
			from {
				transform: rotate(0deg);
			}

			to {
				transform: rotate(360deg);
			}
		}
	}
</style>
