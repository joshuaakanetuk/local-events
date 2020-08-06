var events = [];
const dreamsList = document.getElementById("dreams");

const appendNewDream = function(dream) {
  // console.log(dream.description)
  // const newListItem = document.createElement("div");
  // console.log(dream);
  // newListItem.classList.add("card");
  // newListItem.innerHTML =
  //   '<div data-id="' +
  //   dream.id +
  //   '"class="card-body"> <span class="card-title">Name: ' +
  //   dream.name +
  //   '</span> <br> <span class="card-subtitle mb-2 text-muted"> <i data-feather="clock"></i>Start Time: ' +
  //   dream.start_time +
  //   '</span> <p class="card-text">' +
  //   dream.description +
  //   '</p><div onclick="deleteThing()" class="btn btn-primary">DELETE</div></div>';
  // dreamsList.appendChild(newListItem);
};

const getDreamsListener = function() {
  // parse our response to convert to JSON
  events = JSON.parse(this.responseText);
  // // iterate through every dream and add it to our page
  events.forEach(function(row) {
    console.log(row);
    appendNewDream(row);
  });
};

const dreamRequest = new XMLHttpRequest();
dreamRequest.onload = getDreamsListener;
dreamRequest.open("get", "/getEvents");
dreamRequest.send();

var deleteThing = function(e) {
  e = e || window.event;
  var src = e.target.parentElement.parentElement || e.srcElement;
  

  var idEvent = src.getAttribute("id");
  console.log(idEvent);

  var thingy = {
    id: idEvent
  };

  const poams = new XMLHttpRequest();
  
  poams.open("POST", "/deleteEvents");
  poams.setRequestHeader("Content-type", "application/json");
  //poams.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  poams.send(JSON.stringify(thingy));
  poams.onload = function() {
    window.location.reload();
    
  };
  
};


var statusThing = function(e) {
  e = e || window.event;
  var src = e.target.parentElement.parentElement || e.srcElement;
  
  
  var div = e.target.parentElement;

  var idEvent = src.getAttribute("id");
  console.log(idEvent);

  var thingy = {
    id: idEvent,
    name: div.children[0].innerHTML,
    description: div.children[3].innerHTML,
    start_time: [div.children[1].children[0].value,div.children[1].children[1].value],
    end_time: [div.children[2].children[0].value,div.children[2].children[1].value]
  };
  
  console.log(thingy)

  const poams = new XMLHttpRequest();
  
  poams.open("POST", "/updateEvent");
  poams.setRequestHeader("Content-type", "application/json");
  poams.send(JSON.stringify(thingy));
  poams.onload = function() {
    //window.location.reload();
    console.log('up');
    
  };
  
};