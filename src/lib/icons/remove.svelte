<script lang="ts">
	let { fill = false }: { fill?: boolean } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class:fill
	class="icon"
	height="24"
	width="24"
	><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
		id="SVGRepo_tracerCarrier"
		stroke-linecap="round"
		stroke-linejoin="round"
	></g><g id="SVGRepo_iconCarrier">
		<path
			d="M3.5,18c0-0.7,0.3-1.4,0.8-2l3.9-3.9l-4-4c-0.6-0.6-0.8-1.3-0.8-2s0.3-1.4,0.8-2s1.3-0.8,2-0.8s1.4,0.3,2,0.8l3.9,3.9
				l3.7-3.7c0.6-0.6,1.3-0.8,2-0.8c0.7,0,1.4,0.3,2,0.8s0.8,1.3,0.8,2s-0.3,1.4-0.8,2l-3.7,3.7l3.7,3.7c0.6,0.6,0.8,1.3,0.8,2
				c0,0.7-0.3,1.4-0.8,2s-1.3,0.8-2,0.8c-0.7,0-1.4-0.3-2-0.8L12.2,16l-3.9,3.9c-0.6,0.6-1.3,0.8-2,0.8s-1.4-0.3-2-0.8
				S3.5,18.6,3.5,18L3.5,18z"
		/>
	</g></svg
>

<style>
	svg {
		stroke: var(--pico-color);
	}
	.fill {
		fill: var(--pico-color);
	}
</style>
