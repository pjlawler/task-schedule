
const containerEl = document.querySelector('.container');
let isEditing = false;
let timeDataInvalid = false;

const displayDays = (totalDays) => {
    const eraseDays = () => {
        while (containerEl.firstChild) {
            containerEl.removeChild(containerEl.firstChild);
        }
    }
    
    fetch('api/events')
        .then(response => response.json())
        .then(data => {
            eraseDays();
            const today = Date.now();
            for(let i = 0; i < totalDays; i++) {
                containerEl.appendChild(createDayEl(addDays(today, i), data));
            }
        });
};
const createDayEl = (day_date, data) => {

    const createNewElement = (type, classes) => {
        const el = document.createElement(type);
        classes.forEach( className => el.classList.add(className));
        return el;
    }
    const createGoogleIcon = (fontName) => {
        const el = document.createElement('i');
        el.classList.add('material-icons');
        el.innerText = fontName;
        return el;
    }

    // Parent day containers
    const day_containerEl = createNewElement('div',['day_container']);
    const event_containerEl = createNewElement('div', ['event_container']);
   
    // Containers for the date section
    const date_labelEl = createNewElement('div', ['date_label']);
    const dayEl = createNewElement('p', ['day']);
    const dateEl = createNewElement('p', ['date']);
    const add_buttonEl = createNewElement('div', ['add_button']);
    const plusIcon = createGoogleIcon('add');

    // Sets the plus attribute so it knows which day to add the event
    plusIcon.setAttribute('day_date', formattedDate(day_date));

    // Populates the day and date with thes info
    dayEl.innerText = formattedDate(day_date, 2);
    dateEl.innerText = formattedDate(day_date, 1);

    // Appends the date section elements 
    add_buttonEl.appendChild(plusIcon); 
    date_labelEl.append(dayEl, dateEl, add_buttonEl);
    day_containerEl.append(date_labelEl, event_containerEl)
    
    // Gets the 
    const days_data = data.filter(item => {
        const date2 = formattedDate(new Date(item.dtg));
        return date2 === formattedDate(day_date);
    });

    // Sorts the data by the time, from earlier to later
    days_data.sort((a ,b) => {
        if (a.dtg < b.dtg) { return -1 }
        return 1;
    }).forEach( item => {
        // Creates an event line for each event for that day
        const eventEl = createNewElement('div', ['event']);
        const timeEl = createNewElement('div', ['time']);
        const edit_buttonEl = createNewElement('div', ['edit_button'])
        const delete_buttonEl = createNewElement('div', ['delete_button']);
        const descriptionEl = createNewElement('div', ['description']);
        const assignedEl = createNewElement('div',['assigned']);
        const pencilIcon = createGoogleIcon('edit');
        const trashIcon = createGoogleIcon('delete');

        // Adds the events ID so it knows which event to peform the action on
        pencilIcon.setAttribute('edit-id', item.UUID);
        trashIcon.setAttribute("delete-id", item.UUID);

        // Sets the data to be displayed in event line
        timeEl.innerHTML = '<p>' + formattedTime(new Date(item.dtg), 1) || '--:--' + '</p>';
        descriptionEl.innerHTML = '<p>' + item.description || '-- Event Description --'  + '</p>';
        assignedEl.innerHTML = '<p>' + (item.assigned || '-- Unassigned --')  + '</p>';
        edit_buttonEl.appendChild(pencilIcon);
        delete_buttonEl.appendChild(trashIcon);       

        eventEl.append(timeEl, descriptionEl, assignedEl, edit_buttonEl, delete_buttonEl);
        event_containerEl.appendChild(eventEl);
    })

    return day_containerEl;

}

// Misc Functions
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
function formattedTime(date, type) {

    let options;

    switch(type) {
        case 1: // 3:45 PM
            options = {hour: '2-digit', minute: 'numeric', hour12: true}
            break;
    }

    return date.toLocaleTimeString('en-US', options);


};
function formattedDate(date, type) {
    
    let options;
   
    switch(type) {
        case 1: // 3/2
            options = {month: 'numeric', day: 'numeric'};
            break;
        case 2: // Tue
            options = {weekday: 'short'}
            break;
        case 3: // 3:45 pm
            options = {}
    }
    return date.toLocaleDateString('en-US', options);
};
function addNewEvent(eventDate) {
    const newEvent = {
        dtg: `${eventDate}`
    };

    fetch('/api/events?action=add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Successful POST request:', data);
          displayDays(28);
          return data;
        })
        .catch((error) => {
          console.error('Error in POST request:', error);
        });
};
function deleteEvent(id) {
    const deleteEvent = {
        UUID: `${id}`
    };
    fetch('/api/events?action=delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UUID:`${id}`}),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log('Successful POST request:', data);
      displayDays(28);
      return data;
    })
    .catch((error) => {
      console.error('Error in POST request:', error);
    });
}
function updateEvent(event) {

    fetch(`/api/events?action=update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
      .then((res) => res.json())
      .then((data) => {
        console.log('Successful POST request:', data);
        displayDays(28);
        return data;
      })
      .catch((error) => {
        console.error('Error in POST request:', error);
      });
}
function validateTime(time) {
    if(typeof time === 'Number') {
        if (time >= 0 && time <= 2400) {
            // convert to 
        }
    }


}

// Event listen for clicking on an icon
$('.container').on('click', 'i', function() {
    const iconTapped = $(this).text().trim();
    switch(iconTapped){
        case 'add':
            const eventDate = $(this).attr('day_date')
            addNewEvent(eventDate);
            break;
        case 'delete':
            const id = $(this).attr('delete-id');
            deleteEvent(id);
            break;
    }
});
// User clicked on an editable text area
$('.container').on('click','p', function(){
    if (timeDataInvalid) { 
        timeDataInvalid = false 
        return;
    }
    // Gets the current text in the element
    let text = $(this).text().trim();
    let container_class = $(this).closest('div').attr('class');

    // Gets the UUID of the current element
    const id = $(this).closest('.event').find('.delete_button').find('i').attr('delete-id');
    
    // replaces p element with, and transfers text to, a text input field

    let textInput = $("<textarea>").addClass("form-control").val(text); 
    
    $(this).replaceWith(textInput).css({width: '90%'});
    isEditing = true;

    // auto focus text input field
    // textInput.trigger("focus");

    textInput.blur(e => {

        // replaces textArea with the p element and inserts the new updated data
        const container = textInput.closest('div').attr('class');
        text = textInput.val();
        $(this).replaceWith = $('p').addClass(container).val(text);
        // isEditing = false;

         // Gets the current event 
        const event = fetch(`/api/events/${id}`) 
        .then((res) => res.json())
        .then((data) => {
            console.log('Successful get request:', data);
            switch(container) {
                case 'time':
                    data.dtg = data.dtg.split(" ")[0] + " " + text;
                    break;
                case 'description':
                    data.description = text;
                    break;
                case 'assigned':
                    data.assigned = text;
                    break;
            }
            updateEvent(data);
            return data;
        })
        .catch((error) => {
            console.error('Error in request:', error);
        });
    });
});


displayDays(28);

// setInterval(() => {
//     displayDays(28);
// }, 1000)