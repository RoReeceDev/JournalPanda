
var edits = document.getElementsByClassName("fa-edit");
var views = document.getElementsByClassName("fa-eye");
var trash = document.getElementsByClassName("fa-trash-o");
var tags = document.getElementsByClassName("fa-tag")
var pass = document.querySelector('.hide-pass')


//hide user password

pass.addEventListener('click', function(){
  const password = document.querySelector('.password')

  password.classList.toggle('hidden')
})



//create an array from the edit button and target each individual one

Array.from(tags).forEach(function(element) {
  element.addEventListener('click', function(){

    //target the closest message box to the update icon that is clicked
    const listItem = this.closest('.entry')

    const tagDiv = listItem.querySelector('.tag');
    tagDiv.classList.toggle('tagon')
    tagDiv.classList.toggle('hidden')

  
  });
});

//view journal entry 

Array.from(views).forEach(function(element) {
  element.addEventListener('click', function(){
    const listItem = this.closest('.entry');
    const viewDiv = listItem.querySelector('.view');
    const id = listItem.dataset.id;

    viewDiv.classList.toggle('hidden');

    fetch('/entries/view', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'id': id,
      })
    })
    .then(response => {
      if (response.ok) return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(err =>{
      console.error('Error:', err);
    });
  });
});

//Create an arraay from the star icons 
Array.from(edits).forEach(function(element) {
  element.addEventListener('click', function(){

    //target the closest message box to the update icon that is clicked
    const listItem = this.closest('.entry')
    const title = listItem.querySelector('.name').textContent
    const entry = listItem.querySelector('.msg').textContent
    const id = listItem.dataset.id

    //pull new data from the revealed form for updates
    const newRestaurantValue = listItem.querySelector('[name="updateTitle"]').value;
    const newMessageValue = listItem.querySelector('[name="updateEntry"]').value;

    //reveal input when clicked once, then hide the input box when clicked again
    const editingDiv = listItem.querySelector('.editing');
    editingDiv.classList.toggle('editon')
    editingDiv.classList.toggle('hidden')


    fetch('entries/update', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'id': id,
        'title': title,
        'entry': entry,
        'updateTitle': newRestaurantValue,
        'updateEntry': newMessageValue,

      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
    })
    .catch(err =>{
      console.error('Error:', err)
    })
  });
});

//delete entry

Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function(){
    const listItem = this.closest('.entry')
    const name = listItem.querySelector('.name').textContent
    const id = this.dataset.id

    fetch('entries', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'name': name,
        'id': id,
      })
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});
