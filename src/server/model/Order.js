var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var timestamps   = require('mongoose-timestamp');
var _            = require('underscore');

var orderSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  total: {type: Number, default: 0},
  items: [{item: String, quantity: Number}],
  status: {type: String, default: 'pending'}
});

orderSchema.plugin(findOrCreate);
orderSchema.plugin(timestamps);

orderSchema.statics.addOrder = function(businessId, customerId, params, menu) {
  return new Promise(function(resolve, reject) { 
    this.findOrCreate({businessId: businessId, customerId: customerId, status: 'pending'}, function(err, order){
      var quantity = params.number ? parseInt(params.number) : 1;
      order.total += menu.price * quantity;
      var existingOrder = _.find(order.items, function(order) {
        return order.item === params.food;
      });
      if(existingOrder) {
        existingOrder.quantity += quantity;
      } else {
        order.items.push({item: params.food, quantity: quantity});
      }
      order.save(function(err, order) { 
        resolve(order); 
      });
    });
  }.bind(this));
}

 orderSchema.statics.removeItem = function(businessId, customerId, params, menu) {
   return new Promise(function(resolve, reject) {
     this.findOne({businessId: businessId, customerId: customerId, status: 'pending'}, function(err, order){
       var existingOrder = _.find(order.items, function(order) {
         return order.item === params.food;
       });
       if (existingOrder) {
         var quantity = Math.min(existingOrder.quantity, parseInt(params.number));
         existingOrder.quantity -= quantity;
         order.total -= menu.price * quantity;
         if (existingOrder.quantity === 0) {
           order.items = _.without(order.items, existingOrder);
         }
       }
       if (order.items.length === 0) {
         order.remove(function() {resolve(null);});
       } else {
         order.save(function(err, order) {
           if (err) { reject(err); }
           resolve(order);
         });
       }
     });
   }.bind(this));
 }

module.exports = mongoose.model('Order', orderSchema);