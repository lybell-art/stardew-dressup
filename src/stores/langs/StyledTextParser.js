import {createElement, Fragment} from "react";

function parseStyleOption(opt)
{
	let styleList = opt.split(',').map(e=>e.trim()).filter(e=>e!=='').map(e=>e.split(":"));

	let result = {};
	for(let [style, value] of styleList) {
		if(value === undefined) value = true;
		if(!isNaN(+value)) value = +value;
		switch(style){
			case "size":
				if(typeof value === "number") result.fontSize = value + "em"; 
				else result.fontSize = value;
				break;
			case "color":
				result.color = value;
				break;
		}
	}

	return result;
}

function removeEscape(text)
{
	return text.replaceAll("\\[", "[").replaceAll("\\]", "]");
}


class StyledTextNode
{
	constructor(type, value)
	{
		this.type = type;
		this.value = value;
		this.parent = null;
		this.children = [];
	}
	get componentType()
	{
		switch(this.type) {
			case "icon":
			case "style":
				return "span";
			default:
				return this.type;
		}
	}
	get componentOptions()
	{
		switch(this.type) {
			case "icon":
				return {className:`ui-icon ${this.value} inline`};
			case "style":
				return {style:parseStyleOption(this.value)};
			default:
				return this.type;
		}
	}
	addChildren(node)
	{
		this.children.push(node);
		node.parent = this;
	}
	convertToComponent()
	{
		if(this.type === "root") return createElement(Fragment, null, ...this.children.map(node=>node.convertToComponent()));
		if(this.type === "plainText") return this.value;
		if(this.type === "br") return createElement("br", null);
		return createElement(
			this.componentType, 
			this.componentOptions, 
			...this.children.map(node=>node.convertToComponent())
		);
	}
}

class StyledTextTree
{
	constructor()
	{
		this.root = new StyledTextNode("root", null);
		this.current = this.root;
		this.stack = ["root"];
	}
	addText(text)
	{
		let newNode;
		if(text === '\n') newNode = new StyledTextNode("br");
		else newNode = new StyledTextNode("plainText", removeEscape(text) );
		this.current.addChildren(newNode);
	}
	addSingleTag(tagName, value)
	{
		this.current.addChildren( new StyledTextNode(tagName, value) );
	}
	openTag(tagName, value)
	{
		let newNode = new StyledTextNode(tagName, value)
		this.current.addChildren( newNode );
		this.current = newNode;
		this.stack.push(tagName);
	}
	closeTag(tagName)
	{
		if(this.stack.length <= 1) throw new Error("invalid close operation!");
		do {
			this.current = this.current.parent;
		} while(this.stack.pop() !== tagName);
	}
}


function combineRegexpGroup(...arr)
{
	return new RegExp(`(${arr.map(reg=>reg.source).join("|")})`);
}

function parseStyledText(rawText)
{
	const brancketStart = /(?<!\\)\[\/?/;
	const brancketEnd = /(?<!\\)\]/;
	const splitizer = combineRegexpGroup(brancketStart, brancketEnd, /\n/);

	const tokens = rawText.split(splitizer).filter(e=>e!=='');

	let brancketMod = "plain";
	const tree = new StyledTextTree();

	function handleNewTag(tagName, option)
	{
		const singleTag = new Set(["icon"]);
		if(singleTag.has(tagName)) tree.addSingleTag(tagName, option);
		else tree.openTag(tagName, option);
	}

	for(let token of tokens)
	{
		switch(token) {
			case '[':
				if(brancketMod !== "plain") throw new Error("String Parse Error!");
				brancketMod = "tag";
				break;
			case '[/':
				if(brancketMod !== "plain") throw new Error("String Parse Error!");
				brancketMod = "tagEnd";
				break;
			case ']':
				if(brancketMod !== "tag" && brancketMod !== "tagEnd") throw new Error("String Parse Error!");
				brancketMod = "plain";
				break;
			default:
				if(brancketMod === "tag") {
					let [tagName, option] = token.split("=");
					handleNewTag(tagName, option);
				}
				else if(brancketMod === "tagEnd") {
					tree.closeTag(token);
				}
				else {
					tree.addText(token);
				}
		}
	}

	return tree.root.convertToComponent();
}

export {parseStyledText};