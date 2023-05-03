const { default: Swal } = require("sweetalert2");

!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);
let t1 = gsap.timeline();
let t2 = gsap.timeline();
let t3 = gsap.timeline();

t1.to(".cog1",
{
  transformOrigin:"50% 50%",
  rotation:"+=360",
  repeat:-1,
  ease:Linear.easeNone,
  duration:8
});

t2.to(".cog2",
{
  transformOrigin:"50% 50%",
  rotation:"-=360",
  repeat:-1,
  ease:Linear.easeNone,
  duration:8
});

t3.fromTo(".wrong-para",
{
  opacity:0
},
{
  opacity:1,
  duration:1,
  stagger:{
    repeat:-1,
    yoyo:true
  }
});

// validation...................................
function ValidateEmail(inputText){

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(!inputText.value.match(mailformat)){

      document.getElementById('emailAlert').style.display = "block"
      document.getElementById("submitBtn").disabled = true;
      document.form1.email.focus();
      return false;

    }else if(inputText.value.match(mailformat)){

      document.getElementById('emailAlert').style.display = "none"
      document.getElementById("submitBtn").disabled = false;

      
      // document.form1.email.focus();
    }

}

function validatePassword(inputText){
  var passw=  "";

  if(inputText.value.length === 0){

    document.getElementById('passwordAlert').style.display = "block"
    document.getElementById("submitBtn").disabled = true;

    document.form1.password.focus();
    return false;

  }else{

    document.getElementById('passwordAlert').style.display = "none"
    document.getElementById("submitBtn").disabled = false;
    
    // document.form1.email.focus();
  } 
}

function addToCart(id) {
  let count = document.getElementById('cart-count').innerText;
  let url = '/add-to-cart/' + id;
  fetch(url, {
    method: 'GET'
  }).then((res)=>{
    if(res.status === 200) {
      // console.log(count, "|||||||||||||||||||||||||||||")
    let count = document.getElementById('cart-count').innerText;
      let numericalCount = +count + 1
      document.getElementById('cart-count').innerText = numericalCount 
      
    }else{
      location.assign('users/login')
    }
  })
}




