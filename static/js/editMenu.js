$('.js-menu-btn-edit').click(function(event){
  var $menu = $(event.target).closest('.js-menu');
  var $menuEdit = $(event.target).parent().siblings('.js-menu-edit');

  var name = $menu.find('.js-menu-name-text').text();
  var description = $menu.find('.js-menu-description-text').text();
  var price = $menu.find('.js-menu-price-text').text();

  $menuEdit.find('.js-menu-name-input').val(name);
  $menuEdit.find('.js-menu-description-input').val(description);
  $menuEdit.find('.js-menu-price-input').val(price);

  $menu.hide();
  $menuEdit.show();
});

$('.js-menu-btn-cancel').click(function(event){
  var $menuEdit = $(event.target).closest('.js-menu-edit');
  var $menu = $(event.target).parent().siblings('.js-menu');
  $menuEdit.hide();
  $menu.show();
});


$('.js-menu-btn-delete').click(function(event){
  var $menuContainer = $(event.target).closest('.js-menu-container');
  var menuId = $menuContainer.data('id');

  $.ajax({
    type: 'delete',
    url: '/menu/delete/' + menuId
  });

  $menuContainer.html('');
});

$('.js-menu-btn-save').click(function(event){
  var $menu = $(event.target).parent().siblings('.js-menu');
  var $menuEdit = $(event.target).closest('.js-menu-edit');
  var menuId = $(event.target).closest('.js-menu-container').data('id');

  var name = $menuEdit.find('.js-menu-name-input').val();
  var description = $menuEdit.find('.js-menu-description-input').val();
  var price = $menuEdit.find('.js-menu-price-input').val();

  $.ajax({
    type: 'put',
    url: '/menu/update/' + menuId,
    data: {name: name, description: description, price: price * 100}
  });

  $menu.show();
  $menuEdit.hide();

  $menu.find('.js-menu-name-text').text(name);
  $menu.find('.js-menu-description-text').text(description);
  $menu.find('.js-menu-price-text').text(price);
});


