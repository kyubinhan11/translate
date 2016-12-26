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
TranslateTogether.oldparagraphTemplate = 
	'<div class="row">' +			
		'<div class="col-lg-5 col-sm-6 highlighted">' +			
			'<p class="english"></p> </div>' +	
		'<div class="col-lg-5 col-lg-offset-2 col-sm-6" >' +
		'<p class="translated"></p></div>' +					      
	'</div>'+
	'<br><br>';

TranslateTogether.paragraphTemplate = 
				
	'<div class="highlighted">' +			
		'<p class="english"></p>' + 
	'</div>';
							      
TranslateTogether.translatedTemplate =
	
	'<div>' +			
		'<p class="translated"></p>' + 
	'</div>';

TranslateTogether.prototype.displayContents = function(){
	const ExpressEntryHomeParagraph = this.databaseRef.child('ExpressEntry').child('home').child('paragraph');	
	const ExpressEntryHomeTranslation = this.databaseRef.child('ExpressEntry').child('home').child('translation');
	
    //console.log(container);
    
    ExpressEntryHomeParagraph.on('child_added', snap => {
    	//console.log(snap.val()); 
    	var container = document.createElement('div');   	
    	container.innerHTML = TranslateTogether.paragraphTemplate;
   		var div = container.firstChild;
   		div.id = snap.key;
   		document.getElementById('content').appendChild(div);
	    var englishElement = div.querySelector('.english');
	    englishElement.innerHTML = snap.val();
	        	
    });

    ExpressEntryHomeTranslation.on('child_added', snap =>{
    	var container1 = document.createElement('div');
    	container1.innerHTML = TranslateTogether.translatedTemplate;
    	var div1 = container1.firstChild;
    	div1.id = snap.key;
    	document.getElementById('translatedContent').appendChild(div1);
    	var translatedElement = div1.querySelector('.translated');
	    translatedElement.textContent = snap.val(); 
    });
};



window.onload = function(){
  window.translateTogether = new TranslateTogether();
};