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
	import { crossfade, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';

	let characterId: undefined | number = $state();

	let notes: Note[] = $state([]);
	let errorMessage: undefined | string = $state();

	let newNoteTitel = $state('');
	let newNoteText = $state('');
	let imageBuffer: undefined | File = $state();

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
			image: imageBuffer
				? { data: new Uint8Array(await imageBuffer.arrayBuffer()), type: imageBuffer!.type }
				: undefined
		});
		if (respones.success) {
			notes.splice(0, 0, respones.result.note);
			imageBuffer=undefined;
			newNoteText='';
			newNoteTitel='';
		}
	}
</script>

{#if errorMessage}
	<dialog open><p>{errorMessage}</p></dialog>
{/if}

{#if characterId}
	<article>
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
		<button onclick={()=>{
		newNote(characterId!, newNoteTitel, newNoteText)
	}}>Anlegen</button>
	</article>
	{#each notes as note, i (note?.id??i)}
		<div class="entry" animate:flip in:fade out:fade>
			<NoteEntry {characterId} bind:note={notes[i]} />
		</div>
	{/each}
{/if}

<style lang="scss">
	.entry :global(.image) {
		position: relative;
		:global(label){

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

	img {
		object-fit: cover;
	}
</style>
