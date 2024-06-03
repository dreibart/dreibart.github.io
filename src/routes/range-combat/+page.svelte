<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { requestFromBackend, type Result } from '$lib/network/backend';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	const targetFrameModifiers: targetFrameModificationData[] = [
		{
			name: 'Tür (1m x 2m)',
			modifier: 5,
			tagets: [
				{
					probability: 1,
					text: 'Kopf'
				},
				{
					probability: 3,
					text: 'Torso'
				},
				{
					probability: 1,
					text: 'rechter Oberarm'
				},
				{
					probability: 1,
					text: 'linker Oberarm'
				},
				{
					probability: 1,
					text: 'rechter Unterarm'
				},
				{
					probability: 1,
					text: 'linker Unterarm'
				},
				{
					probability: 1,
					text: 'rechte Hand'
				},
				{
					probability: 1,
					text: 'linke Hand'
				},
				{
					probability: 1,
					text: 'rechter Oberschenkel'
				},
				{
					probability: 1,
					text: 'linker Oberschenkel'
				},
				{
					probability: 1,
					text: 'rechte Wade inkl. Fuß'
				},
				{
					probability: 1,
					text: 'linke Wade inkl. Fuß'
				},
				{
					probability: 6,
					text: null
				}
			]
		},
		{
			name: 'Torso (50cm x 1m)',
			modifier: 10,
			tagets: [
				{
					probability: 1,
					text: 'Kopf'
				},
				{
					probability: 11,
					text: 'Torso'
				},
				{
					probability: 1,
					text: 'rechter Oberarm'
				},
				{
					probability: 1,
					text: 'linker Oberarm'
				},
				{
					probability: 1,
					text: 'rechter Unterarm'
				},
				{
					probability: 1,
					text: 'linker Unterarm'
				},
				{
					probability: 4,
					text: null
				}
			]
		},
		{
			name: 'Körpermitte (50cm x 50cm)',
			modifier: 15,
			tagets: [
				{
					probability: 16,
					text: 'Torso'
				},
				{
					probability: 1,
					text: 'rechter Oberarm'
				},
				{
					probability: 1,
					text: 'linker Oberarm'
				},
				{
					probability: 1,
					text: 'rechter Unterarm'
				},
				{
					probability: 1,
					text: 'linker Unterarm'
				}
			]
		},
		{
			name: 'Hand (20cm x 20cm)',
			modifier: 20,
			tagets: [
				{
					probability: 19,
					text: 'die anvisierte Zone'
				},
				{
					probability: 1,
					text: 'Nachbarzone der anvisierten Zone'
				}
			]
		},
		{
			name: 'Auge (3cm x 3cm)',
			modifier: 30,
			tagets: [
				{
					probability: 1,
					text: 'die anvisierte Zone'
				}
			]
		}
	];

	let numberOfPersons = $state(3);
	let gate: targetFrameModificationData = $state({
		name: 'Tor (3m x 3m)',
		modifier: 0,
		tagets: [
			...Array.from({ length: numberOfPersons }).flatMap((_, index) => [
				{
					probability: 1,
					text: `Kopf Person ${index + 1}`
				},
				{
					probability: 3,
					text: `Torso Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Oberarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linker Oberarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Unterarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linker Unterarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechte Hand Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Hand Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Oberschenkel Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Oberschenkel Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechte Wade inkl. Fuß Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Wade inkl. Fuß Person ${index + 1}`
				}
			]),
			{
				probability: 70 - 14 * numberOfPersons,
				text: null
			}
		]
	});
	$effect(() => {
		gate.name = `Tor (3m x 3m) ${numberOfPersons} Personen`;
		gate.tagets = [
			...Array.from({ length: numberOfPersons }).flatMap((_, index) => [
				{
					probability: 1,
					text: `Kopf Person ${index + 1}`
				},
				{
					probability: 3,
					text: `Torso Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Oberarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linker Oberarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Unterarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linker Unterarm Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechte Hand Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Hand Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechter Oberschenkel Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Oberschenkel Person ${index + 1}`
				},
				{
					probability: 1,
					text: `rechte Wade inkl. Fuß Person ${index + 1}`
				},
				{
					probability: 1,
					text: `linke Wade inkl. Fuß Person ${index + 1}`
				}
			]),
			{
				probability: 70 - 14 * numberOfPersons,
				text: null
			}
		];
	});

	let range = $state(0);
	let environmentalFactors = $state(1 / 5);
	let movementModification = $state(0);
	let targetFrameModification: targetFrameModificationData = $state(targetFrameModifiers[0]);
	let totalModification = $derived(
		Math.floor(environmentalFactors * range) +
			movementModification +
			targetFrameModification.modifier
	);

	let authenticationRequired = $state(false);
	let lastError: string | undefined = $state(undefined);

	type targetFrameModificationData = {
		name: string;
		modifier: number;
		tagets: {
			probability: number;
			text: string | null;
		}[];
	};

	let lastHit:
		| undefined
		| {
				hit: false;
				roll: readonly [number, number];
				skillResult: number;
		  }
		| {
				hit: true;
				location: string;
				dodgeDificulty: number;
				roll: readonly [number, number];
				skillResult: number;
		  } = $state();

	let character: undefined | CharactrData = $state();
	let error: undefined | { typ: 'error'; description: string } = $state();
	let loading = $state(false);
	onMount(async () => {
		console.log('loding');
		loading = true;
		try {
			const charString = $page.url.searchParams.get('character-id');
			if (charString) {
				const characterId = parseInt(charString);
				const char = await characterData(characterId);
				if (char.typ == 'error') {
					error = char;
					character = undefined;
				} else {
					error = undefined;
					character = char;
				}
			} else {
				goto(`${base}/`);
			}
		} catch (errorReason) {
			error = {
				typ: 'error',
				description: errorReason as string
			};
			console.error(error);
		}
		loading = false;
	});
	type CharactrData = Result<'/shootSkill/request', 'GET'> & {
		typ: 'skill';
	};
	async function characterData(
		charactieId: number
	): Promise<CharactrData | { typ: 'error'; description: string }> {
		const result = await requestFromBackend('/shootSkill/request', 'GET', {
			character: charactieId
		});
		if (result.success) return result.result;
		return result.error;
		// const result = await fetch(
		// 	`https://dreibart.de/rpgdb/restAPI.php/shootSkill/request?character=${charactieId}`,
		// 	{
		// 		credentials: 'include',
		// 		headers: {
		// 			'X-Auth-Token': '123456789'
		// 		}
		// 	}
		// );
		// if (result.status == 401) {
		// 	return { typ: 'error', description: 'Authentication needed' };
		// } else {
		// 	return await result.json();
		// }
	}

	// type CharactrData = {
	// 	name: number;
	// 	typ: 'skill';
	// 	'nomaler Schuss': number;
	// 	'gezielter Schuss': number;
	// };

	function roll(type: 'nomaler Schuss' | 'gezielter Schuss'): typeof lastHit {
		if (character == undefined) {
			throw new Error('No Character');
		}
		let skill = character[type].value;
		const role1 = Math.floor(Math.random() * 10) + 1;
		const role2 = Math.floor(Math.random() * 10) + 1;
		const role = role1 + role2;
		const result = role + skill;
		const succsess = result - totalModification >= 0;

		if (!succsess) {
			return {
				hit: false,
				roll: [role1, role2],
				skillResult: result
			};
		}

		targetFrameModification.tagets
			.filter((x) => x.text == null)
			.map((x) => x.probability)
			.reduce((a, b) => a + b, 0);
		const total = targetFrameModification.tagets
			.filter((x) => x.text != null || type == 'nomaler Schuss')
			.map((x) => x.probability)
			.reduce((a, b) => a + b, 0);
		const randomSelection = Math.floor(Math.random() * total);

		const value = targetFrameModification.tagets
			.filter((x) => x.text != null || type == 'nomaler Schuss')
			.flatMap((x) => Array.from({ length: x.probability }).map((y) => x.text));

		const hit = value[randomSelection];

		if (hit == null) {
			return {
				hit: false,
				roll: [role1, role2],
				skillResult: result
			};
		}

		const dodgeDificulty = result - totalModification;
		return {
			hit: true,
			location: hit,
			dodgeDificulty,
			roll: [role1, role2] as const,
			skillResult: result
		};
	}
</script>

{#if loading}
	<span aria-busy="true"> loading… </span>
{/if}

{#if authenticationRequired}
	<a href="https://dreibart.de/rpgdb" target="_blank">Login</a>
{/if}

{#if error}
	<article>
		<header>Fehler</header>
		{error.description}
	</article>
{/if}

{#if character}
	<div class="colomn-medium">
		<article>
			<header>Distanz</header>
			<label>
				<input type="number" bind:value={range} maxlength="5" /> m
				<input type="range" min="1" max="1000" bind:value={range} />
			</label>
		</article>

		<article>
			<header>
				<h5>
					Umgebungseinfluss {environmentalFactors}
				</h5>
			</header>
			<label>
				<input type="radio" bind:group={environmentalFactors} value={1 / 5} />
				kein
			</label>
			<label>
				<input type="radio" bind:group={environmentalFactors} value={1 / 3} />
				gering
			</label>
			<label>
				<input type="radio" bind:group={environmentalFactors} value={1 / 2} />
				mittel
			</label>
			<label>
				<input type="radio" bind:group={environmentalFactors} value={2} />
				stark
			</label>
			<label>
				<input type="radio" bind:group={environmentalFactors} value={5} />
				extrem
			</label>
		</article>
		<article>
			<header>
				<h5>Bewegungsmodifikator {movementModification}</h5>
			</header>
			<label>
				<input type="radio" bind:group={movementModification} value={0} />
				keine
			</label>
			<label>
				<input type="radio" bind:group={movementModification} value={5} />
				leichte Bewegung (langsam)
			</label>
			<label>
				<input type="radio" bind:group={movementModification} value={10} />
				leichte Bewegung (schnell)
			</label>
			<label>
				<input type="radio" bind:group={movementModification} value={15} />
				komplexe Bewegung (langsam)
			</label>
			<label>
				<input type="radio" bind:group={movementModification} value={20} />
				komplexe Bewegung (schnell)
			</label>
		</article>

		<article>
			<header>
				<h5>
					Größenmodifikation {targetFrameModification.modifier}
					{Math.floor(
						100 -
							(100 *
								targetFrameModification.tagets
									.filter((x) => x.text == null)
									.map((x) => x.probability)
									.reduce((a, b) => a + b, 0)) /
								targetFrameModification.tagets.map((x) => x.probability).reduce((a, b) => a + b, 0)
					)}%
				</h5>
			</header>

			<label>
				<input type="radio" bind:group={targetFrameModification} value={gate} />
				Tor (3m x 3m) {numberOfPersons} Personen
			</label>
			<!-- {#if targetFrameModification == gate} -->
			<input type="range" bind:value={numberOfPersons} max="3" min="1" />
			<!-- {/if} -->
			{#each targetFrameModifiers as tm}
				<label>
					<input type="radio" bind:group={targetFrameModification} value={tm} />
					{tm.name}
				</label>
			{/each}
		</article>

		<article>
			<header>
				<h5>Gesamtmodifiaktion {totalModification}</h5>
			</header>
			<button onclick={() => (lastHit = roll('nomaler Schuss'))}>Schnellschuss</button>
			<button onclick={() => (lastHit = roll('gezielter Schuss'))}>Gezielt Schießen</button>
			<div>
				{#if lastHit !== undefined}
					{#if lastHit.hit == false}
						Verfehlt Skillwurf war {lastHit.skillResult}
						({lastHit.roll[0]}, {lastHit.roll[1]})
					{:else}
						Treffer in
						<strong>
							{lastHit.location}
						</strong>
						mit Ausweichschwierigkeit
						<strong>
							{lastHit.dodgeDificulty}
						</strong>
						<br />
						Skillwurf war {lastHit.skillResult}
						({lastHit.roll[0]}, {lastHit.roll[1]})
					{/if}
				{/if}
			</div>
		</article>
	</div>
{:else}
	<a href="?character-id=840" data-sveltekit-reload>Test</a>
{/if}

<style lang="scss">
	input[type='number'] {
		width: min-content;
	}
	button {
		display: block;
		width: 100%;
		margin: 1rem 0;
	}
</style>
