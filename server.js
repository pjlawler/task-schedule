const express = require('express');
const { events } = require('./data/events');
const app = express();
const PORT = 3001


app.get('/api/events', (req, res) => {
    let results = events;
    if(req.query) { results = filterByQuery(req.query, results)};
    res.json(results);
});

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