var events = [];
    
      const dreamsList = document.getElementById('eve');
      const dreamsForm = document.forms[0];
      const dreamInput = dreamsForm.elements;
      
      var eventsArray = [];


    function readURL(input) {
      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
          $('#imgInp').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
      }
    }

    $("#blah").change(function() {
      readURL(this);
    });
      
//       dreamsForm.onsubmit = function(event) {
//       // stop our form submission from refreshing the page
//         event.preventDefault();
//         console.log(dreamInput);
        
//         var myDate = new Date(dreamInput[4].value); // Your timezone!
// var myEpoch = myDate.getTime()/1000.0;
//         console.log(myEpoch, dreamInput[4].value);
        
//         const poams = new XMLHttpRequest();
//         poams.onload = poams;
//         poams.open("POST", "/postEvents");
//         poams.setRequestHeader("Content-type", "multipart/form-data");
        
        
        
//         poams.send(JSON.stringify({name: dreamInput[0].value, description: dreamInput[1].value, location: dreamInput[2].value, event_url: dreamInput[3].value, start_time: myEpoch, end_time: "dreamInput[5]", contact: dreamInput[5].value, cover_image: dreamInput[6].files[0]}));
        
//         // var eventsArray = [];
//         // [].slice.apply(dreamInput).filter(( el ) => el.tagName !== 'BUTTON') // filter out all <button> elements
//         // .forEach(function ( el, index ) {
//         //   console.log(el);
//         //     eventsArray[index] = el.value; // add key / value to formatData object
//         // });
//         // add(eventsArray);
//       };

  

      var add = function(e) {
        //e = e || window.event;
        //var src = e.target || e.srcElement;

        //var idEvent = src.parentElement.getAttribute("data-id");
        //console.log(idEvent);

        var thingy = {
          //id: idEvent
        };
        
        
      };