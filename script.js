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
            // make day-chart div
            const dayDiv = document.createElement('div')
            dayDiv.classList.add('day-chart')

            // put date and location in title
            const header = document.createElement('h3')
            header.classList.add('day-title')
            
            let dArr = d.date.split('-').map( x => parseInt(x))
            let dateStr = new Date(dArr[0], dArr[1]-1, dArr[2]).toDateString().slice(0,-5)
            header.textContent = dateStr

            // make dew-point table
            const dewPointTableDiv = document.createElement('div')
            dewPointTableDiv.classList.add('dew-point-table')

            // add nodes to day-chart
            dayDiv.appendChild(header)
            dayDiv.appendChild(dewPointTableDiv)

            // for each our, make div for dewpoint
            d.hour.forEach( hour => {
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
            // add the day divs to the charts div
            document.getElementById('dew-point-charts').appendChild(dayDiv)
        })

    }
    else {
        console.error(`Error ${response.status}`)
        document.getElementById('dew-point-charts').innerHTML = "Error occurred, try again"
    }
    
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


