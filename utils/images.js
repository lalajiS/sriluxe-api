const images = require("../data/destination_images.json");



async function get_images_by_location(location, number_of_img = 1) {
     return (await select_randon_img_from_arr(images[location], number_of_img));
}


/*
* return an array of images based on the array and number of images requesting
*/
async function select_randon_img_from_arr(arr, count = 1) {

    if (!Array.isArray(arr) || arr.length === 0 || count < 1) {
        return [];
    }

    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return await shuffled.slice(0, Math.min(count, arr.length));
}




module.exports = {
    get_images_by_location
};