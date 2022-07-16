function removeEscape(text)
{
	return text.replaceAll("\\[", "[").replaceAll("\\]", "]");
}

function convertIconedText(rawText)
{
	const splitizer = /((?<!\\)\[icon=[a-zA-Z0-9_-]+(?<!\\)\]|\n)/;
	const iconizer = /(?<!\\)\[icon=([a-zA-Z0-9_-]+)(?<!\\)\]/;

	return rawText.split(splitizer)
		.filter(e=>e!=='')
		.map((token, i)=>{
			if(token === "\n") return <br key={`br_${i}`} />
			if(!iconizer.test(token)) return removeEscape(token);
			const iconID = /(?<!\\)\[icon=([a-zA-Z0-9_-]+)(?<!\\)\]/.exec(token)[1];
			return <span className={`ui-icon ${iconID} inline`} key={`${iconID}_${i}`}></span>;
		});
}

export {convertIconedText};