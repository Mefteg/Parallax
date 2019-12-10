"use strict";

class Parallax
{
	constructor()
	{
		this.layers = [];
		this.mouseInside = false;
		this.config = this.createDefaultConfig();
	}

	createDefaultConfig()
	{
		let config = {};
		config['width'] = 300;
		config['height'] = 200;
		config['parallax_x'] = 0;
		config['parallax_y'] = 0;

		config['layers'] = [];

		return config;
	}

	start(_parentId, _config)
	{
		if (_config == null)
		{
			this.createConfigFromDOM(_parentId);
		}

		this.removeChildren(_parentId);

		let gameConfig = {
			parent: _parentId,
			type: Phaser.AUTO,
			width: this.config.width,
			height: this.config.height,
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
				preload: () => {
					this.preload();
				},
				create: () => {
					this.create();
				},
				update: () => {
					this.update();
				}
			}
		};	

		this.game = new Phaser.Game(gameConfig);
		this.game.canvas.onmouseover = () => {
			this.mouseInside = true;
		};
	}

	createConfigFromDOM(_rootId)
	{
		// Get root.
		let root = document.getElementById(_rootId);
		if (root == null)
		{
			console.log("Can't find element '" + _rootId + "'.");
			return {};
		}

		// Get root attributes
		this.config['width'] = parseInt(root.getAttribute('width'));
		this.config['height'] = parseInt(root.getAttribute('height'));
		this.config['parallax_x'] = parseInt(root.getAttribute('parallax-x'));
		this.config['parallax_y'] = parseInt(root.getAttribute('parallax-y'));

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
			layer['x'] = parseInt(image.getAttribute('x'));
			layer['y'] = parseInt(image.getAttribute('y'));
			layer['parallax_ratio_x'] = parseFloat(image.getAttribute('parallax-ratio-x'));
			layer['parallax_ratio_y'] = parseFloat(image.getAttribute('parallax-ratio-y'));

			// Add the layer to the layers list.
			layers.push(layer);
		}

		// Add all the layer to the config.
		this.config['layers'] = layers;
	}

	removeChildren(_parentId)
	{
		let parent = document.getElementById(_parentId);
		if (parent == null)
		{
			console.log("Can't find element '" + _parentId + "'.");
			return;
		}	

		parent.innerHTML = "";
	}


	preload()
	{
		let currentScene = this.game.scene.getAt(0);

		let layerCount = this.config.layers.length;
		for (let i = 0; i < layerCount; ++i)
		{
			let layerConfig = this.config.layers[i];
			currentScene.load.image(layerConfig.name, layerConfig.src);
		}
	}

	create()
	{
		let currentScene = this.game.scene.getAt(0);

		let canvasWidth = this.game.canvas.width;
		let canvasHeight = this.game.canvas.height;

		let layerCount = this.config.layers.length;
		for (let i = 0; i < layerCount; ++i)
		{
			let layerConfig = this.config.layers[i];
			this.layers.push(currentScene.add.image(canvasWidth / 2, canvasHeight / 2, layerConfig.name));
		}
	}

	update()
	{
		let canvasWidth = this.game.canvas.width;
		let canvasHeight = this.game.canvas.height;

		var pointer = this.game.input.activePointer;
		let ratioX = this.mouseInside ? (pointer.worldX / canvasWidth) - 0.5 : 0;
		let ratioY = this.mouseInside ? (pointer.worldY / canvasHeight) - 0.5 : 0;

		let layerCount = this.layers.length;
		for (let i = 0; i < layerCount; ++i)
		{
			let layerConfig = this.config.layers[i];

			let layer = this.layers[i];
			layer.x = layerConfig.x - (ratioX * this.config.parallax_x * layerConfig.parallax_ratio_x);
			layer.y = layerConfig.y - (ratioY * this.config.parallax_y * layerConfig.parallax_ratio_y);
		}
	}
}
