<script lang="ts" context="module">
	export type Note = {
		-readonly [k in keyof Result<'/character/{id:number}/notes', 'GET'>['notes'][number]]: Result<
			'/character/{id:number}/notes',
			'GET'
		>['notes'][number][k];
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';

	import { browser } from '$app/environment';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { onMount } from 'svelte';
	import { characterIdFromPage } from '../../+layout.svelte';
	import NoteEntry from './noteEntry.svelte';
	import { base64, base64url } from 'rfc4648';
	import Filter from '$lib/icons/filter.svelte';
	import Add from '$lib/icons/add.svelte';
	import { base } from '$app/paths';
	// import { crossfade, fade } from 'svelte/transition';
	// import { quintOut } from 'svelte/easing';
	// import { flip } from 'svelte/animate';

	let characterId: undefined | number = $state();

	let notes: Note[] = $state([]);
	let errorMessage: undefined | string = $state();

	let showFilter = $state(false);
	let showAdd = $state(false);
	let showNormalNotes = $state(true);
	let showProposedAggreements = $state(true);
	let showAggreements = $state(true);

	let newNoteTitel = $state('');
	let newNoteText = $state('');
	let imageBuffer: undefined | File = $state();
	let searchQuery = $state('');

	let filteredNotes = $derived.by(() => {
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

		const filtred = notes.flatMap((note, originalIndex) => {
			if (!note) {
				return [];
			}
			const title = note.topic;
			const text = note.text;

			if (
				(!note.agreement && !showNormalNotes) ||
				(note.agreement &&
					'confirmation' in note.agreement &&
					note.agreement.confirmation &&
					!showAggreements) ||
				(note.agreement &&
					!('confirmation' in note.agreement && note.agreement.confirmation) &&
					!showProposedAggreements)
			) {
				return [];
			}
			const isMatch = parts.every((p) => {
				return p.test(title) || p.test(text);
			});
			if (!isMatch) {
				return [];
			}

			const titleIndexes = mergeIntervals(
				parts.flatMap((reg) => {
					const nameMatches = [...title.matchAll(new RegExp(reg))];
					return [...nameMatches].map((x) => [x.index, x.index + x[0].length] as const);
				})
			);
			const textIndexes = mergeIntervals(
				parts.flatMap((reg) => {
					const nameMatches = text.matchAll(new RegExp(reg));
					return [...nameMatches].map((x) => [x.index, x.index + x[0].length] as const);
				})
			);
			return [{ ...note, textIndexes: textIndexes, titleIndexes: titleIndexes, originalIndex }];
		});

		return filtred;
	});

	let image = $derived.by(() => {
		if (!browser || !imageBuffer) {
			return undefined;
		}
		return new Promise<string>(async (resolve) => {
			console.log(imageBuffer);
			const reader = new FileReader();
			reader.addEventListener(
				'load',
				() => {
					resolve(reader.result as string);
				},
				false
			);
			if (imageBuffer) {
				reader.readAsDataURL(new Blob([await imageBuffer.arrayBuffer()]));
			}
		});
	});

	async function updateImage(params: FileList | null) {
		if (!params || params.length == 0) {
			return;
		}
		const file = params.item(0);
		if (file == null) {
			return;
		}
		file.type;
		imageBuffer = await file;
	}

	onMount(() => {});

	$effect(() => {
		if (browser) {
			characterId = characterIdFromPage($page);
		}
	});
	$effect(() => {
		if (browser && characterId) {
			try {
				requestFromBackend('/character/{id:number}/notes', 'GET', { id: characterId }).then(
					(response) => {
						if (response.success) {
							notes = response.result.notes;
						} else {
							errorMessage = response.error.description;
						}
					}
				);
			} catch (error) {
				notes = [];
				errorMessage = 'Fehler beim Abfragen der Notizen';
			}
		} else {
			notes = [];
		}
	});

	async function newNote(characterId: number, title: string, text: string) {
		const respones = await requestFromBackend('/character/{id:number}/notes', 'PATCH', {
			id: characterId,
			text: text,
			title,
			image: imageBuffer ? new Uint8Array(await imageBuffer.arrayBuffer()) : undefined
		});
		if (respones.success) {
			notes.splice(0, 0, respones.result.note);
			imageBuffer = undefined;
			newNoteText = '';
			newNoteTitel = '';
		}
	}
</script>

{#if errorMessage}
	<dialog open>
		<p>{errorMessage}</p>
		<a href={base}>Zurück zur Characterauswahl</a>
	</dialog>
{/if}

{#if characterId}
	<input bind:value={searchQuery} type="search" />

	<article class="filter">
		<label class="link">
			<input type="checkbox" bind:checked={showAdd} style="display: none;" />
			<Add fill={showAdd} />
		</label>
		{#if showAdd}
			<aside>
				<label>
					Titel
					<input type="text" bind:value={newNoteTitel} />
				</label>
				<label>
					Text
					<textarea bind:value={newNoteText}></textarea>
				</label>
				<label>
					<input
						style="display: none;"
						type="file"
						onchange={(e) => {
							updateImage(e.currentTarget.files);
						}}
					/>

					<div class="image">
						{#if image}
							{#await image}
								<span aria-busy="true">Lade</span>
							{:then i}
								{#if i}
									<img src={i} />
								{:else}
									<span>Fehler</span>
								{/if}
							{/await}
						{:else}
							<span>Bild Hinzufügen</span>
						{/if}
					</div>
				</label>
				<button
					onclick={()=>{
					newNote(characterId!, newNoteTitel, newNoteText)
				}}
					disabled={newNoteText == '' && newNoteTitel == ''}>Anlegen</button
				>
			</aside>
		{/if}
	</article>

	<article class="filter">
		<label class="link">
			<input type="checkbox" bind:checked={showFilter} style="display: none;" />
			<Filter fill={showFilter} />
		</label>
		{#if showFilter}
			<aside>
				<label>
					<input type="checkbox" role="switch" bind:checked={showAggreements} />
					Abgeschlossene Verträge Anzeigen
				</label>
				<label>
					<input type="checkbox" role="switch" bind:checked={showProposedAggreements} />
					Vorgeschlagene Verträge Anzeigen
				</label>
				<label>
					<input type="checkbox" role="switch" bind:checked={showNormalNotes} />
					Normale Notizen Anzeigen
				</label>
			</aside>
		{/if}
	</article>

	{#each filteredNotes as note, i (note?.id ?? i)}
		<div class="entry">
			<NoteEntry {characterId} bind:note={notes[note?.originalIndex]} {searchQuery} />
		</div>
	{/each}
{/if}

<style lang="scss">
	article.filter {
		transition: background-color 200ms linear();
		margin-top: var(--pico-spacing);

		&:not(:has(input:checked)) {
			box-shadow: none;
			background-color: transparent;
			display: inline;
			margin-top: var(--pico-spacing);
			margin-bottom: var(--pico-spacing);
			margin-block-end: var(--pico-spacing);
		}

		& > aside {
			margin-top: var(--pico-spacing);
		}
	}

	input[type='search'] {
		margin-top: var(--pico-spacing);
	}

	.entry {
		margin-top: var(--pico-spacing);

		:global(.image) {
			position: relative;
			:global(label) {
				cursor: pointer;
			}
			width: 6rem;
			height: 6rem;
			text-align: center;
			display: grid;
			align-content: center;
			justify-content: center;
			border: solid var(--pico-border-width) var(--pico-primary);
		}
	}

	img {
		object-fit: cover;
	}
</style>
