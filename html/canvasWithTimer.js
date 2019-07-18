/*
Javasript to handle mouse dragging and release
to drag a string around the html canvas
Keyboard arrow keys are used to move a moving box around

Here we are doing all the work with javascript and jQuery. (none of the words
are HTML, or DOM, elements. The only DOM element is just the canvas on which
where are drawing and a text field and button where the user can type data

This example shows examples of using JQuery
See the W3 Schools website to learn basic JQuery
JQuery syntax:
$(selector).action();
e.g.
$(this).hide() - hides the current element.
$("p").hide() - hides all <p> elements.
$(".test").hide() - hides all elements with class="test".
$("#test").hide() - hides the element with id="test".

Mouse event handlers are being added and removed using jQuery and
a jQuery event object is being passed to the handlers

Keyboard keyDown handler is being used to move a "moving box" around
Keyboard keyUP handler is used to trigger communication with the
server via POST message sending JSON data

*/

//Use javascript array of objects to represent words and their locations
var song = ""
var words = [];
var curSong = "";

var wayPoints = []; //locations where the moving box has been


var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById('canvas1'); //our drawing canvas

//convert text file to array of string
 function songToWords()  {
	 let textDiv = document.getElementById("text-area");
	 textDiv.innerHTML = "" ;
	 words = [];
	 lines = song.split('\n');
	 var lineNumber = 0;
	 var wordNum = 0;
	 for(i in lines) {
		 		textDiv.innerHTML = textDiv.innerHTML + '<p>' + lines[i] + '</p>' ;
	      lines[i] += '\n';
	      wordNum = 0;
	      var elements = lines[i].split(' ');
		  var totalLength = 0;
          for (j in elements){
			  	lineNumber = i + 6;
				var isChord = false;
				var chord = "";
                var chordNum = 0;
				
              //check if it's a chord, if it is, add it to chord array
                for (k in elements[j]){
                    if (elements[j][k] === '[') {
                        isChord = true;

                    }
                    if (elements[j][k-1] === ']'){
                        isChord = false;

						chordNum++;
					}
                    if (isChord) {
                        chord += elements[j][k];
					} 
                }
              //display chords, substitude chord with space
				if(chord != ""){
					 words.push({word: chord, x: totalLength, y: (lineNumber * 5) - 20, isChord: true});
                     elements[j] = elements[j].replace(chord, ' ');
                }
              //display lyrics
                if (elements[j] && elements[j]!=' ') {
                    words.push({ word: elements[j], x: totalLength, y: lineNumber * 5, isChord: false });
                    totalLength += elements[j].length * 17;
                    wordNum++;
				}
		  }
	 }
 }



function getWordAtLocation(aCanvasX, aCanvasY){
	var context = canvas.getContext('2d');
	  //locate the word near aCanvasX,aCanvasY
	  //Just use crude region for now.
	  //should be improved to using lenght of word etc.

	  //note you will have to click near the start of the word
	  //as it is implemented now
	  for(var i=0; i<words.length; i++){
          if (aCanvasX < context.measureText(words[i].word).width + words[i].x &&
              aCanvasX > words[i].x &&
		      Math.abs(words[i].y - aCanvasY) < 20) return words[i];
	  }
	  return null;
    }
	// edit by yaji
var drawCanvas = function(){

    var context = canvas.getContext('2d');
	canvas.width = 1000;
	canvas.height = 600;
    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas

    context.font = '14pt Courier';
    context.fillStyle = 'cornflowerblue';
    context.strokeStyle = 'blue';

     for(var i=0; i<words.length; i++){  //note i declared as var
			var data = words[i];
			if(data.isChord){
				context.strokeStyle = 'cyan';
			}
			else {
				context.strokeStyle = 'violet';
			}
			context.fillText(data.word, data.x, data.y);
            context.strokeText(data.word, data.x, data.y);	
	}
    context.stroke();
}

function handleMouseDown(e){

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    //var canvasX = e.clientX - rect.left;
    //var canvasY = e.clientY - rect.top;
    var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    var canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);

	wordBeingMoved = getWordAtLocation(canvasX, canvasY);
	//console.log(wordBeingMoved.word);
	if(wordBeingMoved != null ){
	   deltaX = wordBeingMoved.x - canvasX;
	   deltaY = wordBeingMoved.y - canvasY;
	   //document.addEventListener("mousemove", handleMouseMove, true);
       //document.addEventListener("mouseup", handleMouseUp, true);
	$("#canvas1").mousemove(handleMouseMove);
	$("#canvas1").mouseup(handleMouseUp);

	}

    // Stop propagation of the event and stop any default
    //  browser action

    e.stopPropagation();
    e.preventDefault();

	drawCanvas();
	}

function handleMouseMove(e){

	console.log("mouse move");

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    var canvasX = e.pageX - rect.left;
    var canvasY = e.pageY - rect.top;

	wordBeingMoved.x = canvasX + deltaX;
	wordBeingMoved.y = canvasY + deltaY;

	e.stopPropagation();

	drawCanvas();
	}

function handleMouseUp(e){
	console.log("mouse up");

	e.stopPropagation();

    //$("#canvas1").off(); //remove all event handlers from canvas
    //$("#canvas1").mousedown(handleMouseDown); //add mouse down handler

	//remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

	drawCanvas(); //redraw the canvas
	}

//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

function handleSubmitButton () {
    var userText = $('#userTextField').val(); //get text from user text input field
    if (userText && userText != '') {
        //user text was not empty
		let textDiv = document.getElementById("text-area")
	   //textDiv.innerHTML = textDiv.innerHTML + `<p> ${userText}</p>`  //dont know why but comment this one out and its still working
        var userRequestObj = { text: userText }; //make object to send to server
        var userRequestJSON = JSON.stringify(userRequestObj); //make json string
        $('#userTextField').val(''); //clear the user text field

	   //Prepare a POST message for the server and a call back function
	   //to catch the server repsonse.
       //alert ("You typed: " + userText);
        //display songs upon click the submit button
	   $.post("userText", userRequestJSON, function(data, status){
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			var responseObj = JSON.parse(data);
			if(responseObj.song) {
                song = responseObj.song;
                curSong = userText;
				songToWords();
				drawCanvas();
			}
		});
	}

}

/*
//new button to save change
function handleChangeButton() {
    wordsToSong();
    var userRequestObj = { text: "change", song: song, file: curSong };
    var userRequestJSON = JSON.stringify(userRequestObj);
    $.post(curSong, userRequestJSON, function (data, status) {
        var responseObj = JSON.parse(request);
        movingString.word = responseObj.file;
    });
}
*/

$(document).ready(function(){
	//This is called after the broswer has loaded the web page

	//add mouse down listener to our canvas object
	$("#canvas1").mousedown(handleMouseDown);

	drawCanvas();
});
