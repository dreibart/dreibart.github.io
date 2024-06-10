<script lang="ts">
	import { browser } from '$app/environment';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import type { Note } from './+page.svelte';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';

	let edit = $state(false);
	let show = $state(false);
	let {
		note = $bindable(),
		characterId
	}: {
		characterId: number;
		note: Note;
	} = $props();

	let currentNoteText: string = $state('');
	let currentNoteTitle: string = $state('');
	let imageBuffer: undefined | null | ArrayBuffer = $state();

	let imageState = $state(1);

	let image = $derived.by(() => {
		if (!browser || !imageBuffer) {
			return null;
		}
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.addEventListener(
				'load',
				() => {
					resolve(reader.result as string);
				},
				false
			);
			if (imageBuffer) {
				reader.readAsDataURL(new Blob([imageBuffer]));
			}
		});
	});
	$effect(() => {
		currentNoteText = note.text;
		currentNoteTitle = note.topic;
	});

	async function updateText(
		text: string | undefined,
		title: string | undefined,
		buffer: ArrayBuffer | undefined | null
	) {
		try {
			const response = await requestFromBackend(
				'/character/{id:number}/notes/{note_id:number}',
				'PATCH',
				{
					id: characterId,
					note_id: note.id,
					text,
					topic: title,
					image: buffer === null ? null : buffer ? new Uint8Array(buffer) : undefined
				}
			);
			if (response.success) {
				note = response.result.note;
				imageBuffer = undefined;
				edit = false;
				imageState++;
			}
		} catch (error) {
			alert('fehler update');
		}
	}

	async function updateImage(params: FileList | null) {
		if (!params || params.length == 0) {
			return;
		}
		const file = params.item(0);
		if (file == null) {
			return;
		}
		imageBuffer = await file.arrayBuffer();
	}
</script>

{#if note}
	<article>
		<header>
			{#if note.changed}
				<span style="float: right;"
					>{note.changed.toLocaleString()} ({note.created.toLocaleString()})</span
				>
			{:else}
				<span style="float: right;">{note.created.toLocaleString()}</span>
			{/if}
			{#if edit}
				<input type="text" bind:value={currentNoteTitle} />
			{:else}
				<strong>{note.topic}</strong>
			{/if}
		</header>
		<dialog open={show} onclick={() => (show = !show)}>
			<img src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}&state={imageState}" />
		</dialog>

		<button
			onclick={() => (edit = !edit)}
			class="text"
			style="grid-row: 2; grid-column: 3; justify-self: start;align-self: start;">🖊️</button
		>
		{#if edit}
			<textarea style="grid-column: 2; grid-row: 2;" bind:value={currentNoteText}></textarea>
			<button
				disabled={currentNoteText == note.text &&
					currentNoteTitle == note.topic &&
					image == undefined}
				onclick={() => updateText(currentNoteText, currentNoteTitle, imageBuffer)}
				style="grid-row: 3;grid-column: span 3; ">Update</button
			>
			<div class="image">
				{#if imageBuffer === null}
				<button class="link" onclick={() => (imageBuffer = undefined)}
					>wiederherstellen</button
				><label>
					<input
						type="file"
						onchange={(e) => {
							updateImage(e.currentTarget.files);
						}}
					/>Hochladen</label
				>
				{:else}
					<label>
						<input
							type="file"
							onchange={(e) => {
								updateImage(e.currentTarget.files);
							}}
						/>

						{#if image}
							{#await image}
								<span aria-busy="true">Lade</span>
							{:then i}
								{#if i}
									<img src={i} alt="selected" />
								{:else}
									<span>Fehler</span>
								{/if}
							{/await}
						{:else}
							<img
								style="grid-row: 2; grid-column: 1; justify-self: start;align-self: start;"
								src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}&state={imageState}"
							/>
						{/if}
					</label>
				{/if}
				<button
					class="close text"
					onclick={() => {
						imageBuffer = null;
					}}>X</button
				>
			</div>
		{:else}
			<img
				onclick={() => (show = !show)}
				style="grid-row: 2; grid-column: 1; justify-self: start;align-self: start;"
				src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}"
			/>

			<div style="grid-column: 2; grid-row: 2;">
				{@html DOMPurify.sanitize(marked(currentNoteText))}
			</div>
		{/if}
	</article>
{/if}

<style lang="scss">
	article {
		display: grid;
		gap: var(--pico-spacing);
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr auto;
	}
	header {
		grid-row: 1;
		grid-column: span 3;
	}
	img {
		max-height: 5rem;
		object-fit: cover;
	}
	dialog img {
		max-height: 80vh;
	}
	input[type='file'] {
		display: none;
	}
	label {
		cursor: pointer;
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
	}
</style>
