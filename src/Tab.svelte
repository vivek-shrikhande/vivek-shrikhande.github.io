<script>
	export let name = "tab_name";
	export let selected = false;
	let hovered = false;
</script>

<div on:mouseover="{e => hovered = true}" on:focus="{e => hovered = true}" on:mouseout="{e => hovered = false}" on:blur="{e => hovered = false}" on:click>
    <span class:hovered class:selected>&lbrace;</span>	
    <p>{name}</p>
    <span class:hovered class:selected>&rbrace;</span>
</div>

<style>
	div {
		display: flex;
		align-items: center;
	}
	
	span {
		font-size: 2em;
		font-weight: 200;
		color: transparent;
	}
	
	.hovered {
		color: #5d5d5d;
		transition: color 0.5s;
	}

	.selected {
		color: #ffff00;
	}
	
	p {
		font-size: 1.5em;
		margin: 0px 5px 0px 5px;
		color: #0080ff;
	}
</style>