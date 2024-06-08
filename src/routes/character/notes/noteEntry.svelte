<script lang="ts">
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

	$effect(() => {
		currentNoteText = note.text;
	});

	async function updateText(text: string) {
		try {
			requestFromBackend('/character/{id:number}/notes/{note_id:number}', 'PATCH', {
				id: characterId,
				note_id: note.id,
				text
			});
		} catch (error) {
			alert('fehler update');
		}
		note.text = text;
	}
</script>

{#if note}
	<article>
		<dialog open={show} onclick={() => (show = !show)}>
			<img src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}" />
		</dialog>
		<img
			src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}"
			onclick={() => (show = !show)}
		/>
		<button
			onclick={() => (edit = !edit)}
			class="text"
			style="float: right; grid-column: 3; justify-self: start;align-self: start;">🖊️</button
		>
		{#if edit}
			<textarea style="grid-column: 2; grid-row: 1;" bind:value={currentNoteText}></textarea>
			<button
				disabled={currentNoteText == note.text}
				onclick={() => updateText(currentNoteText)}
				style="grid-row: 2;grid-column: span 3; ">Update</button
			>{:else}
			<div style="grid-column: 2; grid-row: 1;">
				{@html DOMPurify.sanitize(marked(currentNoteText))}
			</div>
		{/if}
	</article>
{/if}

<style lang="scss">
	article {
		display: grid;
		grid-template-columns: 4rem 1fr auto;
		grid-template-rows: 1fr auto;
	}
	img {
		max-height: 5rem;
	}
	dialog img {
		max-height: 80vh;
	}
</style>
