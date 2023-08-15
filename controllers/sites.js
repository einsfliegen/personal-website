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

module.exports.renderNewForm = (req, res) => {
    res.render('sites/new');
}

module.exports.createSite = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.site.location,
        limit: 1
    }).send();
    const site = new Site(req.body.site);
    site.geometry = geoData.body.features[0].geometry;
    const coordinates = req.body.site.location.split(",");
    site.geometry.coordinates[0] = Number(coordinates[0]);
    site.geometry.coordinates[1] = Number(coordinates[1]);
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
    await Site.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted site')
    res.redirect('/sites');
}