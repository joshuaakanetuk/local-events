// var personSchema = new Schema({
//     name: { type: String, default: 'anonymous' },
//     age: { type: Number, min: 18, index: true },
//     bio: { type: String, match: /[a-zA-Z ]/ },
//     date: { type: Date, default: Date.now },
// });

// var personModel = mongoose.model('Person', personSchema);
// var comment1 = new personModel({
//     name: 'Witkor',
//     age: '29',
//     bio: 'Description',
// });

// comment1.save(function (err, comment) {
//     if (err) console.log(err);
//     else console.log('fallowing comment was saved:', comment);
// });


module.exports = {
  //id: "",
  name: "",
  //status:"",
  description: "",
  location: "",
  event_url: "",
  start_time: "",
  end_time: "",
  contact: "",
  cover_image: "", //1200x628
}

