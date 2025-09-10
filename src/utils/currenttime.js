async function getCurrentFromApi() {
    return fetch("http://worldtimeapi.org/api/timezone/America/Argentina/Salta").then(data => data.json()
    ).then(data => data.utc_datetime)
}

const time = await getCurrentFromApi()
console.log(new Date(), new Date(time).toISOString(), "time")