function TranslateTogether(){


	this.initApp();
	this.displayContents();
}

TranslateTogether.prototype.initApp = function() {
	// shortcuts to Firebase SDK features.
	this.auth = firebase.auth();
	this.database = firebase.database();
	this.storage = firebase.storage();

	this.databaseRef = this.database.ref();

};
// TranslateTogether.oldparagraphTemplate = 
// 	'<div class="row">' +			
// 		'<div class="col-lg-5 col-sm-6 highlighted">' +			
// 			'<p class="english"></p> </div>' +	
// 		'<div class="col-lg-5 col-lg-offset-2 col-sm-6" >' +
// 		'<p class="translated"></p></div>' +					      
// 	'</div>'+
// 	'<br><br>';

TranslateTogether.paragraphTemplate = 
	'<div class="row highlighted">' +			
		'<div class="col-lg-5 col-sm-6">' +			
			'<p class="english"></p> </div>' +	
		'<div class="col-lg-5 col-lg-offset-2 col-sm-6 " >' +
		'<p class="korean"></p></div>'+					      
	'</div>';
	
		



TranslateTogether.prototype.displayContents = function(){
	const ExpressEntryHomeParagraph = this.databaseRef.child('ExpressEntry').child('home').child('paragraphs');	
	
    //console.log(container);
    
    ExpressEntryHomeParagraph.on('child_added', snap => {
    	var value = snap.val();
    	var container = document.createElement('div');   	
    	container.innerHTML = TranslateTogether.paragraphTemplate;
   		var div = container.firstChild;
   		div.id = snap.key;
   		document.getElementById('content').appendChild(div);
	    var englishElement = div.querySelector('.english');
	    englishElement.innerHTML = value['english'];
	    var translatedElement = div.querySelector('.korean');
	    translatedElement.innerHTML = value['korean'];     	
    });

    
};



window.onload = function(){
  window.translateTogether = new TranslateTogether();
};