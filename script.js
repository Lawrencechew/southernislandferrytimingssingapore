let apiData = [{"company":"Singapore Island Cruise and Ferry Services","routes":
[{"destination":"St John's Island","start":"Marina South Pier","weekday_times":["09:00","10:00","11:00","14:00"],"weekend_holiday_times":["09:00","11:00","13:00","15:00","17:00"]},{"destination":"Kusu Island","start":"St John's Island","weekday_times":["10:45","14:45"],"weekend_holiday_times":["09:50","11:50","13:50","15:50","17:50"]},
{"destination":"Marina South Pier","start":"St John's Island","weekday_times":["15:00","17:00"],"weekend_holiday_times":[]},{"destination":"Marina South Pier","start":"Kusu Island","weekday_times":["12:30","16:00"],"weekend_holiday_times":["10:15","12:15","14:15","16:15","18:15"]}]},
{"company":"Marina South Ferries","routes":[{"destination":"St John's Island","start":"Marina South Pier","weekday_times":["09:00","11:00","13:00"],"weekend_holiday_times":["09:00","11:00","13:00"]},
{"destination":"Kusu Island","start":"St John's Island","weekday_times":["09:30","11:30","15:30"],"weekend_holiday_times":["09:30","11:30","15:30"]},{"destination":"Marina South Pier","start":"Kusu Island","weekday_times":["10:00","12:00","14:00"],"weekend_holiday_times":["10:00","12:00","14:00"]},
{"destination":"Kusu Island","start":"Marina South Pier","weekday_times":["15:00","17:00"],"weekend_holiday_times":["15:00","17:00"]},{"destination":"St John's Island","start":"Kusu Island","weekday_times":["15:30","17:30"],"weekend_holiday_times":["15:30","17:30"]},
{"destination":"Marina South Pier","start":"St John's Island","weekday_times":["16:00","18:00"],"weekend_holiday_times":["16:00","18:00"]}]}];


displayData(apiData);

async function displayData(data) {
    // Get the container element
    const container = document.getElementById('dataContainer');

    // Iterate over each API data object
    data.forEach((item) => {
        // Create a heading element for the company
        const companyHeading = document.createElement('h2');
        companyHeading.textContent = item.company;

        // Create a div element to hold the route details
        const companyRow = document.createElement('div');
        companyRow.className = 'companyRow'; // Add the companyRow class

        // Iterate over each route in the data
        item.routes.forEach(async (route) => {
            // Create a div element for each route
            const destinationBox = document.createElement('div');
            destinationBox.className = 'destinationBox'; // Add the destinationBox class
            
            // Create a paragraph element for each route
            const destinationParagraph = document.createElement('p');
            destinationParagraph.innerHTML = `<b>Departing From:</b> ${route.start}<br><b>Destination:</b> ${route.destination}`;
            
            // Get the current day and time
            const now = new Date();
            let currentDay = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
            let currentTime = now.getHours() * 100 + now.getMinutes(); // Format: HHMM

            // Check if it's a weekday or weekend
            let ferryTimes = [];
            if (currentDay === 0 || currentDay === 6) {
                // Weekend or Public Holiday
                ferryTimes = route.weekend_holiday_times;
            } else if (await isPublicHoliday(now)) {
                // Public Holiday on a weekday
                ferryTimes = route.weekend_holiday_times;
            } else {
                // Weekday
                ferryTimes = route.weekday_times;
            }

            // Find the next available timing
            let nextTiming = getNextDeparture(ferryTimes, currentTime, currentDay);

            // Add the next timing information to the destination paragraph
            destinationParagraph.innerHTML += `<br>${nextTiming}`;

            // Append the destination paragraph to the destination box
            destinationBox.appendChild(destinationParagraph);
            
            // Append the destination box to the route container
            companyRow.appendChild(destinationBox);
        });

        // Append the company heading and route container to the main container
        container.appendChild(companyHeading);
        container.appendChild(companyRow);
    });
}

function getNextDeparture(ferryTimes, currentTime, currentDay) {
    // Find the next available timing
    let nextTiming = '';
    ferryTimes.forEach((timing) => {
        const time = parseInt(timing.replace(':', ''), 10); // Convert time to HHMM format

        if (time >= currentTime && (!nextTiming || time < parseInt(nextTiming.replace(':', ''), 10))) {
            nextTiming = timing;
        }
    });

    // Check if there is a departure timing available for the current day
    if (!nextTiming) {
        // If no timing for current day, display the first timing for the next day
        if (currentDay === 5 || currentDay === 6) { // if current day is Saturday or Sunday
            nextTiming = ferryTimes[0]; // assuming ferryTimes for Monday (weekday) is already fetched
        } else {
            nextTiming = ferryTimes[0]; // assuming ferryTimes for next day is already fetched
        }
        nextTiming = '<b>Next Departure:</b> Tomorrow at ' + nextTiming;
    } else {
        nextTiming = '<b>Next Departure:</b> ' + nextTiming;
    }

    return nextTiming;
}

// Helper function to check if a given date is a public holiday in Singapore
async function isPublicHoliday(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Make a request to the Nager Date API to get the public holidays for Singapore
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/SG`);
    const holidays = await response.json();

    // Iterate over the holidays and check if the given date matches any of the holidays
    for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date);
        if (holidayDate.getMonth() + 1 === month && holidayDate.getDate() === day) {
            return true; // It is a public holiday
        }
    }

    return false; // It is not a public holiday
}

function handleButtonClick() {
    window.location.href = 'https://tickets.islandcruise.com.sg/';
}

function handleButton2Click() {
    window.location.href = 'https://marinasouthferries.com/pages/book-your-trip';
}