<script lang="ts">
	import { onMount } from 'svelte';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { distinct } from '$lib/misc';
	import { browser } from '$app/environment';
	import Logo from '$lib/logo.svelte';
	import CharacterImage from '$lib/characterImage.svelte';

	let data: Result<'/character', 'GET'>['characters'][number][] = $state([]);
	let searchQuery = $state('');
	let loadingCharacters = $state(false);
	let errorLoadingCharacters = $state(false);
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
<input bind:value={searchQuery} type="text" />
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
		{#each distinct(...data.map((x) => [x.worldId,x.world]as const)).sort(([a],[b])=>a-b) as w}
			<tr class="header">
				<td colspan="5"><strong>{w[1]}</strong></td>
			</tr>
			{#each data.filter((x) => x.worldId == w[0]) as c}
				{#if searchQuery.split(' ').some((p) => c.name.includes(p)||c.type.includes(p)) || searchQuery == ''}
					<tr class="row">
						<td class="picture"><CharacterImage characterId={c.id} /> </td>
						<td class="name"><span>{c.name}</span></td>
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
				{/if}
			{/each}
		{/each}
	</tbody>
</table>

<style lang="scss">
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
