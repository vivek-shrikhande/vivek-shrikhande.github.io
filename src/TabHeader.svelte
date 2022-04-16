<script>
	import MediaQuery from "./MediaQuery.svelte";

	import { createEventDispatcher } from 'svelte';
	import Tab from './Tab.svelte';
	
	const dispatch = createEventDispatcher();

	export let names = ["tab_name"];
	
	let selectedIndex = 0;
	
	function handleClick(i) {
		selectedIndex = i;
		
		dispatch('select', {
			selectedIndex: i
		});
	}
</script>

<MediaQuery query="(max-width: 800px)" let:matches>
	{#if matches}
	<div class="header-small-screen">
		{#each names as name, i}
			<Tab name="{name}" selected="{selectedIndex === i}" on:click="{event => handleClick(i)}"/>
		{/each}
	</div>
	{/if}
</MediaQuery>

<MediaQuery query="(min-width: 801px)" let:matches>
	{#if matches}
	<div class="header-large-screen">
		{#each names as name, i}
			<Tab name="{name}" selected="{selectedIndex === i}" on:click="{event => handleClick(i)}"/>
		{/each}
	</div>
	{/if}
</MediaQuery>


<style>
	.header-small-screen {
		flex: 0 0 auto;
	}

	.header-large-screen {
		display: flex;
		gap: 20px;
	}
</style>