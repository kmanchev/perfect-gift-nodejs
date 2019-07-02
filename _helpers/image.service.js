const config = require('config.json');
const db = require('_helpers/db');

module.exports = {
    saveImageToDb,
    getImagesFromDb
};

async function saveImageToDb(image) {
    return await db.collection('images').insertOne(image, (err, result) => {
        console.log(result)

        if (err) return console.log(err)

        console.log('saved to database')

    })
}

async function getImagesFromDb(userId) {
    return await db.collection('images').find().toArray((err, result) => {

        const imgArray = result.map(element => element._id);
        console.log(imgArray);

        if (err) return console.log(err)

    })
}



