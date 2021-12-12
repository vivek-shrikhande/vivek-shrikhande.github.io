<script>
	import TabLayout from './TabLayout.svelte';
	import tabContent from './content.js'
</script>

<TabLayout tabs={tabContent}/>

<style>
	@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;400&display=swap');

	:global(*) {
        font-family: 'JetBrains Mono', monospace; 
	}

	:global(body) {
		display: flex;
		background-color: #0d1117;
	}

	:global(p) {
		margin-top: 0px;
	}

	:global(.last-elem) {
		margin-bottom: 0px;
	}

	/* wrapping non-space line to avoid horizontal scrollbars */
	:global(.wrapword) {
		white-space: -moz-pre-wrap !important;  /* Mozilla, since 1999 */
		white-space: -webkit-pre-wrap;          /* Chrome & Safari */ 
		white-space: -pre-wrap;                 /* Opera 4-6 */
		white-space: -o-pre-wrap;               /* Opera 7 */
		white-space: pre-wrap;                  /* CSS3 */
		word-wrap: break-word;                  /* Internet Explorer 5.5+ */
		word-break: break-all;
		white-space: normal;
	}
</style>
