class EventHub extends EventTarget
{
	constructor()
	{
		super();
	}
	dispatchEvent(type, detail)
	{
		const event = new CustomEvent(type, {detail});
		super.dispatchEvent(event);
	}
}

const eventHub = new EventHub();

export default eventHub;