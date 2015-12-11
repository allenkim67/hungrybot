var mongoose     = require('mongoose');
var findOrCreate = require('../util/findOrCreatePlugin');
var timestamps   = require('mongoose-timestamp');
var Menu         = require('./Menu');
var _            = require('underscore');

var orderSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  total: {type: Number, default: 0},
  items: [{name: String, quantity: Number}],
  status: {type: String, default: 'pending'}
});

orderSchema.plugin(findOrCreate);
orderSchema.plugin(timestamps);

orderSchema.methods.displayTotal = function() {
  return (this.total / 100).toFixed(2);
};

orderSchema.statics.addOrder = async function({businessId, customerId, orders}) {
  var menuItems = await Menu.find({
    businessId,
    $or: orders.map(order => { return {name: order.food} })
  }).exec();

  var dbOrder = await this.findOrCreate({businessId, customerId, status: {$ne: 'paid'}}, {businessId, customerId});

  orders.forEach(order => {
    var menuItem = menuItems.find(menuItem => menuItem.name === order.food);
    var quantity = order.number ? parseInt(order.number) : 1;
    var existingMenuItem = dbOrder.items.find(item => item.name === order.food);

    existingMenuItem ?
      existingMenuItem.quantity += quantity :
      dbOrder.items.push({name: order.food, quantity: quantity});

    dbOrder.total += menuItem.price * quantity;
  });

  return await dbOrder.save();
};

orderSchema.statics.removeItem = async function({businessId, customerId, orders}) {
  var menuItems = await Menu.find({
    businessId,
    $or: orders.map(order => {
      return {name: order.food}
    })
  }).exec();

  var dbOrder = await this.findOne({businessId, customerId, status: {$ne: 'paid'}}, {businessId, customerId}).exec();

  orders.forEach(order => {
    var menuItem = menuItems.find(menuItem => menuItem.name === order.food);
    var existingMenuItem = dbOrder.items.find(item => item.name === order.food);

    if (existingMenuItem) {
      var quantity = Math.min(existingMenuItem.quantity, parseInt(order.number));
      existingMenuItem.quantity -= quantity;
      if (existingMenuItem.quantity < 1) {
        dbOrder.items = _.without(dbOrder.items, existingMenuItem);
      }
      dbOrder.total -= menuItem.price * quantity;
    }
  });

  return dbOrder.items.length < 1 ? await dbOrder.remove() : await dbOrder.save();
};

module.exports = mongoose.model('Order', orderSchema);