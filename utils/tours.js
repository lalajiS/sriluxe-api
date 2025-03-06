const hotels_data = require("../data/hotels.json");




function filterDestinationsBySeason(season) {
    return hotels_data.filter(dest => dest.season === season || dest.season === "Both");
}

function tourDays(start_date , end_date) {
    // Convert DD/MM/YYYY to Date objects
    const [startDay, startMonth, startYear] = start_date.split('/').map(Number);
    const [endDay, endMonth, endYear] = end_date.split('/').map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    // Calculate the difference in milliseconds and convert to days
    const differenceInTime = endDate - startDate;
    const differenceInDays = (differenceInTime / (1000 * 60 * 60 * 24))+1 ;

    return (differenceInDays);
}



const generateItinerary = (starting_date, ending_date, season, luxuryLevel, activityLevel, wildlifeFocus, culturalDepth) => {

    const seasonalDestinations = filterDestinationsBySeason(season);
    const travelDays = tourDays(starting_date, ending_date);

    const sortedDestinations = seasonalDestinations.sort((a, b) => {
        const aScore = (a.wildlifeLevel * wildlifeFocus) + (a.culturalLevel * culturalDepth) + (a.activityLevel * activityLevel) + (a.luxuryLevel * luxuryLevel);
        const bScore = (b.wildlifeLevel * wildlifeFocus) + (b.culturalLevel * culturalDepth) + (b.activityLevel * activityLevel) + (b.luxuryLevel * luxuryLevel);
        return bScore - aScore;
    });

    const itinerary = [];
    itinerary.push({
        day: 1,
        destination: "Colombo (Airport)",
        activity: "Arrival",
        stay: luxuryLevel === 3 ? "Luxury Stay" : "Comfort Stay",
        hotel: "N/A",
        latitude: 6.9271,
        longitude: 79.8612
    });

    for (let i = 1; i < travelDays; i++) {
        const destination = sortedDestinations[(i - 1) % sortedDestinations.length];
        itinerary.push({
            day: i + 1,
            destination: destination.name,
            activity: `Explore ${destination.name}`,
            stay: luxuryLevel === 3 ? "Luxury Stay" : "Comfort Stay",
            hotel: destination.hotel,
            latitude: destination.latitude,
            longitude: destination.longitude
        });
    }


    // Add return to airport
    itinerary.push({
        day: travelDays + 1,
        destination: "Colombo (Airport)",
        activity: "Departure",
        stay: "N/A",
        hotel: "N/A",
        latitude: 6.9271,
        longitude: 79.8612
    });


    return (itinerary);

}




module.exports = {
    tourDays,
    generateItinerary
};