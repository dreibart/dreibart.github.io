<script lang="ts">
	import { browser } from '$app/environment';
	import Delete from '$lib/icons/delete.svelte';
	import Edit from '$lib/icons/edit.svelte';
	import Remove from '$lib/icons/remove.svelte';
	import { highlight } from '$lib/misc';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import type { Note } from './+page.svelte';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';

	let edit = $state(false);
	let show = $state(false);
	let showDelete = $state(false);
	let {
		note = $bindable(),
		characterId,
		searchQuery
	}: {
		characterId: number;
		note: Note | undefined;
		searchQuery: string;
	} = $props();

	let currentNoteText: string = $state('');
	let currentNoteTitle: string = $state('');
	let imageBuffer: undefined | null | ArrayBuffer = $state();

	let [titleIndexes, textIndexes] = $derived.by(() => {
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
		const text = currentNoteText;
		const title = currentNoteTitle;
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
		return [titleIndexes, textIndexes];
	});

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
		currentNoteText = note?.text ?? '';
		currentNoteTitle = note?.topic ?? '';
	});

	async function updateText(
		text: string | undefined,
		title: string | undefined,
		buffer: ArrayBuffer | undefined | null
	) {
		if (!note) {
			return;
		}
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
				note = { ...note, ...response.result.note };
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
	async function deleteNote() {
		if (!note) {
			return;
		}
		const response = await requestFromBackend(
			'/character/{id:number}/notes/{note_id:number}',
			'DELETE',
			{
				id: characterId,
				note_id: note.id
			}
		);
		if (response.success) {
			note = undefined;
		}
	}
</script>

{#if note}
	<article
		class:agreement={note.agreement &&
			'confirmation' in note.agreement &&
			note.agreement.confirmation}
		class:agreementRequest={note.agreement &&
			!('confirmation' in note.agreement && note.agreement.confirmation)}
	>
		<header>
			{#if note.agreement}
				{#if 'confirmation' in note.agreement && note.agreement.confirmation}
					<span style="color:var(--pico-primary)"
						>Vertrag angenommen von {note.agreement.gamemaster} am {note.agreement.confirmation.toLocaleString()}
						(angefragt am {note.agreement.request.toLocaleString()})</span
					>
				{:else}
					<span style="color:var(--pico-secondary)"
						>Vertrag angefragt am {note.agreement.request.toLocaleString()}</span
					>
				{/if}
			{/if}
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
				<strong>
					{@html DOMPurify.sanitize(
						marked(
							highlight(currentNoteTitle, '<span class="highlight">', '</span>', titleIndexes ?? [])
						)
					)}</strong
				>
			{/if}
		</header>
		<dialog open={show} onclick={() => (show = !show)}>
			<img src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}&state={imageState}" />
		</dialog>

		<div class="editcontrols">
			<button onclick={() => (edit = !edit)} class="text"><Edit fill={edit} /></button>
			<dialog open={showDelete} style="flex-direction: column;">
				<p>Wollen Sie die Notiz wirklich Löschen?</p>
				<p>
					<button
						style="min-width: 10em;"
						onclick={() => {
							deleteNote();
							showDelete = false;
						}}>Ja</button
					>
				</p>
				<p>
					<button style="min-width: 10em;" onclick={() => (showDelete = false)}>Nein</button>
				</p>
			</dialog>
			<button
				class="text"
				onclick={() => (showDelete = true)}
				style="grid-row: 2; grid-column: 3; justify-self: start;align-self: start;"
				><Delete /></button
			>
		</div>
		{#if edit}
			<textarea class="main" style="min-height: 30em;" bind:value={currentNoteText}></textarea>
			<button
				disabled={currentNoteText == note.text &&
					currentNoteTitle == note.topic &&
					imageBuffer === undefined}
				onclick={() => updateText(currentNoteText, currentNoteTitle, imageBuffer)}
				class="footer">Update</button
			>
			<div class="image imagearea">
				{#if imageBuffer === null}
					<button class="link" onclick={() => (imageBuffer = undefined)}>wiederherstellen</button
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
								alt=""
								src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}&state={imageState}"
							/>
						{/if}
					</label>
				{/if}
				<button
					class="close text"
					onclick={() => {
						imageBuffer = null;
					}}><Delete /></button
				>
			</div>
		{:else}
			<img
				alt=""
				onclick={() => (show = !show)}
				class="imagearea"
				src="https://dreibart.de/rpgdb/imagenote.php?notiz={note.id}&state={imageState}"
			/>

			<div class="main">
				{@html DOMPurify.sanitize(
					marked(
						highlight(currentNoteText, '<span class="highlight">', '</span>', textIndexes ?? [])
					)
				)}
			</div>
		{/if}
	</article>
{/if}

<style lang="scss">
	article {
		&.agreement {
			border: 3px solid var(--pico-primary);
		}
		&.agreementRequest {
			border: 3px solid var(--pico-secondary);
		}
		display: grid;
		gap: var(--pico-spacing);
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr auto;
		grid-template-areas:
			'header header header'
			'image main edit'
			'footer footer footer';

		@media (max-width: 470px) {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: repeat(4, auto);
			grid-template-areas:
				'header header'
				'image  edit'
				'main main'
				'footer footer';
		}
		> * {
			min-width: 0;
		}

		:global(pre) {
			overflow-x: visible;
		}

		.editcontrols {
			grid-area: edit;
			justify-self: end;
			align-self: start;
			display: flex;
			gap: 2rem;
			flex-direction: column;
		}
		.imagearea {
			grid-area: image;
			justify-self: start;
			align-self: start;
			cursor: pointer;
		}
		.footer {
			grid-area: footer;
		}
		.main {
			grid-area: main;
		}

		header {
			grid-area: header;
		}
	}

	img {
		max-height: 5rem;
		object-fit: cover;
		border-radius: var(--pico-border-radius);
	}
	dialog img {
		max-height: 80vh;
		border-radius: var(--pico-border-radius);
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
	article :global(.highlight) {
		border: 1px solid var(--pico-color-yellow-100);
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-color-yellow-550);
		color: #fff;
	}
</style>
