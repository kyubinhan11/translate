// part 1
(function(){

	//Initialize firebase


	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyBwYxJUg8Y9rzhsBu0PHkjqf9V6u3pL7aU",
	    authDomain: "friendlychat-d4d79.firebaseapp.com",
	    databaseURL: "https://friendlychat-d4d79.firebaseio.com",
	    storageBucket: "friendlychat-d4d79.appspot.com",
	    messagingSenderId: "432825155150"
	};
	firebase.initializeApp(config);

	// Get elements
	const preObject = document.getElementById('object');

	// create references
	const dbRefObject = firebase.database().ref().child('object');  // object: "hello"

	// Sync object changes
	//dbRefObject.on('value', snap => console.log(snap.val()));  // will print out "hello"
	dbRefObject.on('value', snap => {
		preObject.innerText = JSON.stringify(snap.val(), null, 3); // spacing of 3 
	});

}());

// part 2   https://www.youtube.com/watch?v=dBscwaqNPuk&index=3&list=PLl-K7zZEsYLmnJ_FpMOZgyg6XcIGBu2OX
(function(){
	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyBwYxJUg8Y9rzhsBu0PHkjqf9V6u3pL7aU",
	    authDomain: "friendlychat-d4d79.firebaseapp.com",
	    databaseURL: "https://friendlychat-d4d79.firebaseio.com",
	    storageBucket: "friendlychat-d4d79.appspot.com",
	    messagingSenderId: "432825155150"
	};
	firebase.initializeApp(config);

	// Get elements
	const preObject = document.getElementById('object');
	const ulList = document.getElementById('list');

	// create references
	const dbRefObject = firebase.database().ref().child('object');  // object: "hello"
	const dbRefList = dbRefObject.child('hobbies');		// hobbies is a child of object
	
	// Sync object changes
	//dbRefObject.on('value', snap => console.log(snap.val()));  // will print out "hello"
	dbRefObject.on('value', snap => {
		preObject.innerText = JSON.stringify(snap.val(), null, 3); // spacing of 3 
	});

	// Sync list changes
	dbRefList.on('child_added', snap => {
		const li = document.createElement('li');
		li.innerText = snap.val();
		li.id = snap.key; // key name for each item
		ulList.appendChild(li);
	});

	dbRefList.on('child_changed', snap=> {
		const liChanged = document.getElementById(snap.key);
		liChanged.innerText = snap.val();
	});

	dbRefList.on('child_removed', snap => {
		const liRemove = document.getElementById(snap.key);
		liRemove.remove();
	});

	firebase.auth().onAutoStateChanged(user => {
		if(user){
			console.log(user);
		}else{
			console.log('not logged in');
		}

	});
}());

