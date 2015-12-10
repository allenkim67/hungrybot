var axios = require('axios');
var geolib = require('geolib');
var GKEY = process.env.GOOGLE_MAP_KEY

module.exports.geoCoder = async function(business, customer){
  var businessAddress = `https://maps.googleapis.com/maps/api/geocode/json?address=${business.address.street},${business.address.city}+${business.address.zip}&key=${GKEY}`;
  var customerAddress = `https://maps.googleapis.com/maps/api/geocode/json?address=${customer.address.street},${customer.address.city}+${customer.address.zip}&key=${GKEY}`;
  var businessRes = await axios.get(businessAddress);
  var customerRes = await axios.get(customerAddress)
  var businessGeoCode = await {latitude: businessRes.data.results[0].geometry.location.lat, longitude: businessRes.data.results[0].geometry.location.lng}
  var customerGeoCode = await {latitude: customerRes.data.results[0].geometry.location.lat, longitude: customerRes.data.results[0].geometry.location.lng}
  var totalDistance = await geolib.getDistance(businessGeoCode, customerGeoCode);
  var totalMiles = await geolib.convertUnit('mi', totalDistance);

  return (business.deliveryRadius >= totalMiles ? true : false);
};