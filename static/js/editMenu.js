$('.js-menu-btn-edit').click(function(event){
  var $menu = $(event.target).closest('.js-menu');
  var $menuEdit = $(event.target).parent().siblings('.js-menu-edit');
  $menu.hide();
  $menuEdit.show();
})

$('.js-menu-btn-delete').click(function(event){
  var $menuItem = $(event.target).closest('.js-menu');
  var menuItemId = $menuItem.find('.js-menu-id').data('id');
  $.ajax({ 
    type: 'delete',
    url: '/menu/delete/' + menuItemId,
  });
  $menuItem.html('')  
})

$('.js-menu-btn-save').click(function(event){
  var $menuEdit = $(event.target).closest('.js-menu-edit');
  var $menu = $(event.target).parent().siblings('.js-menu');
  var $menuItem = $(event.target).siblings('.js-menu-item');
  var $menuNew = $(event.target).parent().siblings('.js-menu').children('.js-menu-id');
  var name = $menuEdit.find('.js-menu-name').find('input').val();
  var description = $menuEdit.find('.js-menu-description').find('input').val();
  var price = $menuEdit.find('.js-menu-price').find('input').val();
  var menuItemId = $menu.find('.js-menu-id').data('id');
  $menuEdit.hide();
  $menu.show();
  $menuNew.html(
      '<li>Name: ' + name + '</li>' +
      '<li>Description: ' + description + '</li>' +
      '<li>Price: ' + price + '</li>' 
  );
  $menuItem.html(
      '<li class="js-menu-name">' +
        'Name: <input value='+name+'></input>' +
      '</li>' +
      '<li class="js-menu-description">' +
        'Description: <input value=' + description + '></input>' +
      '</li>' +
      '<li class="js-menu-price">' +
        'Price: <input value=' + price + '></input>' +
      '</li>'
  );    
  $.ajax({ 
    type: 'put',
    url: '/menu/update/' + menuItemId,
    data: {name: name, description: description, price: price}
  });
});

$('.js-menu-btn-cancel').click(function(event){
  var $menuEdit = $(event.target).closest('.js-menu-edit');
  var $menu = $(event.target).parent().siblings('.js-menu');
  $menuEdit.hide();
  $menu.show();
});

