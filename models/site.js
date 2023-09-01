const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/c_fill,h_500,w_500');
})

ImageSchema.virtual('carousel').get(function() {
    //To-Do: Check size and apply quality reduction if image size >1MB
    return this.url.replace('/upload', '/upload/q_50');
})

const opts = { toJSON: { virtuals: true}, timestamps: true};

const SiteSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry : {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    attractions: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},
opts);

SiteSchema.virtual('properties.popUpMarkup').get(function() {
    return `
    <strong><a href="/sites/${this._id}" target="_blank">${this.title}</a></strong>
    <p>${this.attractions}</p>`;
})

SiteSchema.post('findOneAndDelete', async function(doc){
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Site', SiteSchema)