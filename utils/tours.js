const hotels_data = require("../data/hotels.json");
const predefined_tours = require("../data/predefined_tours.json");
const { 
    get_images_by_location } = require('../utils/images');

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
        longitude: 79.8612,
        images: await get_images_by_location('Colombo', 4)
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
            images: await get_images_by_location(destination.location, 4)
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
        images: await get_images_by_location('Colombo', 4)
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




async function add_destination_img_to_itinerary(itenerary) {
      const result = [];

      for (const item of itenerary) {
        const images = await get_images_by_location(item.destination, 4);
        result.push({
          ...item,
          images
        });
      }

      return await result;
}

async function x () {
    return ('asfsadfadsf')
}

module.exports = {
    tourDays,
    generateItinerary,
    getRelatedToursByDays,
    add_destination_img_to_itinerary
};