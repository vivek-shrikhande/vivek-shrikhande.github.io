<script>
	import { afterUpdate } from 'svelte';

	export let content = "some content";
	
	let contentPara;
	let contentContainer;
	let readPercentage = 'All';

	$: {
		content;  // just to make sure the reactive declaration depends on "content"
		if (contentContainer != null) {
			contentContainer.scrollTop = 0;
		}
	}

	afterUpdate(() => computeReadPercentage());

	function computeReadPercentage() {
		let heightDiff = contentPara.offsetHeight - contentContainer.offsetHeight;
		
		if (heightDiff < 0) {  // para is shorter than content
			readPercentage = 'All'
		} else if (contentContainer.scrollTop == 0) {
			readPercentage = 'Top'
		} else if (contentContainer.scrollTop >= heightDiff - 5) {
			// -5 for mobiles. Read percentage will be 99% or 100% but not 'Bot' even on full
			// scroll down.
			readPercentage = 'Bot'
		} else {
			readPercentage = Math.round(contentContainer.scrollTop / heightDiff * 100) + '%'
		}
	}
</script>

<div id="content-container" on:scroll="{computeReadPercentage}" bind:this={contentContainer}>
	<p id="content-para" bind:this={contentPara}>{@html content}</p>
</div>
<p class="read-percentage">{readPercentage}</p>

<style>
	p {
		margin: 0px;
	}

	#content-container {
		flex: 1 1 auto;
		overflow: auto;
		margin: 20px 25px 0px 25px;

		/* Hide scrollbar for IE, Edge and Firefox */
		-ms-overflow-style: none;   /* IE and Edge */
		scrollbar-width: none;      /* Firefox */
	}

	/* Hide scrollbar for Chrome, Safari and Opera */
	#content-container::-webkit-scrollbar {
		display: none;
	}
	
	.read-percentage {
		margin: 15px 25px 0px 0px;
		flex: 0 0 auto;
		text-align: right;
		font-size: 0.9em;
		color: #00ffd0;
  	}

	#content-para {
		line-height: 1.6em;
		color: #f0f0f0;
	}
</style>