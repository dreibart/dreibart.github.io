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

	let characterId: undefined | number = $state();

	let notes: Note[] = $state([]);
	let errorMessage: undefined | string = $state();
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
</script>

{#if errorMessage}
	<dialog open><p>{errorMessage}</p></dialog>
{/if}

{#if characterId}
	{#each notes as note, i}
		<NoteEntry {characterId} bind:note={notes[i]} />
	{/each}
{/if}
