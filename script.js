
// Hi! Welcome to the script.js file! This is an improved to do list,
// if compared to more generic and simple ones, and because of that the
// logic of this site is a bit more complex than usual. The complexity
// is rather horizontal though, there is just more you can do with
// the list rather than it being conceptually complicated.

// I've commented the entire file and added in depth explanation to
// some important functions like drag function for example.

// The guide below explains how the file is structured.

// Anywhere there is a big space gap, it means that you are entering a 
// new group of logic. Big groups are divided in // === === format,
// while regular comments divide or explain smaller pieces of large
// code groups.

// There are 5 main parts of the code -
// 2 of them being more generic
// === Simple miscellaneous logic ===
// === Site load routine, getting values from local storage ===
//
// and other 3 being unique and specific to this site and its task
// === Item addition, removal, completion and edition ===
// === Elements drag logic. Part l: Event listeners ===
// === Elements drag logic. Part ll: Drag logic ===

// You can navigate the file by CTRL F'ing the respective code group comment.


// Enjoy reading!






// === Simple miscellaneous logic ===

// Introductory button
const welcome_button = document.querySelector("#welcome")
const welcome_message = document.querySelector(".welcome-message")

// Turns instruction message on and off onlick
welcome_button.addEventListener("click", () => {
  welcome_message.classList.toggle("welcome-message--display-hidden")
})

document.addEventListener("click", () =>{
  if(!welcome_message.classList.contains("welcome-message--display-hidden") && e.target.id != "welcome"){
    welcome_message.classList.toggle("welcome-message--display-hidden")
  }
})













// === Site load routine, getting values from local storage ===


// Creating the constants of the input form and submit button
const input_form = document.querySelector("input[type = text]")
const add_button = document.querySelector("input[type = submit]")


// Site load routine
window.addEventListener("load", () => {

  // Focusing on the input form on startup
  input_form.focus()


  // Loading all elements stored in local storage
  if (localStorage != null){
    const local_storage_array = JSON.parse(localStorage.getItem("draggable_elements"))
    for (let i = 0; i < local_storage_array.length; i++) {
      const element = local_storage_array[i]
      AddANewTodoItem(element.text_content, false, element.complete_status)
    }
  }
})

// Creating a constant for the to-do container
const to_do_container = document.querySelector(".to-do-container")

// This variable contains all draggable elements and it is being
// updated anytime we add, remove, move or mark elements complete.
// A "copy" of this array also goes to local storage every time it's updated.
let draggable_elements = document.querySelectorAll(".to-do-item")
ActivateAllDraggableElements()












// === Item addition, removal, completion and edition ===



// Item addition method 1 (Mouseclick on "Add")
add_button.addEventListener("click", () => {
  if(input_form.value != ""){
    AddANewTodoItem(input_form.value, true)
  }
})

// Item addition method 2 (Keydown Enter)
input_form.addEventListener("keydown", key => {
  if (key.key == "Enter"){
    key.preventDefault()
    if(input_form.value != ""){
      AddANewTodoItem(input_form.value, true)
    }
  }
})



// Document event listeners for removal, completion, and edition
document.addEventListener("click", (e) => {

  // Removing an item
  if (e.target.classList.contains("to-do-item__close-button")){
    removeTodoItem(e)
  }

  // Marking an item as complete
  if (e.target.classList.contains("fa-circle-check")){
    toggleItemCompletion(e)
  }
})

// Item edition
document.addEventListener("dblclick", editTodoItem)






// Functions for the above event listeners

function AddANewTodoItem(text_content, added_dynamically, complete = false){
  // Creating the parts of the to-do list item
  const to_do_item = document.createElement('div')
  to_do_item.classList.add("to-do-item", "|", "flexbox-container")
  to_do_item.setAttribute("draggable", "true")
  
  const to_do_item__body = document.createElement('div')
  to_do_item__body.classList.add("to-do-item__body", '|', 'flexbox-container')
  
  const to_do_item__close_button = document.createElement('i')
  to_do_item__close_button.classList.add("fa-solid", "fa-xmark", "to-do-item__close-button")
  
  const checkbox_icon = document.createElement('i')
  checkbox_icon.classList.add("fa-regular", "fa-circle-check")
  
  const todo_item__animation_prop = document.createElement('div')
  todo_item__animation_prop.classList.add("todo-item__animation-prop")
  
  const paragraph = document.createElement('p')
  
  paragraph.innerText = text_content

  // if an item was completed and we're retreiving it from local storage
  if(complete && !added_dynamically){
    to_do_item__body.classList.add("todo-item--status-completed")
    todo_item__animation_prop.classList.add("todo-item__animation-prop-status-completed")
  }

  // Appending the elements and constructing the to-do-item instance
  to_do_container.append(to_do_item)
  to_do_item.append(to_do_item__body, to_do_item__close_button)
  to_do_item__body.append(checkbox_icon, todo_item__animation_prop, paragraph)

  // Updating the draggable_elements variable
  draggable_elements = document.querySelectorAll(".to-do-item")
  ActivateAllDraggableElements()

  if (added_dynamically){
    // Updating local storage
    updateLocalStorage()

    // Resetting input form value back to zero
    input_form.value = ""

    to_do_item.classList.add("to-do-item--display-first-appear")
    to_do_item.addEventListener("animationend", (e) =>{
      e.target.classList.remove("to-do-item--display-first-appear")
    })
  }
}




function removeTodoItem(elem){
  // Setting up some constants
  const this_to_do_item = elem.target.parentElement    
  const this_to_do_item_parent = elem.target.parentElement.parentElement
  const this_to_do_item_checkbox = this_to_do_item.children[0].children[0]

  // Hiding the checkbox element before animating for a smoother look
  this_to_do_item_checkbox.classList.add("fa-circle-check--display-hidden")

  // Determining animation style
  window.visualViewport.width >= 540
  ? this_to_do_item.classList.toggle("todo-item--status-deleted-desktop")
  : this_to_do_item.classList.toggle("todo-item--status-deleted-mobile")
  

  // Removing the element as soon as the animation ends
  this_to_do_item.addEventListener("animationend", (e) => {

    // Preventing conflict with other animations on this element type
    if (e.animationName == "todo-item-deletion-desktop" || 
    e.animationName == "todo-item-deletion-mobile"){
      this_to_do_item_parent.removeChild(this_to_do_item)


      // Updating the draggable_elements variable
      draggable_elements = document.querySelectorAll(".to-do-item")
      ActivateAllDraggableElements()

      // Updating local storage
      updateLocalStorage()
    }
  })

}




function toggleItemCompletion(elem){

  const todo_item = elem.target.parentElement
  const todo_item__animation_prop = elem.target.nextElementSibling

  if(todo_item.classList.contains("todo-item--status-completed")){
    // Remove completion, play rewind
    todo_item.classList.remove("todo-item--status-completed")
    todo_item__animation_prop.classList.remove("todo-item__animation-prop-status-completed")

    todo_item.classList.add("todo-item--status-completed-rewind")
    todo_item__animation_prop.classList.add("todo-item__animation-prop-status-completed-rewind")

    todo_item.addEventListener("animationend", (e) => {
      // Removing them here because they're not supposed to stay
      if (e.animationName == "todo-item-completed-item-element-rewind")
        todo_item.classList.remove("todo-item--status-completed-rewind")
        todo_item__animation_prop.classList.remove("todo-item__animation-prop-status-completed-rewind")
    })
  }

  else{
    // Remove rewind, play completion
    todo_item.classList.add("todo-item--status-completed")
    todo_item__animation_prop.classList.add("todo-item__animation-prop-status-completed")
  }

  // Updating local storage
  updateLocalStorage()
}





// Item edition
function editTodoItem(e){

  if(e.target.tagName == "P"){
    const paragraph_element = e.target
    const to_do_item = paragraph_element.parentElement.parentElement
  
    const paragraph_height = paragraph_element.clientHeight
    const paragraph_width = paragraph_element.clientWidth
  
    const to_do_item_width = to_do_item.clientWidth
    const form_width = Math.max(.7 * to_do_item_width, paragraph_width)
  
    const input_form = document.createElement("textarea")
    input_form.className = "todo-item__edit-input-form"
    input_form.setAttribute("spellcheck", "false")
  
    input_form.style.width = form_width.toString() + "px"
    input_form.style.height = paragraph_height.toString() + "px"
  
    to_do_item.appendChild(input_form)
  
    // Autofocus causes issues on mobile devices because
    // they use virtual keyboard. 
    if(window.innerWidth >= 800){
      input_form.focus()
    }
  
  
    // Remove form if clicked outside form
    document.addEventListener("click", (e) => {
      if(e.target != input_form){
        // Preventing error message if the form doesn't exist
        try{
          to_do_item.removeChild(input_form)
        }
        catch{}
      }
    })
  
  
    input_form.addEventListener("keydown", key => {
      if (key.key == "Enter"){
        key.preventDefault()
        if (input_form.value != ""){
          paragraph_element.innerText = input_form.value
          to_do_item.removeChild(input_form)
          updateLocalStorage()
        }
      }
    })
  }
}




// Local storage control

function updateLocalStorage(){
  // Creating a temporary array that we will populate and then save in local storage
  const local_storage_temp = []
  draggable_elements.forEach(e => {
    const element_inner_text = e.childNodes[0].childNodes[2].innerText
    const element_complete_status = e.childNodes[0].classList.contains("todo-item--status-completed");

    local_storage_temp.push({"text_content": element_inner_text, "complete_status": element_complete_status})
  });

  // Saving the array in local storage. Anytime the DOM changes, this array gets overriden
  localStorage.setItem("draggable_elements", JSON.stringify(local_storage_temp))
}




















// === Elements drag logic. Part l: Event listeners ===


// Using named functions here because event listeners 
// stack with anonymous functions, but they don't
// with named ones.

function ActivateAllDraggableElements(){
  draggable_elements.forEach(elem => elem.addEventListener("dragstart", dragstartCallback))
  draggable_elements.forEach(elem => elem.addEventListener("dragend", dragendCallback))

  draggable_elements.forEach(elem => elem.addEventListener("touchstart", touchstartCallback))
  draggable_elements.forEach(elem => elem.addEventListener("touchend", touchendCallback))
  draggable_elements.forEach(elem => elem.addEventListener("touchcancel", touchendCallback))
}


function dragstartCallback(e){
  e.target.classList.toggle("to-do-item--status-is-dragged")
}


function dragendCallback(e){
  e.target.classList.toggle("to-do-item--status-is-dragged")

  // Updating the draggable_elements
  draggable_elements = document.querySelectorAll(".to-do-item")

  // Updating local storage
  updateLocalStorage()
}




// Making this variable default at website launch
let last_tap_time
let long_touch_timer

function touchstartCallback(e){
  // If we're not touching the x or the checkbox
  if(!e.target.classList.contains("to-do-item__close-button") && !e.target.classList.contains("fa-circle-check")){
    const this_to_do_element = e.currentTarget
    
    long_touch_timer = setTimeout( () => {
      this_to_do_element.classList.toggle("to-do-item--status-is-dragged")
    },300)

  }

  const this_tap_time = new Date().getTime()
  const time_since_last_tap = this_tap_time - last_tap_time


  if (time_since_last_tap < 400 && time_since_last_tap > 0){
    if (e.target.nodeName == "P"){
      editTodoItem(e)
    }
  }

  last_tap_time = this_tap_time
}



function touchendCallback(e){
  clearTimeout(long_touch_timer)

  // If we're not touching the x or the checkbox
  if(!e.target.classList.contains("to-do-item__close-button") && !e.target.classList.contains("fa-circle-check")){
    e.currentTarget.classList.remove("to-do-item--status-is-dragged")

    // Updating the draggable_elements
    draggable_elements = document.querySelectorAll(".to-do-item")
  
    // Updating local storage
    updateLocalStorage()
  }
}













// === Elements drag logic. Part ll: Drag logic ===

// Space, inside which elements can be moved
const draggable_elements_container = document.querySelector(".to-do-container")

// Space, over which you can drag the element stopping the event.
// It's intentionally made large for convenience
const dragover_event_container = document.body


dragover_event_container.addEventListener("dragover", (e) => {
  e.preventDefault()
  dragElement(e.clientY)
})


// Very similar to dragover
dragover_event_container.addEventListener("touchmove", (e) => {
  dragElement(e.touches[0].pageY)
})


function dragElement(user_cursor_position){

  const element_currently_dragged = document.querySelector(".to-do-item--status-is-dragged")

  // this selector selects all elements that are supposed to be a part of this dynamic environment
  // (other draggables) except for the element that is being dragged at the moment.
  const rest_of_interactive_elements = [...document.querySelectorAll(".to-do-item:not(.to-do-item--status-is-dragged)")]
  

  const bottom_neighbor_element = determineNearestElementBelow(rest_of_interactive_elements, user_cursor_position)

  if (bottom_neighbor_element != null){
    draggable_elements_container.insertBefore(element_currently_dragged, bottom_neighbor_element)
  }
  else{
    draggable_elements_container.appendChild(element_currently_dragged)
  }
}

function determineNearestElementBelow(rest_of_interactive_elements, user_mouse_y_position){
  // Purpose:
  // The purpose of this function is to identify which element is the nearest neibhoring
  // element to the element we're dragging from BELOW.
  // There are 2 return options: Such an element, or null.
  // If I'm trying to place a draggable above some element, I will get
  // The element I'm immediately above, if I'm moving the thing to the end
  // of the list, then the return will be null because I'm not above any other
  // element, and the dragover event listener will just append the element I'm
  // dragging to the end of the list using appendChlid()

  // Methodology:
  // Using reduce I figure out the nearest element from the list by comparing y
  // values of things and finding the least distance.

  const nearest_block = rest_of_interactive_elements.reduce((p, c) => {

    const element_block_y_position = c.getBoundingClientRect().y
    const element_block_height = c.getBoundingClientRect().height

    // This is the reference point we compare user mouse y position to
    const element_block_center_y_position = element_block_y_position + element_block_height / 2

    // We're hunting for the smallest offset. 
    const offset = element_block_center_y_position - user_mouse_y_position

    if ((offset > 0) && (offset < p.offset)){
      return {element: c, offset: offset}
    }

    else{
      return p
    }

     // This is the default value for p. If no offset is
     // positive, then this will be the return.
  }, {element: null,  offset: Number.POSITIVE_INFINITY})

  return nearest_block.element
}