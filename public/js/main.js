 AOS.init({
 	duration: 800,
 	easing: 'slide',
 	once: true
 });

jQuery(document).ready(function($) {

	"use strict";

	var slider = function() {
		$('.nonloop-block-3').owlCarousel({
	    center: false,
	    items: 1,
	    loop: false,
			stagePadding: 15,
	    margin: 20,
	    nav: true,
			navText: ['<span class="icon-arrow_back">', '<span class="icon-arrow_forward">'],
	    responsive:{
        600:{
        	margin: 20,
          items: 2
        },
        1000:{
        	margin: 20,
          items: 3
        },
        1200:{
        	margin: 20,
          items: 3
        }
	    }
		});
	};
	slider();


	var siteMenuClone = function() {

		$('<div class="site-mobile-menu"></div>').prependTo('.site-wrap');

		$('<div class="site-mobile-menu-header"></div>').prependTo('.site-mobile-menu');
		$('<div class="site-mobile-menu-close "></div>').prependTo('.site-mobile-menu-header');
		$('<div class="site-mobile-menu-logo"></div>').prependTo('.site-mobile-menu-header');

		$('<div class="site-mobile-menu-body"></div>').appendTo('.site-mobile-menu');

		

		$('.js-logo-clone').clone().appendTo('.site-mobile-menu-logo');

		$('<span class="ion-ios-close js-menu-toggle"></div>').prependTo('.site-mobile-menu-close');
		

		$('.js-clone-nav').each(function() {
			var $this = $(this);
			$this.clone().attr('class', 'site-nav-wrap').appendTo('.site-mobile-menu-body');
		});


		setTimeout(function() {
			
			var counter = 0;
      $('.site-mobile-menu .has-children').each(function(){
        var $this = $(this);
        
        $this.prepend('<span class="arrow-collapse collapsed">');

        $this.find('.arrow-collapse').attr({
          'data-toggle' : 'collapse',
          'data-target' : '#collapseItem' + counter,
        });

        $this.find('> ul').attr({
          'class' : 'collapse',
          'id' : 'collapseItem' + counter,
        });

        counter++;

      });

    }, 1000);

		$('body').on('click', '.arrow-collapse', function(e) {
      var $this = $(this);
      if ( $this.closest('li').find('.collapse').hasClass('show') ) {
        $this.removeClass('active');
      } else {
        $this.addClass('active');
      }
      e.preventDefault();  
      
    });

		$(window).resize(function() {
			var $this = $(this),
				w = $this.width();

			if ( w > 768 ) {
				if ( $('body').hasClass('offcanvas-menu') ) {
					$('body').removeClass('offcanvas-menu');
				}
			}
		})

		$('body').on('click', '.js-menu-toggle', function(e) {
			var $this = $(this);
			e.preventDefault();

			if ( $('body').hasClass('offcanvas-menu') ) {
				$('body').removeClass('offcanvas-menu');
				$this.removeClass('active');
			} else {
				$('body').addClass('offcanvas-menu');
				$this.addClass('active');
			}
		}) 

		// click outisde offcanvas
		$(document).mouseup(function(e) {
	    var container = $(".site-mobile-menu");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	      if ( $('body').hasClass('offcanvas-menu') ) {
					$('body').removeClass('offcanvas-menu');
				}
	    }
		});
	}; 
	siteMenuClone();


	var sitePlusMinus = function() {
		$('.js-btn-minus').on('click', function(e){
			e.preventDefault();
			if ( $(this).closest('.input-group').find('.form-control').val() != 0  ) {
				$(this).closest('.input-group').find('.form-control').val(parseInt($(this).closest('.input-group').find('.form-control').val()) - 1);
			} else {
				$(this).closest('.input-group').find('.form-control').val(parseInt(0));
			}
		});
		$('.js-btn-plus').on('click', function(e){
			e.preventDefault();
			$(this).closest('.input-group').find('.form-control').val(parseInt($(this).closest('.input-group').find('.form-control').val()) + 1);
		});
	};
	sitePlusMinus();


	var siteSliderRange = function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 500,
      values: [ 75, 300 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
      " - $" + $( "#slider-range" ).slider( "values", 1 ) );
	};
	siteSliderRange();


	var siteMagnificPopup = function() {
		$('.image-popup').magnificPopup({
	    type: 'image',
	    closeOnContentClick: true,
	    closeBtnInside: false,
	    fixedContentPos: true,
	    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
	     gallery: {
	      enabled: true,
	      navigateByImgClick: true,
	      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
	    },
	    image: {
	      verticalFit: true
	    },
	    zoom: {
	      enabled: true,
	      duration: 300 // don't foget to change the duration also in CSS
	    }
	  });

	  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
	    disableOn: 700,
	    type: 'iframe',
	    mainClass: 'mfp-fade',
	    removalDelay: 160,
	    preloader: false,

	    fixedContentPos: false
	  });
	};
	siteMagnificPopup();


});

// target the elements in the DOM used in the project

/**
 * svg for the key and keyhole
 * div nesting the ghost
 * heading and paragraph
 */
const key = document.querySelector(".key");
const keyhole = document.querySelector(".keyhole");
const ghost = document.querySelector(".ghost");

const heading = document.querySelector("h1");
const paragraph = document.querySelector("p");


// for the length of the timout, consider the --animation-duration custom property and add a small delay
// retrieve properties on the root element
const root = document.querySelector(":root");
const rootStyles = getComputedStyle(root);
// retrieve the animation-duration custom property
// ! this is specified as "40s", in seconds, so parse the number and includ it in milliseconds
const animationDuration = parseInt(rootStyles.getPropertyValue("--animation-duration"))*1000;
let keyTimer = animationDuration*9/8;


// retrieve the dimensions of the key (to have the key exactly where the cursor would lie)
const keyBox = key.getBoundingClientRect();
// console.log(keyBox);


// KEY & KEYHOLE ANIMATION
// include a timeout with the specified time frame
const timeoutID = setTimeout(() => {
  // after the specified time, change the cursor as to seemingly grab the key
  key.parentElement.parentElement.style.cursor = "grab";

  // introduce the key and keyhole svg elements by triggering the paused-by-default animation
  key.style.animationPlayState = "running";
  keyhole.style.animationPlayState = "running";

  // ! pointer-events set to none on the key to allow for a mouseover event on the keyhole
  // the key is indeed used in stead of the normal cursor and would overlap on top of everything
  key.style.pointerEvents = "none";

  // when the cursor hovers anywhere in the window, call a function to update the position of the key and have it match the cursor
  window.addEventListener("mousemove", updateKeyPosition);

  // when the cursor hovers on the keyhole, call a function to grant access and remove present listeners
  keyhole.addEventListener("mouseover", grantAccess);

  clearTimeout(timeoutID);
}, keyTimer);


// define the function which updates the position of the absolute-positioned key according to the mouse coordinates (and the keys own dimensions)
const updateKeyPosition = (e) => {
  let x = e.clientX;
  let y = e.clientY;
  key.style.left = x - keyBox.width/1.5;
  key.style.top = y - keyBox.height/2;
};

// define the function which notifies the user of the grant access
const grantAccess = () => {
  // restore the cursor
  key.parentElement.parentElement.style.cursor = "default";

  // change the text of the heading and paragraph elements
  heading.textContent = '🎉 yay 🎉';
  paragraph.textContent = 'access granted';

  // remove the svg elements for the key and keywhole from the flow of the document
  keyhole.style.display = "none";
  key.style.display = "none";

  // remove the event listeners, most notably the one on the window
  window.removeEventListener("mousemove", updateKeyPosition);
  keyhole.removeEventListener("mouseover", grantAccess);
};

function addToCart(id) {
	let url = '/add-to-cart/' + id;
	fetch(url, {
	  method: 'GET'
	}).then(r => r.json())
	.then((res)=>{
	  if(res.status) {
		console.log(res.status)
		// console.log(count, "|||||||||||||||||||||||||||||")
	  let count = document.getElementById('cart-count').innerText;
		let numericalCount = +count + 1
		document.getElementById('cart-count').innerText = numericalCount 
	  }else if(!res.status){
		console.log(res.status)
		
		location.href='/login'
	  }
	})
}