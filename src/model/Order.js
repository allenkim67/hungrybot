var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var _            = require('underscore');

var orderSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  total: {type: Number, default: 0},
  orders: [{item: String, quantity: Number}],
  status: {type: String, default: 'pending'}
});

orderSchema.plugin(findOrCreate);

orderSchema.statics.addOrder = function(businessId, customerId, params, menu) {
  return new Promise(function(resolve, reject) { 
    this.findOrCreate({businessId: businessId, customerId: customerId, status: 'pending'}, function(err, order){
      order.total += menu.price * params.number;
      var existingOrder = _.find(order.orders, function(order) {
        return order.item === params.food;
      });
      if(existingOrder) {
        existingOrder.quantity += parseInt(params.number);
      } else {
        order.orders.push({item: params.food, quantity: params.number});
      }
      order.save(function(err, order) { 
        resolve(order); 
      });
    });
  }.bind(this));
}

module.exports = mongoose.model('Order', orderSchema);