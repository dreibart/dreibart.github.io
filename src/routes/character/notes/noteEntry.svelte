<script lang="ts">
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import type { Note } from './+page.svelte';

	

	let {
		note =$bindable(),
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
		<textarea bind:value={currentNoteText}></textarea>
		<button disabled={currentNoteText == note.text} onclick={() => updateText(currentNoteText)}
			>Update</button
		>
	</article>
{/if}
