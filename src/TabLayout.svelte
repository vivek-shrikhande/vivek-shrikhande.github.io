<script>
	import MediaQuery from "./MediaQuery.svelte";

	import TabHeader from './TabHeader.svelte';
	import TabContent from './TabContent.svelte';

	export let tabs = [
		{name: "tab_name", content: "tab_content"},
	]
	let selectedIndex = 0;
    
	function handleSelect(event) {
		selectedIndex = event.detail.selectedIndex
	}
</script>

<MediaQuery query="(max-width: 800px)" let:matches>
	{#if matches}
	<div class="tab-layout-small-screen">
		<TabHeader names="{tabs.map(elem => elem.name)}" on:select="{handleSelect}"/>
		<TabContent content="{tabs[selectedIndex].content}"/>
		<div class="links">
			<a href="mailto://vivekshrikhande444@gmail.com" rel="noopener">email</a>
			<p>&middot;</p>
			<a href="https://github.com/vivek-shrikhande" rel="noopener">github</a>
			<p>&middot; </p>
			<a href="https://www.linkedin.com/in/vivek-shrikhande" rel="noopener">linkedin</a>
		</div>
	</div>
	{/if}
</MediaQuery>

<MediaQuery query="(min-width: 801px)" let:matches>
	{#if matches}
	<div class="tab-layout-large-screen">
		<TabHeader names="{tabs.map(elem => elem.name)}" on:select="{handleSelect}"/>
		<TabContent content="{tabs[selectedIndex].content}"/>
		<div class="links">
			<a href="mailto:vivekshrikhande444@gmail.com" rel="noopener">email</a>
			<p>&middot;</p>
			<a href="https://github.com/vivek-shrikhande" rel="noopener">github</a>
			<p>&middot; </p>
			<a href="https://www.linkedin.com/in/vivek-shrikhande" rel="noopener">linkedin</a>
		</div>
	</div>
	{/if}
</MediaQuery>



<style>
	:global(h3), :global(h4) {
		color: #33ff00;		
	}

	:global(h4) {
		margin-bottom: 0;
	}

	:global(dd) {
		margin-left: 23px;
	}

	:global(a):hover {
		color: #33ff00;
	}

	.tab-layout-small-screen {
		display: flex;
		flex-direction: column;
		margin: 20px 10px;
	}

    .tab-layout-large-screen {
		display: flex;
        flex-direction: column;
		width: 70%;
		margin: 60px auto 60px auto;
    }	

	.links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 25px;
		font-size: .9em;
	}

	.links a, p {
		color:#607d8b;
	}

	.links p {
		margin: 0px 10px;
	}
</style>

