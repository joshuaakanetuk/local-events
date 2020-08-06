// client-side js
// run by the browser each time your view template referencing it is loaded
var events = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById('events');
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements;

// a helper function to call when our request for dreams is done
const getDreamsListener = function() { 
  // parse our response to convert to JSON
  events = JSON.parse(this.responseText);
  // iterate through every dream and add it to our page
  events.forEach( function(row) {
    console.log(row);
    appendNewDream(row);
  });
}

const postDream = function() {
  // parse our response to convert to JSON
  console.log("POST READY");
}


// request the dreams from our app's sqlite database
const dreamRequest = new XMLHttpRequest();
dreamRequest.onload = getDreamsListener;
dreamRequest.open('get', '/getEvents');
dreamRequest.send();


// a helper function that creates a list item for a given dream
const appendNewDream = function(dream) {
const newListItem = document.createElement('div');
newListItem.classList.add('card');
newListItem.innerHTML = '<a href="' + dream.link + '"><div class="card-body"> <h6 class="card-title">'+ dream.name +'</h6> <h6 class="card-subtitle mb-2 text-muted">'+ dream.date +'</h6> <p class="card-text">'+ dream.info +'</p></div></a>';
  dreamsList.appendChild(newListItem);  
}

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();
  
  // get dream value and add it to the list
  //dreams.push(dreamInput[1].value);
  var eventsArray = [];
  appendNewDream(event);
  [].slice.apply(dreamInput).filter(( el ) => el.tagName !== 'BUTTON') // filter out all <button> elements
  .forEach(function ( el, index ) {
      eventsArray[index] = el.value; // add key / value to formatData object
  });
  //console.log(eventsArray);
  
const postDreams = new XMLHttpRequest();
postDreams.onload = postDream;
postDreams.open('post', '/postEvents');
postDreams.setRequestHeader('Content-type', 'application/json');
  //postDreams.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
postDreams.send(JSON.stringify(eventsArray));

  // reset form 
  // dreamInput.value = '';
  //dreamInput.focus();
}; 


var deleteThing = function() {
  const poams = new XMLHttpRequest();
poams.onload = postDream;
poams.open('post', '/postEvents');
poams.setRequestHeader('Content-type', 'application/json');
  //postDreams.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//postDreams.send(JSON.stringify({eventsArray}));
  
  
  
}