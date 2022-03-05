const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { events } = require('./data/events');

const fs = require('fs');
const path = require('path');


const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001

app.post('/api/events', (req, res) => {
    console.log(req.query, req.body);
    switch(req.query.action) {
        case 'add':
            createNewEvent(req.body);
            break;
        case 'delete':
            deleteEvent(req.body);
            break;
    };

    res.json(req.body);
});

app.get('/api/events', (req, res) => {
    let results = events;
    if(req.query) { results = filterByQuery(req.query, results)};
    res.json(results);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
function createNewEvent(body) {
    
    let results = events;
    
    const event = body;
    event.UUID = uuidv4();
    
    results.push(event);
    
    fs.writeFileSync(
        path.join(__dirname, './data/events.json'),
        JSON.stringify({ events: results }, null, 2)
    );
}
function deleteEvent(body) {
    
    let results = events;
    
    const event = body;
 
    results = results.filter(item => {
        return item.UUID !== body.UUID;
    });

    fs.writeFileSync(
        path.join(__dirname, './data/events.json'),
        JSON.stringify({ events: results }, null, 2)
    );
}
function filterByQuery(query, eventsArray) {
    let filteredResults = eventsArray;
    if(query.date) {
        date = formattedDate(new Date(query.date));
        filteredResults = filteredResults.filter(event => formattedDate(new Date(event.dtg.split(" ")[0])) === date);
    }
    if(query.name) {
        filteredResults = filteredResults.filter(event => event.assigned === query.name);
    }
    return filteredResults;
}
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
}

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`)
})

