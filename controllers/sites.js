const Site = require('../models/site');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const sites = await Site.find({});
    req.session.returnTo = req.originalUrl;
    res.render('sites/index', { sites })
}

module.exports.indexV2 = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;
    const totalSites = await Site.countDocuments({});
    const totalPages = Math.ceil(totalSites / perPage);

    const sites = await Site.find({})
    .skip((page - 1) * perPage)
    .limit(perPage);
    const allSites = await Site.find({});
    
    //const sites = await Site.find({});
    req.session.returnTo = req.originalUrl;
    res.render('sites/indexV2', { sites, totalPages, currentPage: page, allSites } );
}

module.exports.renderNewForm = (req, res) => {
    res.render('sites/new');
}

module.exports.createSite = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.site.location,
        limit: 1
    }).send();
    const site = new Site(req.body.site);
    //console.log(geoData.body.features[0].geometry);
    //const hasAlphabet = /^[\x7f-\xffaa-zA-Z0-9.,/"'()+-\s]+$/.test(req.body.site.location);
    if (geoData.body.features.length > 0) {
        site.geometry = geoData.body.features[0].geometry;
    }
    else {
        //Initialize an empty geometry object
        //If user key in invalid location, default place is 0,0
        const geom = {
            'type': 'Point',
            'coordinates' : [0, 0]
        };
        site.geometry = geom;
    }
    const isCoordinates = /^[-0-9,\s]+$/.test(req.body.site.location);
    if (isCoordinates) {
        const coordinates = req.body.site.location.split(",");
        site.geometry.coordinates[0] = Number(coordinates[0]);
        site.geometry.coordinates[1] = Number(coordinates[1]);
    }
    site.images = req.files.map(f => ({url: f.path, filename: f.filename }));
    site.author = req.user._id;
    await site.save();
    req.flash('success', 'Successfully made a new site');
    res.redirect(`/sites/${site._id}`);
}

module.exports.showSite = async (req, res) => {
    const site = await Site.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!site){
        req.flash('error', 'Cannot find that site!');
        return res.redirect('/sites');
    }
    req.session.returnTo = req.originalUrl;
    res.render('sites/show', { site });
}

module.exports.renderEditForm = async (req, res) => {
    const site = await Site.findById(req.params.id);
    if(!site){
        req.flash('error', 'Cannot find that site!');
        return res.redirect('/sites');
    }
    res.render('sites/edit', { site });
}

module.exports.updateSite = async (req, res) => {
    const { id } = req.params;
    const site = await Site.findByIdAndUpdate(id, { ...req.body.site });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }));
    site.images.push(...imgs);
    await site.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);            
        }
        await site.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully updated site');
    res.redirect(`/sites/${site._id}`)
}

module.exports.deleteSite = async (req, res) => {
    const { id } = req.params;
    const site = await Site.findById(id);
    for (let image of site.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    for (let review of site.reviews) {
        await Review.findByIdAndDelete(review._id)
    }
    req.flash('success', 'Successfully deleted site')
    res.redirect('/sites');
}