const mongoose = require('mongoose');
const cities = require('./cities');
const https = require('https');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

function getJSON() {
    return new Promise ((resolve, reject) => {
        https.get('https://api.unsplash.com/photos/random?collections=483251&client_id=eIH3Iv-cnwJhYGu0FfcfwXMSZjvO3VioTPEZcOrPUjc', (res) => {
            let body = "";
            let json ="";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    json = JSON.parse(body);
                    resolve(json["urls"]["regular"]);
                } catch (error) {
                    console.error(error.message);
                    reject(json);
                }
            })
        })
    })
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6452b74613508403af85f6e4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images : [
                {
                    url: 'https://res.cloudinary.com/dgux66ig0/image/upload/v1691601571/YelpCamp/roos3zsryr8qokwbzhkj.jpg',
                    filename: 'YelpCamp/roos3zsryr8qokwbzhkj',
                  },
                  {
                    url: 'https://res.cloudinary.com/dgux66ig0/image/upload/v1691601571/YelpCamp/x6msiy1ic50zjnjng79q.jpg',
                    filename: 'YelpCamp/x6msiy1ic50zjnjng79q',
                  }
            ],
            geometry : { 
                type : "Point", 
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            //image: await getJSON(),
            //image: "https://source.unsplash.com/collection/483251",
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, dolore iusto! Recusandae placeat ducimus dicta officiis nobis reprehenderit non illum fugiat earum molestias cum iusto voluptatem est, ullam tempora ea.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});