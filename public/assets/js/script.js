
const containerEl = document.querySelector('.container');

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
        timeEl.innerText = formattedTime(new Date(item.dtg), 1);
        descriptionEl.innerText = item.description || '';
        assignedEl.innerText = item.assigned || '';
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

// Gets the name of the icon
$(".container").on("click", "i", function() {
    const iconTapped = $(this).text().trim();
    switch(iconTapped){
        case 'add':
            const addEvent = $(this).attr('day_date');
            const eventTime = '13:00';
            const description = 'Testing the system';
            
            const newEvent = {
                dtg: `${addEvent} ${eventTime}`,
                description: `${description}`,
            }
    
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
                break;
        case 'delete':
            const deleteEvent = $(this).attr('delete-id');

            fetch('/api/events?action=delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ UUID:`${deleteEvent}`}),
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

            break;
        case 'edit':
            const editEvent = $(this).attr('edit-id');
            break;
    }
});

displayDays(28);

setInterval(() => {
    displayDays(28);
}, 1000)