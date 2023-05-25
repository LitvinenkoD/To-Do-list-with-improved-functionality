
// Creating the constants of the input form and submit button

const input_form = document.querySelector("input[type = text]")
const add_button = document.querySelector("input[type = submit]")

const welcome_button = document.querySelector("#welcome")
const welcome_message = document.querySelector(".welcome-message")

// document.documentElement.addEventListener("click", (e) => {
//   if(!welcome_message.classList.contains("welcome-message--display-hidden") && e.target.id != "welcome"){
//     welcome_message.classList.toggle("welcome-message--display-hidden")
//   }
// })

welcome_button.addEventListener("click", (e) => {
  welcome_message.classList.toggle("welcome-message--display-hidden")
})

// Making the input form be in focus on startup
window.addEventListener("load", () => {
  input_form.focus()

  if (localStorage != null){
      // Loading all elements stored in local storage
    const local_storage_array = JSON.parse(localStorage.getItem("draggable_elements"))
    console.log(local_storage_array)
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
// 
// Values stored in this array also get constantly uploaded to local
// storage to enable save functionality
let draggable_elements = document.querySelectorAll(".to-do-item")
ActivateAllDraggableElements(draggable_elements)



// Adding a To-Do item in 2 ways:

// By clicking the Add Button
add_button.addEventListener("click", () => {
  if(input_form.value != ""){
    AddANewTodoItem(input_form.value, true)
  }
})

// Or by pressing enter while typing
input_form.addEventListener("keydown", key => {
  if (key.key == "Enter"){
    key.preventDefault()
    if(input_form.value != ""){
      AddANewTodoItem(input_form.value, true)
    }
  }
})


// Some document event listeners

document.addEventListener("click", (elem) => {

  // Removing an item
  if (elem.target.classList.contains("to-do-item__close-button")){
    removeTodoItem(elem)
  }

  // Marking an item as complete
  if (elem.target.classList.contains("fa-circle-check")){
    toggleTodoItemCompletionStatus(elem)
  }

  // Conviniently closing the welcome message
  if(!welcome_message.classList.contains("welcome-message--display-hidden") && elem.target.id != "welcome"){
    welcome_message.classList.toggle("welcome-message--display-hidden")
  }
})



// Creates a new ToDo item and appends it to the container
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
  ActivateAllDraggableElements(draggable_elements)

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
      ActivateAllDraggableElements(draggable_elements)

      // Updating local storage
      updateLocalStorage()
    }
  })

}



// Elements drag functionality

const draggable_elements_container = document.querySelector(".to-do-container")
// the element I want dragover event to fire over. (More than the actual)
// Interactive area. It's made on purpose to allow user to drag more freely.
// It doesn't change behavior for this particular website, but might play a role
// In another environment. You can always minimize this area to just the container
// area and make the functionality more self-continaed.
// For my use case it's completely ok to make the area large and I will
// do that.
const dragover_event_container = document.body


dragover_event_container.addEventListener("dragover", (e) => {
  e.preventDefault()
  const element_currently_dragged = document.querySelector(".to-do-item--status-is-dragged")
  const user_mouse_y_position = e.clientY;
  // this selector selects all elements that are supposed to be a part of this dynamic environment
  // (other draggables) except for the element that is being dragged at the moment.
  const rest_of_interactive_elements = [...document.querySelectorAll(".to-do-item:not(.to-do-item--status-is-dragged)")]
  

  const bottom_neighbor_element = determineNearestElementBelow(rest_of_interactive_elements, user_mouse_y_position)

  if (bottom_neighbor_element != null){
    draggable_elements_container.insertBefore(element_currently_dragged, bottom_neighbor_element)
  }
  else{
    draggable_elements_container.appendChild(element_currently_dragged)
  }
})

dragover_event_container.addEventListener("touchmove", (e) => {


  // // Prevents scroll when dragging elements.
  // // Might turn this if statement into a general statement for this whole callback function
  // draggable_elements.forEach(elem => {
  //   if(elem.classList.contains("to-do-item--status-is-dragged")){
  //     console.log("true");
  //     // e.preventDefault()
  //   }
  // })

  const element_currently_dragged = document.querySelector(".to-do-item--status-is-dragged")
  const user_mouse_y_position = e.touches[0].pageY
  // this selector selects all elements that are supposed to be a part of this dynamic environment
  // (other draggables) except for the element that is being dragged at the moment.
  const rest_of_interactive_elements = [...document.querySelectorAll(".to-do-item:not(.to-do-item--status-is-dragged)")]
  

  const bottom_neighbor_element = determineNearestElementBelow(rest_of_interactive_elements, user_mouse_y_position)

  if (bottom_neighbor_element != null){
    draggable_elements_container.insertBefore(element_currently_dragged, bottom_neighbor_element)
  }
  else{
    draggable_elements_container.appendChild(element_currently_dragged)
  }
})

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


// Using named functions here because event listeners 
// stack with anonymous functions, but they don't
// with named ones.

function ActivateAllDraggableElements(draggable_elements){
  draggable_elements.forEach(elem => elem.addEventListener("dragstart", dragstartCallback))
  draggable_elements.forEach(elem => elem.addEventListener("dragend", dragendCallback))

  draggable_elements.forEach(elem => elem.addEventListener("touchstart", touchstartCallback))
  draggable_elements.forEach(elem => elem.addEventListener("touchend", touchendCallback))
  draggable_elements.forEach(elem => elem.addEventListener("touchcancel", touchendCallback))

  draggable_elements.forEach(elem => {
    // Adding a double click event on all paragraph elements
    const item_p_element = elem.childNodes[0].childNodes[2]
    item_p_element.addEventListener("dblclick", editTodoItem)
  })
}

function dragstartCallback(e){
  setTimeout(() => {
    console.log("drag start");
    e.target.classList.toggle("to-do-item--status-is-dragged")
  }, 50);
}

function dragendCallback(e){
  console.log("drag end");
  e.target.classList.toggle("to-do-item--status-is-dragged")

  // Updating the draggable_elements
  draggable_elements = document.querySelectorAll(".to-do-item")

  // Updating local storage
  updateLocalStorage()
}

function touchstartCallback(e){
  console.log(e.target);
  console.log("touch start");

  // If we're not touching the x or the checkbox
  if(!e.target.classList.contains("to-do-item__close-button") && !e.target.classList.contains("fa-circle-check")){
    e.currentTarget.classList.toggle("to-do-item--status-is-dragged")
  }
}

function touchendCallback(e){
  console.log("touch end");



  // If we're not touching the x or the checkbox
  if(!e.target.classList.contains("to-do-item__close-button") && !e.target.classList.contains("fa-circle-check")){
    e.currentTarget.classList.toggle("to-do-item--status-is-dragged")

    // Updating the draggable_elements
    draggable_elements = document.querySelectorAll(".to-do-item")
  
    // Updating local storage
    updateLocalStorage()
  }
}


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

    console.log(JSON.parse(localStorage.getItem("draggable_elements")))

}

function toggleTodoItemCompletionStatus(elem){

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

// This function allows to edit an item on doubleclick
function editTodoItem(e){

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

  input_form.focus()

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