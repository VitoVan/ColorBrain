$(document).ready(function(){
	trainer.changeColor();
	$('.chooser-block>span').click(function(){
		trainer.pickColor($(this).attr('class').trim());
		$(this).attr('touched','touched')
	});
	$('.btn-train').click(function(){
		trainer.trainNetwork();
	});
	$('.btn-test').click(function(){
		tester.testRandom();
	});
});
//copy from http://harthur.github.io/brain/blackorwhite.js
var utils= {
	randomColor: function() {
		return { r: Math.round(Math.random() * 255),
				 g: Math.round(Math.random() * 255),
				 b: Math.round(Math.random() * 255) };
	},

	toRgb: function(color) {
		return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
	},

	normalize: function(color) {
		return { r: color.r / 255, g: color.g / 255, b: color.b / 255 };
	}
};
var trainer= {
	data: [],
	currentColor : utils.randomColor(),
	genOutput: function(color){
		return{
			red: color=== 'red'? 1: 0,
			orange: color=== 'orange'? 1: 0,
			yellow: color=== 'yellow'? 1: 0,
			green: color=== 'green'? 1: 0,
			cyan: color=== 'cyan'? 1: 0,
			blue: color=== 'blue'? 1: 0,
			purple: color=== 'purple'? 1: 0
		};
	},
	pickColor: function(color) {
		var result= {input: utils.normalize(this.currentColor), output: this.genOutput(color)};
		this.data.push(result);
		this.changeColor();
		// show the "Train network" button after we've selected a few entries
		if (this.data.length == 20) {
			$(".btn-train").show();
			$('.message').text('you can keep teaching or click the TRAIN button, the more you teach, more clever it will be.');
		}
	},
	changeColor: function() {
		this.currentColor= utils.randomColor();
		var rgb= utils.toRgb(this.currentColor);
		$('.color-block').css('background-color',rgb);
	},
	trainNetwork : function() {
		$(".btn-train").hide();
		$(".chooser-block").hide();
		$(".progress-box").show();

		if(window.Worker){
			var worker= new Worker("training-worker.js");
			worker.onmessage= this.onMessage;
			worker.onerror= this.onError;
			worker.postMessage(JSON.stringify(this.data));
		} else{
			var net= new brain.NeuralNetwork();
			net.train(this.data, {
				iterations: 9000
			});
			tester.show(net);
		}
	},
	onMessage: function(event) {
		var data= JSON.parse(event.data);
		if(data.type== 'progress') {
			trainer.showProgress(data);
		}else if(data.type== 'result') {
			var net = new brain.NeuralNetwork().fromJSON(data.net);
			tester.show(net);
		}
	},
	onError: function(event) {
		alert('training error');
		console.log("error training network: ", event.message);
	},
	showProgress: function(progress) {
		var completed = progress.iterations / 9000 * 100;
		$(".progress-completed").css("width", completed + "%");
	}
};
var tester= {
	show: function(net){
		$(".progress-box").hide();
		runNetwork= net.toFunction();
		runNetwork.name= "runNetwork"; // for view code later
		$('.chooser-block').css('pointer-events','none');
		$('.chooser-block').show();
		$('.chooser-block>span:not([touched="touched"])').hide();
		$('.btn-test').show();
		this.testRandom();
	},
	testRandom: function() {
		this.testColor(utils.randomColor());
	},
	testColor: function(color){
		var rgb = utils.toRgb(color);
		$(".color-block").css("backgroundColor", rgb);

		var color = utils.normalize(color);
		var colorStr = this.getColorStr(runNetwork(color));
		$('.chooser-block>span').removeClass('choosed');
		$('.'+ colorStr).addClass('choosed');
	},
	getColorStr: function(output){
		var finalChoose = '';
		var preValue = 0;
		for(name in output){
			if( output[name]> preValue){
				preValue= output[name];
				finalChoose= name;
			}
		}
		return finalChoose;
	}
};
