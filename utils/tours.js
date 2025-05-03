const hotels_data = require("../data/hotels.json");
const predefined_tours = require("../data/predefined_tours.json");



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



const generateItinerary = async (starting_date, ending_date, season, luxuryLevel, activityLevel, wildlifeFocus, culturalDepth) => {

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
            city: destination.location,
            activity: `Explore ${destination.name}`,
            stay: luxuryLevel === 3 ? "Luxury Stay" : "Comfort Stay",
            hotel: destination.hotel,
            latitude: destination.latitude,
            longitude: destination.longitude,
            images: [
                "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/55/dd/5f.jpg",
                "https://nexttravelsrilanka.com/wp-content/uploads/2023/02/Yala.jpg",
                "https://www.ugaescapes.com/wp-content/uploads/2022/01/Yala-Body-3.jpg",
                "https://www.lovesrilanka.org/wp-content/uploads/2019/09/yala-LSL_Cropped_800x1000.jpg"
              ]
        });
    }


    // Add return to airport
    itinerary.push({
        day: travelDays + 1,
        destination: "Colombo (Airport)",
        city: "Colombo",
        activity: "Departure",
        stay: "N/A",
        hotel: "N/A",
        latitude: 6.9271,
        longitude: 79.8612,
        images: [
            "https://www.shutterstock.com/image-illustration/aircraft-landing-colombo-sri-lanka-600nw-2186608333.jpg",
            "https://www.newswire.lk/wp-content/uploads/2024/01/NYE-1.jpg",
            "https://cdn.getyourguide.com/img/tour/5ceb810edcb2c.jpeg/146.jpg",
            "https://feast-it-web-prod.imgix.net/d7423cb2-832c-4e14-b439-1926a313f697/WNqy0nMn04/Feast_It_colombo-street-E-TKKcoDZs.jpg?auto=format&fit=max&w=1080&q=20"
        ]
    });


    return (itinerary);

}




// Filter related tours based on the number of days
// filters the tours closest to number of days we input
async function getRelatedToursByDays(num_of_days) {
  
    // Sort the array based on the absolute difference from the num_of_days
    const sorted = [...predefined_tours].sort((a, b) => {
      return Math.abs(a.num_of_days - num_of_days) - Math.abs(b.num_of_days - num_of_days);
    });
  
    // Return the first 5 (or fewer if not enough) closest items
    const result = await sorted.slice(0, Math.min(5, sorted.length));
  
    return result;
  }


module.exports = {
    tourDays,
    generateItinerary,
    getRelatedToursByDays
};