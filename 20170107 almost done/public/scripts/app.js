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
	angular.module("mainApp", ["firebase", "ngSanitize", "ui.router"])
	.controller("MainController", MainController)
	.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
	})
	.directive('dirNav', function () {
	  var ddo = {
	    templateUrl: 'template/dir-nav.html'
	  };
	  return ddo;
	})
	.factory('ParasAndArrayOfTransFactory', ["$firebaseObject", "$firebaseArray",
		function($firebaseObject, $firebaseArray){
			return function(path, language, numOfPara) {
				return new ParasAndArrayOfTransService($firebaseObject, $firebaseArray, path, language, numOfPara);
			}
		}
	]);


	function ParasAndArrayOfTransService($firebaseObject, $firebaseArray, path, language, numOfPara) {

		var service = this;

		// console.log(path);  // ex ["ExpressEntry", "Home"]
		var concatenatedPath = "";

		for (each of path) {
			concatenatedPath += each + "/";
		} // ex "ExpressEntry/Home/";

		service.getNumOfPara = function(){
			return numOfPara;
		}

		service.getPath = function(){
			var con= "";
			for (each of path) {
				con += each.replace(/_/g, " ") + " > ";
			}
			return con.slice(0, con.length-2);
		}

		service.getTitle = function () {
			return path[path.length-1].replace(/_/g, " ");
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
			var ref = firebase.database().ref().child(concatenatedPath +"link");
			return $firebaseObject(ref);
		}

		service.getBannedUsers = function() {
			var ref = firebase.database().ref("bannedUsers");
			return $firebaseObject(ref);
		}


		service.getParagraphs = function(){
			var ref = firebase.database().ref().child(concatenatedPath + "paragraphs");
			return $firebaseArray(ref);
		}

		service.getArrayofTranslations = function(){
			var array = [];
			var ref, query;
			// para01, para02, ''' para10, para11, 
			for (var index = 1; index< 1 + numOfPara; index++){
				if(index < 10){
					ref = firebase.database().ref().child(concatenatedPath + "paragraphs" + "/paragraph0" + index + "/"+ language);
					query = ref.orderByChild("timestamp").limitToLast(10);
					array.push($firebaseArray(query));
				} else{
					ref = firebase.database().ref().child(concatenatedPath + "paragraphs" + "/paragraph" + index + "/"+ language);
					query = ref.orderByChild("timestamp").limitToLast(10);
					array.push($firebaseArray(query));
				}
			}
			// console.log(array);
			return array;
		};

	};

	MainController.$inject = ["arrayOfPath", "$window", "$http", "$firebaseAuth", "ParasAndArrayOfTransFactory"]
	function MainController(arrayOfPath, $window, $http, $firebaseAuth, ParasAndArrayOfTransFactory){
		var mainCtrl = this;
		const cutoffFaultyCount = 9;
		const admin = "0E7culXypcRT3MBc9syiqXdW5RJ2";
		const language = "korean";
		// TESTINGFORKEVIN.TK translatetogetherCIC.com

		// mainCtrl.EEHomeService = ParasAndArrayOfTransFactory(["ExpressEntry", "Home"], "korean", 8);
		// mainCtrl.EEFederalSkilledWorkersService = ParasAndArrayOfTransFactory(["ExpressEntry", "Federal skilled workers"], "korean", 8);
		// setValuesForController(mainCtrl, mainCtrl.EEFederalSkilledWorkersService);
		// loadValuesFromFirebaseArrays(mainCtrl, mainCtrl.EEFederalSkilledWorkersService);


		// arrayOfPath is from ui-router
		var path = arrayOfPath.slice(0, arrayOfPath.length-1); // the last element in this array is the number of Paragraphs
		mainCtrl.mainService = ParasAndArrayOfTransFactory(path, language, arrayOfPath[arrayOfPath.length-1]);

		// it initializes mainCtrl.paragraphs, mainCtrl.numOfParagraphs, mainCtrl.userIpaddress
		// mainCtrl.ArrayOfTranslations, mainCtrl.link, mainCtrl.theNumberOfEachTranslations, mainCtrl.path
		setValuesForController(mainCtrl, mainCtrl.mainService);

		// initialize mainCtrl.theNumberOfEachTranslations and fill the black translations with default values
		// and upload the latest content(translation) in each textareas of each paragraphs
		loadValuesFromFirebaseArrays(mainCtrl, mainCtrl.mainService);


		/* AUTHENTIFICATION */
		mainCtrl.auth = $firebaseAuth();
		mainCtrl.adminId = admin;
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



		// triggerd when clicking 'save' button to save the translation
	  // add translations to firebase (triggered by the save button)
		mainCtrl.addTranslation = function(translationsRef, index){
			// console.log(mainCtrl.content[index]);

			// there should be some writing
			if(mainCtrl.content[index]){
					// if user logged in
					if(mainCtrl.firebaseUser)	{
						  // console.log(Object.values(mainCtrl.bannedUsers));
							// console.log("are you a bad user?", mainCtrl.firebaseUser.uid);

							// mainCtrl.userIpaddress = "123.123.123.123";
							// if our ip address finder works just fine it will ban bad users
							if (mainCtrl.userIpaddress) {
										// ex 123.123.123.123 -> 123123123123
										mainCtrl.userIpaddress = mainCtrl.userIpaddress.replace(/\./g, "");
										// console.log("are you a bad user?", mainCtrl.bannedUsers[mainCtrl.userIpaddress]);
										// if this user's ipaddress is not in the bannedUsers object then add translation
										if(!mainCtrl.bannedUsers[mainCtrl.userIpaddress]){
												// calling $add on a synchronized array is like Array.push(),
												// except that it saves the changes to our database!
												translationsRef.$add({
													user: mainCtrl.user,
													userIpaddress : mainCtrl.userIpaddress,
													faultyCount: 0,
													userUid: mainCtrl.firebaseUser.uid,
													// each paragraphs get assigned different textareas and content
													// by having index, content will be added in the right firebaseArray
													content: mainCtrl.content[index].replace(/\n/g, '<br>').replace(/ /g,'&nbsp'),
													timestamp: firebase.database.ServerValue.TIMESTAMP
												});

												// reset the message input
												mainCtrl.content[index] = "";

										}
						 	} else if (!mainCtrl.bannedUsers[mainCtrl.firebaseUser.uid]) {
										// but if Ipfinder isn't working, I will look up the uids that were saved in the array of bannedUsers
										// so I can still keep these users from sabotaging
										translationsRef.$add({
											user: mainCtrl.user,
											userIpaddress : "stupid ipfinder is not working",
											faultyCount: 0,
											// each paragraphs get assigned different textareas and content
											// by having index, content will be added in the right firebaseArray
											userUid: mainCtrl.firebaseUser.uid,
											content: mainCtrl.content[index].replace(/\n/g, '<br>').replace(/ /g,'&nbsp'),
											timestamp: firebase.database.ServerValue.TIMESTAMP
										});

										// reset the message input
										mainCtrl.content[index] = "";


						 	} // end of else if


				    } // end of if user logged in
				    else{
				    	alert("You need to log in!");
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
			  // geoplugin.com https://stackoverflow.com/questions/391979/how-to-get-clients-ip-address-using-javascript-only?page=1&tab=votes#tab-top
		    $http.get('https://freegeoip.net/json/?callback=')
		    .then(function(response) {
		        mainCtrl.userIpaddress = response.data["ip"];
		        // console.log(response.data["ip"]);
		    }).catch(function(error){
				console.log("geoplugin is not working", error.message);
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


				// if there are too many faultyCounts then this user will be banned
				if (translation.faultyCount > cutoffFaultyCount) {
					// console.log(translation.userIpaddress.replace(/\./g, ""));
					//ex 123.123.123.123 -> 123123123123 due to the limit in firebase database
					var ip = translation.userIpaddress.replace(/\./g, "");
					if(ip != "stupid ipfinder is not working"){
						mainCtrl.bannedUsers[ip] = true;
					}
					mainCtrl.bannedUsers[translation.userUid] = true;
					// console.log(mainCtrl.bannedUsers);
					mainCtrl.bannedUsers.$save();
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
		mainCtrl.banTranslation = function(translationsRef, translation){
			//console.log(translationsRef);
			//console.log($scope.firebaseUser.uid);   // mine is 0E7culXypcRT3MBc9syiqXdW5RJ2
			if(mainCtrl.firebaseUser){
				if(mainCtrl.firebaseUser.uid == mainCtrl.adminId){
					// update its timestamp as later so it won't show up at the first
					// translation.timestamp = translation.timestamp - 100000000;

					// and put this user in blacklist
					var ip = translation.userIpaddress.replace(/\./g, "");
					if(ip != "stupid ipfinder is not working"){
						mainCtrl.bannedUsers[ip] = true;
					}
					mainCtrl.bannedUsers[translation.userUid] = true;
					console.log("this user is in trouble", translation.userUid);
					// save changes
					mainCtrl.bannedUsers.$save();
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
	// controller.path
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

		// for pagination
		controller.currentPage = [0,0,0,0,0,0,0,0];
		controller.pageSize = 1;

		// for banning users
		service.getBannedUsers().$loaded(function(data) {
				controller.bannedUsers = data;
		})

		controller.title = service.getTitle();
	};

	// initialize controller.theNumberOfEachTranslations and fill the black translations with default values
	// and upload the latest content(translation) in each textareas of each paragraphs
	function loadValuesFromFirebaseArrays(controller, service){
		var theNumberOfEachTranslations = [];
		var localContent = [];
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
				// and also replace &nbsp with space
				latestTranslation = translations[translations.length-1];
				localContent.push(latestTranslation.content.replace(/<br>/g, '\n').replace(/&nbsp/g, ' '));
				controller.content = localContent;
				// console.log(controller.content);

				// set the 'real' number of each translations
				theNumberOfEachTranslations.push(translations.length);
				controller.theNumberOfEachTranslations = theNumberOfEachTranslations;
				// console.log(controller.theNumberOfEachTranslations);
			}).catch(function(error){
				console.log(error.message);
			});
		} // end of for loop


	} // end of loadValuesFromFirebaseArrays function



})();
