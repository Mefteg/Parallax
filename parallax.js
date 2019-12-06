"use strict";

var ParallaxConfig = {
	parallax_x: 200,
	parallax_y: 100,
	layers: [
	{
		name: "sky",
		src: "assets/skies/space3.png",
		parallax_ratio_x: 1,
		parallax_ratio_y: 1
	},
	{
		name: "logo",
		src: "assets/sprites/phaser3-logo.png",
		parallax_ratio_x: 0.5,
		parallax_ratio_y: 0.5
	}
	]
};

var Layers = [];
var MouseInside = false;

function CreateConfigFromDOM(_rootId)
{
	// Get root.
	let root = document.getElementById(_rootId);
	if (root == null)
	{
		console.log("Can't find element '" + _rootId + "'.");
		return {};
	}

	var config = {};
	// Get root attributes
	config['width'] = parseInt(root.getAttribute('width'));
	config['height'] = parseInt(root.getAttribute('height'));
	config['parallax_x'] = parseInt(root.getAttribute('parallax-x'));
	config['parallax_y'] = parseInt(root.getAttribute('parallax-y'));

	// Get all layers.
	let images = root.getElementsByTagName('img');
	if (images == null)
	{
		console.log("Can't find any image in element '" + _rootId + "'.");
		return {};
	}

	let layerCount = images.length;
	let layers = [];
	for (let i = 0; i < layerCount; ++i)
	{
		let image = images[i];

		// Create current layer.
		let layer = {};

		// Get layer attributes.
		layer['name'] = image.getAttribute('name');
		layer['src'] = image.getAttribute('src');
		layer['parallax_ratio_x'] = parseFloat(image.getAttribute('parallax-ratio-x'));
		layer['parallax_ratio_y'] = parseFloat(image.getAttribute('parallax-ratio-y'));

		// Add the layer to the layers list.
		layers.push(layer);
	}

	// Add all the layer to the config.
	config['layers'] = layers;

	return config;
}

function RemoveChildren(_parentId)
{
	let parent = document.getElementById(_parentId);
	if (parent == null)
	{
		console.log("Can't find element '" + _parentId + "'.");
		return;
	}	

	parent.innerHTML = "";
}

function ParallaxMain(_parentId)
{
	ParallaxConfig = CreateConfigFromDOM(_parentId);
	RemoveChildren(_parentId);

	var gameConfig = {
		parent: _parentId,
		type: Phaser.AUTO,
		width: ParallaxConfig.width,
		height: ParallaxConfig.height,
		fps: {
			target: 30
		},
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 200 }
			}
		},
		scene: {
			preload: preload,
			create: create,
			update: update
		}
	};	

	let game = new Phaser.Game(gameConfig);
	game.canvas.onmouseover = () => {
		MouseInside = true;
	};
}

function preload ()
{
	this.load.setBaseURL('http://labs.phaser.io');

	let layerCount = ParallaxConfig.layers.length;
	for (let i = 0; i < layerCount; ++i)
	{
		let layerConfig = ParallaxConfig.layers[i];
		this.load.image(layerConfig.name, layerConfig.src);
	}
}

function create ()
{
	let canvasWidth = this.game.canvas.width;
	let canvasHeight = this.game.canvas.height;

	let layerCount = ParallaxConfig.layers.length;
	for (let i = 0; i < layerCount; ++i)
	{
		let layerConfig = ParallaxConfig.layers[i];
		Layers.push(this.add.image(canvasWidth / 2, canvasHeight / 2, layerConfig.name));
	}
}

function update()
{
	let canvasWidth = this.game.canvas.width;
	let canvasHeight = this.game.canvas.height;

	var pointer = this.input.activePointer;
	let ratioX = MouseInside ? (pointer.worldX / canvasWidth) - 0.5 : 0;
	let ratioY = MouseInside ? (pointer.worldY / canvasHeight) - 0.5 : 0;

	let layerCount = Layers.length;
	for (let i = 0; i < layerCount; ++i)
	{
		let layerConfig = ParallaxConfig.layers[i];

		let layer = Layers[i];
		layer.x = (canvasWidth / 2) - (ratioX * ParallaxConfig.parallax_x * layerConfig.parallax_ratio_x);
		layer.y = (canvasHeight / 2) - (ratioY * ParallaxConfig.parallax_y * layerConfig.parallax_ratio_y);
	}
}