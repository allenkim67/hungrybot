(function() {
  //CLICK EDIT
  $('.js-menu-btn-edit').click(function(event){
    var menuData = getMenuData(event.target);

    menuData.inputs.$name.val(menuData.texts.$name.text());
    menuData.inputs.$description.val(menuData.texts.$description.text());
    menuData.inputs.$price.val(menuData.texts.$price.text());

    menuData.$listing.hide();
    menuData.$edit.show();
  });

  //CLICK SAVE
  $('.js-menu-edit').submit(function(event){
    event.preventDefault();
    var menuData = getMenuData(event.target);

    var data = {
      name:        menuData.inputs.$name.val(),
      description: menuData.inputs.$description.val(),
      price:       menuData.inputs.$price.val()
    };

    var error = function(res) {
      res = res.responseJSON;
      var errors = res.errors;
      menuData.$errors.html('');
      for (var i = 0; i < errors.length; i++) {
        menuData.$errors.append('<li>' + errors[i].msg + '</li>');
      }

      menuData.inputs.$name.val(res.name);
      menuData.inputs.$description.val(res.description);
      menuData.inputs.$price.val(res.price);
    };

    var success = function() {
      menuData.$errors.html('');
      menuData.$listing.show();
      menuData.$edit.hide();

      menuData.texts.$name.text(menuData.inputs.$name.val());
      menuData.texts.$description.text(menuData.inputs.$description.val());
      menuData.texts.$price.text(menuData.inputs.$price.val());
    };

    var config = {
      type: 'put',
      url: '/menu/update/' + menuData.id,
      data: data,
      success: success,
      error: error
    };

    $.ajax(config);
  });

  //CLICK CANCEL
  $('.js-menu-btn-cancel').click(function(event){
    event.preventDefault();
    var menuData = getMenuData(event.target);

    menuData.$edit.hide();
    menuData.$listing.show();
  });

  //CLICK DELETE
  $('.js-menu-btn-delete').click(function(event){
    var menuData = getMenuData(event.target);

    $.ajax({
      type: 'delete',
      url: '/menu/delete/' + menuData.id
    });

    menuData.$container.html('');
  });

  function getMenuData(target) {
    var $menuContainer = $(target).closest('.js-menu-container');
    var $menuEdit      = $menuContainer.find('.js-menu-edit');
    var $menuListing   = $menuContainer.find('.js-menu-listing');

    return {
      $container:     $menuContainer,
      $listing:       $menuListing,
      $edit:          $menuEdit,
      $errors:        $menuContainer.find('.js-menu-errors'),

      id:             $menuContainer.data('id'),

      inputs: {
        $name:        $menuEdit.find('.js-menu-name-input'),
        $description: $menuEdit.find('.js-menu-description-input'),
        $price:       $menuEdit.find('.js-menu-price-input')
      },

      texts: {
        $name:        $menuListing.find('.js-menu-name-text'),
        $description: $menuListing.find('.js-menu-description-text'),
        $price:       $menuListing.find('.js-menu-price-text')
      }
    }
  }
}());

