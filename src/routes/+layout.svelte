<script lang="ts" context="module">
	export function characterIdFromPage(params: Page<Record<string, string>, string | null>) {
		const charString = get(page).url.searchParams.get('character-id');
		let characterId: number | undefined;
		if (charString) {
			try {
				characterId = parseInt(charString);
				if (isNaN(characterId)) {
					characterId = undefined;
				}
			} catch (error) {}
		}
		return characterId;
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import {
		OnBlockingChanged,
		allLogedInUsers,
		changeUser,
		currentUser,
		logout,
		requestFromBackend,
		retryBlocking,
		type Result
	} from '$lib/network/backend';
	import '$lib/theme.scss';
	import { onMount, onDestroy } from 'svelte';
	import { delay } from '$lib/misc';
	import Hamburger from '$lib/hamburger.svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import type { Page } from '@sveltejs/kit';
	import { get } from 'svelte/store';

	let showSubMenue = $state(false);
	let loaded = $state(false);
	let scrollPosition = $state(0);
	let characterId: undefined | number = $state();
	let character: (Result<'/character/{id:number}', 'GET'> & { type: 'character' }) | undefined =
		$state();
	let observer: MutationObserver;

	let popUpBlocker = $state(false);

	/**
	 * Get current browser viewpane heigtht
	 */

	function getScrollPercent() {
		function _get_window_height() {
			return (
				window.innerHeight ||
				document.documentElement.clientHeight ||
				document.body.clientHeight ||
				0
			);
		}

		/**
		 * Get current absolute window scroll position
		 */
		function _get_window_Yscroll() {
			return (
				window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0
			);
		}

		/**
		 * Get current absolute document height
		 */
		function _get_doc_height() {
			return Math.max(
				document.body.scrollHeight || 0,
				document.documentElement.scrollHeight || 0,
				document.body.offsetHeight || 0,
				document.documentElement.offsetHeight || 0,
				document.body.clientHeight || 0,
				document.documentElement.clientHeight || 0
			);
		}

		/**
		 * Get current vertical scroll percentage
		 */
		function _get_scroll_percentage() {
			return (_get_window_Yscroll() + _get_window_height()) / _get_doc_height();
		}

		return _get_scroll_percentage();
	}
	onMount(async () => {
		const token = $page.url.searchParams.get('apitoken');
		const token_user = $page.url.searchParams.get('user');
		OnBlockingChanged((e) => {
			popUpBlocker = e.isBlocking;
		});

		if (token !== null && token_user !== null) {
			window.localStorage.setItem('current-user', token_user);
			window.localStorage.setItem(`token-${token_user}`, token);
			window.localStorage.setItem('token', token);
			close();
		} else {
			window.onscroll = (e) => {
				calculateScrollPosition();
			};
			calculateScrollPosition();
			function calculateScrollPosition() {
				scrollPosition = getScrollPercent();
				return;
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
				try {
					characterId = parseInt(charString);
					const loaded = await requestFromBackend('/character/{id:number}', 'GET', {
						id: characterId
					});
					if (loaded.success && loaded.result.type == 'character') {
						character = loaded.result;
					} else {
						characterId = undefined;
					}
				} catch (error) {}
			}

			// scrollbar calculation
			function _calculateScrollbarWidth() {
				document.documentElement.style.setProperty(
					'--scrollbar-width',
					window.innerWidth - document.documentElement.clientWidth + 'px'
				);
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

	$effect(() => {
		if (browser) {
			const charString = $page.url.searchParams.get('character-id');
			if (charString) {
				characterId = parseInt(charString);

				requestFromBackend('/character/{id:number}', 'GET', {
					id: characterId
				}).then((loaded) => {
					if (loaded.success && loaded.result.type == 'character') {
						character = loaded.result;
					} else {
						character = undefined;
					}
				});
			}
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

{#if popUpBlocker}
	<dialog open style="flex-direction: column;">
		<p>Bitte deaktivieren Sie ihren Popup Blocker</p>
		<div>
			<button onclick={() => retryBlocking()}>Nochmal versuchen</button>
		</div>
	</dialog>
{/if}
{#if loaded || true}
	<main class="container">
		<slot></slot>
	</main>
	<nav class="sub-menu" class:show={showSubMenue}>
		<ul>
			<li>
				<a
					href="{base}/?character-id={characterId}"
					onclick={() => {
						showSubMenue = false;
					}}>Charakter Auswahl</a
				>
			</li>
			<li>
				<a
					aria-disabled={characterId == undefined}
					href={characterId ? `${base}/range-combat/?character-id=${characterId}` : undefined}
					onclick={() => {
						if (!characterId) {
							return false;
						}
						showSubMenue = false;
					}}>Fernkampf Tool</a
				>
			</li>
			<li>
				<a
					aria-disabled={characterId == undefined}
					href={characterId ? `${base}/character/notes/?character-id=${characterId}` : undefined}
					onclick={() => {
						if (!characterId) {
							return false;
						}
						showSubMenue = false;
					}}>Notizen</a
				>
			</li>
			<li>
				{#if browser}
					<details class="dropdown">
						<summary>Angemeldet als {currentUser()}</summary>
						<ul
							style="bottom:45px; margin:0; left:unset;right:0;width:min-content;height: fit-content;"
						>
							<li>
								<button onclick={() => changeUser()}>Nutzer Wechseln (Neu)</button>
							</li>
							{#each allLogedInUsers().filter((x) => x !== currentUser()) as user}
								<li>
									<button onclick={() => changeUser(user)}>Wechsel zu {user}</button>
								</li>
							{/each}
							<li>
								<button onclick={() => logout()}>Abmelden ({currentUser()})</button>
							</li>
						</ul>
					</details>
				{/if}
			</li>
		</ul>
	</nav>
	<nav
		class="bar"
		class:scrolled={scrollPosition < 0.99}
		style="--scroll-position:{scrollPosition}"
	>
		<ul>
			<li>
				{#if character}
					<hgroup>
						<img
							class="character-image"
							src="https://dreibart.de/rpgdb/image.php?character={characterId}"
							alt="Character Bild"
						/>
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
			<li style="margin-right: var(--pico-nav-element-spacing-vertical);">
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

	[data-theme='light'],
	:root:not([data-theme='dark']) {
		--backdrop: blur(5px) grayscale(100%) brightness(140%);
	}

	// Dark color scheme (Auto)
	// Automatically enabled if user has Dark mode enabled
	@media only screen and (prefers-color-scheme: dark) {
		:root:not([data-theme]) {
			--backdrop: blur(5px) grayscale(100%) brightness(40%);
		}
	}

	// Dark color scheme (Forced)
	// Enabled if forced with data-theme="dark"
	[data-theme='dark'] {
		--backdrop: blur(5px) grayscale(100%) brightness(40%);
	}
	nav.sub-menu {
		--modifier: max(100vh, -1 * (100vw - var(--scrollbar-width)));
		&.show {
			bottom: calc(-1 * var(--modifier));
			right: calc(-1 * var(--modifier));
			height: calc(3 * var(--modifier));
			width: calc(3 * var(--modifier));
			padding: calc(var(--modifier)) calc(var(--modifier));
			border: 1px solid var(--pico-primary);
			backdrop-filter: var(--backdrop);
			z-index: 1000;
		}
		display: block;

		transition: all 1s cubic-bezier(0.49, 0.84, 0.23, 1.36);
		border-radius: 100%;
		border: 1px solid transparent;
		height: 0;
		width: 0;
		position: fixed;
		bottom: -3px;
		right: -3px;
		// backdrop-filter: blur(0px);
		ul {
			display: flex;
			flex-direction: column-reverse;
			align-items: end;
			justify-items: end;
			justify-content: end;
			overflow-y: auto;
			margin: calc(var(--modifier) - 100vh) calc(var(--modifier) - (100vw - var(--scrollbar-width)));
			width: calc(100vw - var(--scrollbar-width));
			height: calc(100vh - var(--app-bar-height));
			li {
				padding-top: 0.5rem;
				padding-bottom: 0.5rem;
			}
		}
	}
	main {
		margin-bottom: var(--app-bar-height);
	}
	nav.sub-menu.show ~ nav.bar {
		border-top: 1px var(--pico-primary) solid;
	}
	nav.bar {
		z-index: 1001;
		overflow: hidden;
		height: var(--app-bar-height);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transition: 1s all;
		// background-color: rgba(var(--pico-background-color),  1.7) ;
		backdrop-filter: blur(0) brightness(100%);
		border-top: 1px transparent solid;
		&.scrolled {
			border-top: 1px var(--pico-primary) solid;
			backdrop-filter: var(--backdrop);
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
			align-self: center;
			grid-area: img;
			margin-right: 0.5rem;
			margin-left: var(--pico-nav-element-spacing-vertical);
		}
	}
	details.dropdown > ul {
		& > li {
			padding: 0 !important;
			margin: 0 !important;
			display: grid;
			&::before {
				content: unset;
			}
			&::after {
				content: unset;
			}
			& > button {
				border-radius: 0;
				background-color: transparent;
				color: var(--text-color);
				margin: 0;
				border-bottom: none;
				border-left: none;
				border-right: none;
				padding: var(--pico-spacing);
			}
			&:last-child > button {
				border-top: none;
			}
		}
	}
</style>
