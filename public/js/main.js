//var $j = jQuery.noConflict();
$(document)
  .ready(function() {

    $('.filter.menu .item')
      .tab()
    ;

    $('.ui.rating')
      .rating({
        clearable: true
      })
    ;

    /*$('.ui.sidebar')
      .sidebar('attach events', '.launch.button')
    ;*/
	$('#menubtn').sidr();


    $('.ui.dropdown')
      .dropdown()
    ;

	$('.ui.accordion')
	  .accordion()
	;
  })
;