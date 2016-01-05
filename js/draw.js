window.addEventListener("load", windowLoadHandler, false);

//for debug messages while testing code
var Debugger = function() { };
Debugger.log = function(message) {
	try {
		console.log(message);
	}
	catch (exception) {
		return;
	}
}

function windowLoadHandler() {
	canvasApp();
}

function canvasSupport() {
	return Modernizr.canvas;
}

function canvasApp() {
	if (!canvasSupport()) {
		return;
	}
	
	var displayCanvas = document.getElementById("displayCanvas");
	var context = displayCanvas.getContext("2d");
	var displayWidth = displayCanvas.width;
	var displayHeight = displayCanvas.height;
	
	//off screen canvas used only when exporting image
	var exportCanvas = document.createElement('canvas');
	exportCanvas.width = displayWidth;
	exportCanvas.height = displayHeight;
	var exportCanvasContext = exportCanvas.getContext("2d");
		
	//buttons
	var btnExport = document.getElementById("btnExport");
	btnExport.addEventListener("click", exportPressed, false);
	
	var btnRegenerate = document.getElementById("btnRegenerate");
	btnRegenerate.addEventListener("click", regeneratePressed, false);
	
	function startGenerate() {
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0,0,displayWidth,displayHeight);
		generateImage();
	}

	startGenerate();
	
	function rgbaToColor(r, g, b, a) {
		var color = "rgba("+r+","+g+","+b+","+a+")";
		return color;
	}

	function generateColor(alpha) {
		var r1 = Math.floor(Math.random() * 255);
		var g1 = Math.floor(Math.random() * 128);
		var b1 = Math.floor(Math.random() * 128);
		return rgbaToColor(r1, g1, b1, alpha);
	}

	function drawInfinity(a, tx, ty, rotationAngle, alpha, lineWidth) {
		var t = -Math.PI;
		var scale = a * Math.sqrt(2);
		var x, y;
		var step = 0.05;

		context.translate(tx, ty);
		context.rotate(rotationAngle * Math.PI / 180);
		context.strokeStyle = generateColor(alpha);
		context.lineWidth = lineWidth;
		context.beginPath();

		for (t = -2 * Math.PI; t <= 2 * Math.PI; t += step) {
			context.moveTo(40 * x, 50 * y);
			x = Math.cos(t) / (Math.sin(t) * Math.sin(t) + 1) * scale;
			y = Math.cos(t) * Math.sin(t) / (Math.sin(t) * Math.sin(t) + 1) * scale;
			context.lineTo(40 * x, 50 * y);
		}

		context.stroke();
		context.rotate(-rotationAngle * Math.PI / 180);
		context.translate(-tx, -ty);
	}

	function drawBackground(count) {
		var i = 0;
		var tx, ty, rotationAngle, lineWidth, alpha, a;
		for (i = 0; i < count; ++i) {
			a = Math.random() * 10;
			tx = Math.random() * displayWidth;
			ty = Math.random() * displayHeight;
			rotationAngle = Math.random() * 90;
			lineWidth = Math.random() * 20;
			alpha = Math.max(Math.random() / 10, 0.1);
			drawInfinity(a, tx, ty, rotationAngle, alpha, lineWidth);
		}
	}

	function generateImage() {
		var currentX = 0, currentY = 0;
		var i;
		var j = 0;

		drawBackground(100);

		var angle = 0;
		for (angle = 0; angle <= 360; angle += 30) {
			for (i = 2; i <= 4; i += 0.01) {
				drawInfinity(i, displayWidth / 2, displayHeight / 2, angle, 0.3, 1);
			}
		}
	}
		
	function exportPressed(evt) {
		//background - otherwise background will be transparent.
		exportCanvasContext.fillStyle = bgColor;
		exportCanvasContext.fillRect(0,0,displayWidth,displayHeight);
		
		//draw
		exportCanvasContext.drawImage(displayCanvas, 0,0,displayWidth,displayHeight,0,0,displayWidth,displayHeight);
		
		//add printed url to image
		exportCanvasContext.fillStyle = urlColor;
		exportCanvasContext.font = 'bold italic 16px Helvetica, Arial, sans-serif';
		exportCanvasContext.textBaseline = "top";
		var metrics = exportCanvasContext.measureText("rectangleworld.com");
		exportCanvasContext.fillText("rectangleworld.com", displayWidth - metrics.width - 10, 5);
		
		//we will open a new window with the image contained within:		
		//retrieve canvas image as data URL:
		var dataURL = exportCanvas.toDataURL("image/png");
		//open a new window of appropriate size to hold the image:
		var imageWindow = window.open("", "fractalLineImage", "left=0,top=0,width="+displayWidth+",height="+displayHeight+",toolbar=0,resizable=0");
		//write some html into the new window, creating an empty image:
		imageWindow.document.write("<title>Export Image</title>")
		imageWindow.document.write("<img id='exportImage'"
									+ " alt=''"
									+ " height='" + displayHeight + "'"
									+ " width='"  + displayWidth  + "'"
									+ " style='position:absolute;left:0;top:0'/>");
		imageWindow.document.close();
		//copy the image into the empty img in the newly opened window:
		var exportImage = imageWindow.document.getElementById("exportImage");
		exportImage.src = dataURL;
	}
	
	function regeneratePressed(evt) {
		startGenerate();
	}
}
