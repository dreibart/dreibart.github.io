<script lang="ts">
	import { page } from '$app/stores';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import '@picocss/pico';
	import { onMount, onDestroy } from 'svelte';
	import { delay } from '$lib/misc';
	import Hamburger from '$lib/hamburger.svelte';

	let showSubMenue = $state(false);
	let loaded = $state(false);
	let scrollPosition = $state(0);
	let character: Result<'/character/{id:number}', 'GET'> | undefined = $state();
	let observer: MutationObserver;

	onMount(async () => {
		const token = $page.url.searchParams.get('apitoken');
		console.log('cehck for token', token);
		if (token !== null) {
			window.localStorage.setItem('token', token);
			close();
		} else {
			window.onscroll = (e) => {
				calculateScrollPosition();
			};
			calculateScrollPosition();
			function calculateScrollPosition() {
				const hight = document.body.scrollHeight - (window.visualViewport?.height ?? 1) + 103;
				if (hight <= 0) {
					scrollPosition = 1;
				} else {
					const scrollPositionRelative = window.scrollY / hight;
					scrollPosition = scrollPositionRelative;
				}
			}

			const charString = $page.url.searchParams.get('character-id');
			if (charString) {
				const characterId = parseInt(charString);

				character = await requestFromBackend('/character/{id:number}', 'GET', { id: characterId });
			}

			// scrollbar calculation
			function _calculateScrollbarWidth() {
				document.documentElement.style.setProperty(
					'--scrollbar-width',
					window.innerWidth - document.documentElement.clientWidth + 'px'
				);
				console.log(window.innerWidth - document.documentElement.clientWidth + 'px');
				calculateScrollPosition();
			}
			observer = new MutationObserver(() => {
				_calculateScrollbarWidth();
			});
			observer.observe(document.getRootNode(), {
				childList: true,
				subtree: true
			});

			// recalculate on resize
			window.addEventListener('resize', _calculateScrollbarWidth, false);
			// recalculate on dom load
			document.addEventListener('DOMContentLoaded', _calculateScrollbarWidth, false);
			// recalculate on load (assets loaded as well)
			window.addEventListener('load', _calculateScrollbarWidth);

			await delay(1000); // hack to wait after layout
			_calculateScrollbarWidth();

			loaded = true;
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

{#if loaded}
	<main class="container">
		<slot></slot>
	</main>
	<nav class="sub-menu" class:show={showSubMenue}>
		<ul>
			<li><a>Charakter Auswahl</a></li>
		</ul>
	</nav>
	<nav class="bar" class:scrolled={scrollPosition == 1} style="--scroll-position:{scrollPosition}">
		<ul>
			<li>
				{#if character}
					<hgroup>
						<img src={character.content.characterPicture} alt="Character Bild" />
						<h1>
							{character.content.characterName}
						</h1>
						<h2>
							{character.content.world}
						</h2>
					</hgroup>
				{/if}
			</li>
		</ul>
		<ul>
			<li>
				<Hamburger bind:isOpen={showSubMenue} />
				<!-- <input type="checkbox" bind:checked={showSubMenue} /> -->
			</li>
		</ul>
	</nav>
{/if}

<style lang="scss">
	:root {
		--app-bar-height: 103px;
	}
	:global(body) {
		overflow-x: hidden;
	}
	nav.sub-menu {
		--modifier: max(100vh, -1 * (100vw - var(--scrollbar-width)));
		&.show {
			bottom: calc(-1 * var(--modifier));
			right: calc(-1 * var(--modifier));
			height: calc(3 * var(--modifier));
			width: calc(3 * var(--modifier));
			padding: calc(var(--modifier)) calc(var(--modifier));
		}
		display: block;

		transition: all 1s cubic-bezier(0.49, 0.84, 0.23, 1.36);
		border-radius: 100%;
		border: 1px solid var(--pico-primary);
		height: 0;
		width: 0;
		position: fixed;
		bottom: -3px;
		right: -3px;
		backdrop-filter: blur(10px);
		ul {
			display: flex;
			align-items: end;
			justify-items: end;
			justify-content: end;
			overflow-y: auto;
			margin: calc(var(--modifier) - 100vh) calc(var(--modifier) - (100vw - var(--scrollbar-width)));
			width: calc(100vw - var(--scrollbar-width));
			height: calc(100vh - var(--app-bar-height));
		}
	}
	main {
		margin-bottom: var(--app-bar-height);
	}
	nav.bar {
		height: var(--app-bar-height);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transition: 1s border-top-color;
		// background-color: rgba(var(--pico-background-color),  1.7) ;
		backdrop-filter: blur(10px);
		border-top: 1px var(--pico-primary) solid;
		&.scrolled {
			border-top: 1px transparent solid;
			// opacity: 0.8;
			// background-color: rgba(  var(--pico-background-color), 0.8);
		}
	}
	hgroup {
		display: grid;
		grid-template-areas:
			'img h1'
			'img h2';
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr auto;
		align-items: end;
		h1 {
			grid-area: h1;
		}
		h2 {
			grid-area: h2;
		}
		img {
			grid-area: img;
			margin-right: 0.5rem;
			margin-left: var(--pico-nav-element-spacing-vertical);
			height: 3em;
			width: 3em;
			object-fit: cover;
			border-radius: 3rem;
		}
	}
</style>
