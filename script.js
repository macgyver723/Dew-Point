const openWeatherApiKey = "023cc40e4b3c41e0aa6121705211006"

let dataDupe

const getWeather = async (zipCode) => {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${openWeatherApiKey}&q=${zipCode}&days=7`

    const response = await fetch(apiUrl)
    
    if (response.ok) {
        const data = await response.json()
        dataDupe = data

        const { forecast: { forecastday: day }, location } = data

        // set location text in header
        document.getElementById("location").textContent = `${location.name}, ${location.region}`
        
        // iterate through each day in response
        day.forEach( d => {
            // make div to hold the entire day
            const dayDiv = document.createElement('div')
            dayDiv.classList.add('day-chart')

            const headerDiv = getDayHeaderDiv(d)
            const dewPointTableDiv = getDewPointTableDiv(d)

            // add nodes to day-chart
            dayDiv.appendChild(headerDiv)
            dayDiv.appendChild(dewPointTableDiv)
            
            // add the day divs to the charts div
            document.getElementById('dew-point-charts').appendChild(dayDiv)
        })

    }
    else {
        console.error(`Error ${response.status}`)
        document.getElementById('dew-point-charts').innerHTML = "Error occurred, try again"
    }
    
}

// HTML-MAKING FUNCTIONS
const getDayHeaderDiv = (dayObj) => {
    const headerDiv = document.createElement('div')
    headerDiv.classList.add('day-header')

    // put date in title
    const header = document.createElement('h3')
    header.classList.add('day-title')

    let dArr = dayObj.date.split('-').map( x => parseInt(x))
    let dateStr = new Date(dArr[0], dArr[1]-1, dArr[2]).toDateString().slice(0,-5)
    header.textContent = dateStr

    // add high/low temp p element 
    const highLow = document.createElement('p')
    highLow.classList.add('max-min-temp')
    highLow.textContent = `${Math.round(dayObj.day.maxtemp_f)}\u00B0 / ${Math.round(dayObj.day.mintemp_f)}\u00B0`

    headerDiv.appendChild(header)
    headerDiv.appendChild(highLow)
 
    return headerDiv
}

const getDewPointTableDiv = (dayObj) => {
    // make dew-point table
    const dewPointTableDiv = document.createElement('div')
    dewPointTableDiv.classList.add('dew-point-table')

    // for each our, make div for dewpoint
    dayObj.hour.forEach( hour => {
        const hourDiv = document.createElement('div')
        const timeP = document.createElement('p')
        const dewPointP = document.createElement('p')

        // format time in 12hr am/pm
        let time = hour.time.split(' ')[1].split(':')[0]
        time = parseInt(time) < 12
                ? parseInt(time) == 0
                    ? "12am"
                    : parseInt(time) + "am"
                : parseInt(time) == 12
                    ? "12pm"
                    : (parseInt(time) - 12) + "pm"
        
        const dewPoint = parseInt(hour.dewpoint_f)

        timeP.textContent = time
        timeP.classList.add('time')

        // mark current hour with styling
        if (
            new Date().getHours() === new Date(hour.time).getHours() &&
            new Date().getDate() === new Date(hour.time).getDate()
            ) {
            hourDiv.classList.add('current-hour')
        }

        dewPointP.textContent = dewPoint
        dewPointP.classList.add('dew-point')
        // dry, comfortable, alright, unformfortable, miserable, danger
        hourDiv.classList.add(
            dewPoint < 50
                ? 'dry'
                : dewPoint < 55
                    ? 'comfortable'
                    : dewPoint < 60
                        ? 'alright'
                        : dewPoint < 65
                            ? 'uncomfortable'
                            : dewPoint < 70
                                ? 'miserable'
                                : 'danger'
        )

        // if chance of rain > 40%, add blue border
        if (parseInt(hour.chance_of_rain) > 40)
            hourDiv.classList.add('rain')

        // add time and dewpoint to this div
        hourDiv.appendChild(timeP)
        hourDiv.appendChild(dewPointP)

        // add this div to the day's div
        dewPointTableDiv.appendChild(hourDiv)

    })

    return dewPointTableDiv;
}
// CHANGE LOCATION BUTTON
document.getElementById('btn-change-location').addEventListener('click', () => {
    toggleEnterLocationButtons()
    document.getElementById('input-zipcode').focus()
})

// ENTER TO CLICK GO
document.getElementById('input-zipcode').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('btn-get-dewpoint').click()
    }
})

// GO BUTTON
document.getElementById('btn-get-dewpoint').addEventListener('click', () => {
    const inputZip = document.getElementById('input-zipcode')
    
    const newZipCode = inputZip.value
    localStorage.setItem('zipcode', newZipCode)

    // clear input and old location
    inputZip.value = ""
    document.getElementById('location').textContent = ""

    clearDewPointTable()
    getWeather(newZipCode)
    toggleEnterLocationButtons()
})

const toggleEnterLocationButtons = () => {
    // toggle input field and go button
    document.getElementById('input-zipcode').classList.toggle('hidden')
    document.getElementById('btn-get-dewpoint').classList.toggle('hidden')

    // toggle location and change button
    document.getElementById('location').classList.toggle('hidden')
    document.getElementById('btn-change-location').classList.toggle('hidden')
}

const clearDewPointTable = () => {
    document.getElementById('dew-point-charts').innerHTML = ""
}

// load local storage data
let currentZipcode = localStorage.getItem('zipcode')

if (currentZipcode === null) {
    toggleEnterLocationButtons()
}
else {
    getWeather(currentZipcode)
}


