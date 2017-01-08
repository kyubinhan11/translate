(function () {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDUid3Hb5DOI0gql4OoTaMloFLEoP10AV4",
		authDomain: "canadaforum-18020.firebaseapp.com",
		databaseURL: "https://canadaforum-18020.firebaseio.com",
		storageBucket: "canadaforum-18020.appspot.com",
		messagingSenderId: "496860594601"
	};
	firebase.initializeApp(config);

	// define our app and dependencies ngSanitize is for rendering HTML in ng-repeat
	angular.module("mainApp", ["firebase", "ngSanitize","angularUtils.directives.dirPagination"])
	.controller("ParentController", ParentController)
	.controller('ChildController', ChildController)
	.factory('ParasAndArrayOfTransFactory', ["$firebaseObject", "$firebaseArray",
		function($firebaseObject, $firebaseArray){
			return function(path, language, numOfPara) {
				return new ParasAndArrayOfTransService($firebaseObject, $firebaseArray, path, language, numOfPara);
			}
		}
	]);


	function ParasAndArrayOfTransService($firebaseObject, $firebaseArray, path, language, numOfPara) {

		var service = this;

		service.getNumOfPara = function(){
			return numOfPara;
		}

		service.getPath = function(){
			return path;
		}

		// default value as [10, 10, 10, ...]
		service.theNumberOfEachTranslations = function(){
			var array = [];
			for (var i = 0; i < numOfPara; i++) {
				array.push(10);
			}
			return array;
		}

		service.getLink = function(){
			var ref = firebase.database().ref().child(path +"/link");
			return $firebaseObject(ref);
		}

		service.getSnoopiIpAddress = function(){
			var ref = firebase.database().ref("ipaddress");
			return $firebaseObject(ref);
		}

		service.getParagraphs = function(){
			var ref = firebase.database().ref().child(path + "/paragraphs");
			return $firebaseArray(ref);
		}

		service.getArrayofTranslations = function(){
			var array = [];
			var ref;
			for (var index = 1; index< 1 + numOfPara; index++){
				ref = firebase.database().ref().child(path + "/paragraphs" + "/paragraph" + index + "/"+ language);
				array.push($firebaseArray(ref));
			}
			// console.log(array);
			return array;
		};

	};

	ParentController.$inject = ["$window", "$http", "$firebaseAuth", "ParasAndArrayOfTransFactory"]
	function ParentController($window, $http, $firebaseAuth, ParasAndArrayOfTransFactory){
		var mainCtrl = this;

		// TESTINGFORKEVIN.TK translatetogetherCIC.com

		mainCtrl.EEHomeService = ParasAndArrayOfTransFactory("ExpressEntry/Home", "korean", 8);
		mainCtrl.EEFederalSkilledWorkersService = ParasAndArrayOfTransFactory("ExpressEntry/Federal skilled workers", "korean", 8);

		// it initializes mainCtrl.paragraphs, mainCtrl.numOfParagraphs, mainCtrl.userIpaddress
		// mainCtrl.ArrayOfTranslations, mainCtrl.link, mainCtrl.theNumberOfEachTranslations
		setValuesForController(mainCtrl, mainCtrl.EEHomeService);
		// setValuesForController(mainCtrl, mainCtrl.EEFederalSkilledWorkersService);

		// initialize mainCtrl.theNumberOfEachTranslations and fill the black translations with default values
		// and upload the latest content(translation) in each textareas of each paragraphs
		loadValuesFromFirebaseArrays(mainCtrl, mainCtrl.EEHomeService);
		// loadValuesFromFirebaseArrays(mainCtrl, mainCtrl.EEFederalSkilledWorkersService);



		mainCtrl.changeService = function(controller, service){
			setValuesForController(controller, service);
			loadValuesFromFirebaseArrays(controller, service);
		};

		/* AUTHENTIFICATION */
		mainCtrl.auth = $firebaseAuth();
		mainCtrl.adminId = "0E7culXypcRT3MBc9syiqXdW5RJ2";
		// any time auth state changes, add the user data to scope
	    mainCtrl.auth.$onAuthStateChanged(function(firebaseUser) {
	        mainCtrl.firebaseUser = firebaseUser;
	        // console.log(mainCtrl.firebaseUser);
	        if(firebaseUser){
	        	mainCtrl.user = firebaseUser.displayName;
	        }else{
	        	mainCtrl.user = "Guest " + Math.round(Math.random() * 100);
	        }
	    });


		console.log(mainCtrl.SnoopiIpaddress);


		// triggerd when clicking 'save' button to save the translation
	    // add translations to firebase (triggered by the save button)
		mainCtrl.addTranslation = function(translationsRef, index){
			//console.log(mainCtrl.content);
			if(mainCtrl.content){
					if(mainCtrl.firebaseUser)	{
						// calling $add on a synchronized array is like Array.push(),
				        // except that it saves the changes to our database!
				      	translationsRef.$add({
				      		user: mainCtrl.user,
				      		userIpaddress : mainCtrl.userIpaddress,
				      		faultyCount: 0,
				      		// each paragraphs get assigned different textareas and content
				      		// by having index, content will be added in the right firebaseArray
				      		content: mainCtrl.content[index].replace(/\n/g, '<br>'),
				      		timestamp: firebase.database.ServerValue.TIMESTAMP
				      	});

				      	// reset the message input
				     	mainCtrl.content[index] = "";
				    }
				    else{
				    	alert("please log in first! but don't worry the data you have written is still alive");
				    }
		    }
		    else{
		    	alert("you ain't write anything");
		    }

		};

		// triggered when clicking 'translate' button to show user's IP address
		// and tell them they need to log in first to save what they write
		mainCtrl.createUserIpaddress = function(){
			if(!mainCtrl.firebaseUser){
				alert("you need to log in to save your translation");
			}
			  // snoopi.io & https://stackoverflow.com/questions/391979/how-to-get-clients-ip-address-using-javascript-only?page=1&tab=votes#tab-top
		    $http.get(mainCtrl.SnoopiIpaddress)
		    .then(function(response) {
		        mainCtrl.userIpaddress = response.data["requested_address"];
		        // console.log(mainCtrl.userIpaddress);
		    }).catch(function(error){
				console.log(error.message);
			});
		};

		// allow users to claim and unclaim the translation is faulty
		// and keep track of how many claims a translation has received
		mainCtrl.claimFaultyTranslation = function(translationsRef, translation, uid){
			if(mainCtrl.firebaseUser){
				// console.log(translation.faultyCount);
				// console.log(translation.faultyTranslation);
				// console.log(uid);

				// if user has already claimed, then toggle back to unclaim
				if (translation.faultyTranslation && translation.faultyTranslation[uid]){
					translation.faultyCount--;
					translation.faultyTranslation[uid] = null;
				} else { // if it hasn't been claimed, then claim that this translation is faulty
					translation.faultyCount++;
					if (!translation.faultyTranslation) {
						translation.faultyTranslation = {};
					}
					translation.faultyTranslation[uid] = true;
				}

				// and save the change
				translationsRef.$save(translation);

			} else{
				alert('please log in first!');
			}
		};


		// converts unix timestamp to readable date
		mainCtrl.convertTimestamp = function(UNIX_timestamp){
			var d = new Date(UNIX_timestamp);
			//d.toString() = "Mon Jan 02 2017 13:27:31 GMT-0800 (Pacific Standard Time)"
			return d.toString().slice(4,21);
		};

		mainCtrl.alert = function(text){
			alert(text);
		};

		mainCtrl.reload = function() {
		   $window.location.reload();
		}

		// only for admin
		mainCtrl.hideTranslation = function(translationsRef, translation){
			//console.log(translationsRef);
			//console.log($scope.firebaseUser.uid);   // mine is 0E7culXypcRT3MBc9syiqXdW5RJ2
			if(mainCtrl.firebaseUser){
				if(mainCtrl.firebaseUser.uid == mainCtrl.adminId){
					// update its timestamp as later so it won't show up at the first
					translation.timestamp = translation.timestamp - 100000000;
					translationsRef.$save(translation);
				}else{

				}
			}
		};

		// only for admin
		mainCtrl.removeTranslation = function(translationsRef, translation){
			//console.log(translationsRef);
			//console.log($scope.firebaseUser.uid);   // mine is 0E7culXypcRT3MBc9syiqXdW5RJ2
			if(mainCtrl.firebaseUser){
				if(mainCtrl.firebaseUser.uid == mainCtrl.adminId){
					translationsRef.$remove(translation);
				}else{

				}
			}
		};

	}; // end of ParenetController

	// it initializes controller.paragraphs, controller.numOfParagraphs, controller.userIpaddress
  // controller.ArrayOfTranslations, controller.link, controller.theNumberOfEachTranslations
	// controller.path, controller SnoopiIpaddress
	function setValuesForController(controller, service){
		//set paragraphs and the number of paragraphs
		service.getParagraphs().$loaded(function(data){
			controller.paragraphs = data;
			controller.numOfParagraphs = data.length;
		});

		// set the array of translations which is an array of FirebaseArrays
		controller.ArrayOfTranslations = service.getArrayofTranslations();

		// set link that is retrieved from the database
		controller.link = service.getLink();

		// set fake array of the number of each translations(firebaseArray) [10, 10, 10, ...]
		// as a default then loadValuesFromFirebaseArrays() will upload the real one
		controller.theNumberOfEachTranslations = service.theNumberOfEachTranslations();

		// set path to link to the HTMl
		controller.path = service.getPath();

		// set SnoopiIpaddress for HTTP request
		service.getSnoopiIpAddress().$loaded(function(data){
				controller.SnoopiIpaddress = data["$value"];
		});
	};

	// initialize controller.theNumberOfEachTranslations and fill the black translations with default values
	// and upload the latest content(translation) in each textareas of each paragraphs
	function loadValuesFromFirebaseArrays(controller, service){
		var theNumberOfEachTranslations = [];
		var content = [];
		// the stuff that we iterates is an array of FirebaseArrays
		for(var i=0; i < service.getNumOfPara(); i++){
			firebaseArray = service.getArrayofTranslations()[i];
			firebaseArray.$loaded().then(function(translations){
				// console.log(translations.length);  // translations is a FirebaseArray
				// fill the black translations with default values
				if(translations.length === 0){
					translations.$add({
						user: "admin",
		      			content: "please translate :)",
		      			timestamp: firebase.database.ServerValue.TIMESTAMP,
		      			faultyCount: 0
					});
				}

				// upload the latest content(translation) in each textareas of each paragraphs
				// latestTranslation.content contains <br> so we need to replace it with '\n'
				latestTranslation = translations[translations.length-1];
				content.push(latestTranslation.content.replace(/<br>/g, '\n'));
				controller.content = content;

				// set the 'real' number of each translations
				theNumberOfEachTranslations.push(translations.length);
				controller.theNumberOfEachTranslations = theNumberOfEachTranslations;
				// console.log(controller.theNumberOfEachTranslations);
			}).catch(function(error){
				console.log(error.message);
			});
		} // end of for loop


	}



	ChildController.$inject = ["$http","$firebaseAuth","ParasAndArrayOfTransFactory"];
	function ChildController($http, $firebaseAuth, ParasAndArrayOfTransFactory){
		var child = this;


	};

})();
