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
	var app = angular.module("mainApp", ["firebase", "ngSanitize"]);
	

	// a factory to create a re-usable profile object
	// we pass in a username and get back their synchronized data
	app.factory("Paragraphs", ["$firebaseObject",
	  function($firebaseObject) {
	    return function(path) {
	      // create a reference to the database node where we will store our data
	      var ref = firebase.database().ref().child(path);      
	      //ref = firebase.database().ref().child("ExpressEntry").child("home").child("paragraphs");
	      // return it as a synchronized object
	      return $firebaseObject(ref);
	    }
	  }
	]);

	app.factory("Translations", ["$firebaseArray",
	  function($firebaseArray) {
	  	return function(path) {
			// create a reference to the database location where we will store our data
			var ref = firebase.database().ref().child(path);
				
			// create a query for the most recent 25 messages on the server
		    var query = ref.orderByChild("timestamp").limitToLast(25);		    
		    
			// the $firebaseArray service properly handles database queries as well
			// this uses AngularFire to create the synchronized array
			return $firebaseArray(query);
		} 
	  }
	]);

	var mainCtrl = function($scope, Paragraphs, Translations){
		var eeHomeParagraphs = Paragraphs("ExpressEntry/home/paragraphs");
		$scope.mainParagraphs = eeHomeParagraphs;
		$scope.mainParagraphs.$loaded().then(function() {
		 //    console.log($scope.mainParagraphs);
			// console.log(Object.getOwnPropertyNames($scope.mainParagraphs));
		});


		var eeHomeTranslations = Translations("ExpressEntry/home/paragraphs/paragraph1/korean");
		$scope.translations = eeHomeTranslations;
		$scope.user = "Guest " + Math.round(Math.random() * 100);

		$scope.addTranslation = function(){
			// calling $add on a synchronized array is like Array.push(),
	        // except that it saves the changes to our database!
	      	$scope.translations.$add({
	      		from: $scope.user,
	      		content: $scope.translation,
	      		timestamp: firebase.database.ServerValue.TIMESTAMP
	      	});

	      	// reset the message input
	     	$scope.translation = "";
		};
		
		$scope.translations.$loaded(function () {
			if($scope.translated.length === 0){
				$scope.translated.$add({
		      		from: "kevin",
		      		content: "안녕",
		      		timestamp: firebase.database.ServerValue.TIMESTAMP
	      		});
			}
			console.log($scope.translations);
		});

	}
	app.controller("mainCtrl",["$scope", "Paragraphs", "Translations", mainCtrl]);
	
})();