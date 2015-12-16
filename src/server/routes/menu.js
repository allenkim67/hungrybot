var router              = require('express').Router();
var validators          = require('../validators');
var authMiddleware      = require('../authMiddleware');
var Business            = require('../model/Business');
var Menu                = require('../model/Menu');
var refreshUserEntities = require('../util/nlp').refreshUserEntities;
var multer              = require('multer');
var s3                  = require('../util/s3');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/img/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({storage: storage});
var menuSave = upload.fields([{name: 'menuImage', maxCount: 12, }])

router.post('/upload', authMiddleware, menuSave, function(req, res) {
  Business.findOneAndUpdate({_id: req.session._id}, {$push: {menuImages: {$each: req.files.menuImage.map(image => image.filename)}}}).exec();
  req.files.menuImage.forEach(image => s3.upload(image.path, 'img/' + image.filename));
  res.status(200).end();
});

router.get('/', authMiddleware, function(req, res) {
  Menu.find({businessId: req.session._id},function (err, menuItems) {
    res.send(menuItems);
  })
});

router.post('/create', authMiddleware, async function(req, res) {
  try {
    await validators.menu(req);
    var menu = await Menu.create(Object.assign(req.body, {
      businessId: req.session._id,
      price: req.body.price * 100
    }));
    await refreshUserEntities(req.session._id);
    res.send(menu);
  } catch (errors) {
    res.status(400).send(errors);
  }
});

router.put('/update/:id', authMiddleware, async function(req, res) {
  try {
    await validators.menu(req);

    var updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price * 100,
      synonyms: req.body.synonyms
    };
    var menu = await Menu.findOneAndUpdate({_id: req.params.id, businessId: req.session._id}, updateData, {new: true}).exec();
    res.send(menu);
    await refreshUserEntities(req.session._id);
  } catch (errors) {
    res.status(400).send(errors);
  }
});

router.delete('/delete/:id', authMiddleware, async function(req, res) {
  await Menu.findOneAndRemove({_id: req.params.id, businessId: req.session._id}).exec();
  await refreshUserEntities(req.session._id);
  res.status(200).end();
});

module.exports = router;