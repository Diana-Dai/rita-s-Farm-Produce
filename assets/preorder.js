// Update the delivery settings
$(document).ready(function () {
  var utils = {
    setPopUp:function(popupId, closeId, html){
      if($(`#${popupId}`).length>0){
        $(`#${popupId}`).show();
        return;
      }else{
        var newNode = $(`<div class='warning-popup' id='${popupId}'>${html}<a href='#' id='${closeId}' class='warning-popup__close'><svg class='warning-popup__close' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'><path d='M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm0 10.293l5.293-5.293.707.707-5.293 5.293 5.293 5.293-.707.707-5.293-5.293-5.293 5.293-.707-.707 5.293-5.293-5.293-5.293.707-.707 5.293 5.293z'></path></svg></a></div>`)
        // console.log(newNode);
        setTimeout(() => {
          $('body').append(newNode);
          setPopupEvent();
          function setPopupEvent(){
            $(`#${closeId}`).click(function () {
              $(`#${popupId}`).hide();
            })
          }
        }, 1000);
      }
    }  
  }

  class PreOrder{
    constructor(){
      this.orderType = this.checkPreOrderItem(this.target);
      this.year = (new Date()).getFullYear();
      this.deliveryStartDate = new Date(`${this.year}-12-17`);
      this.deliveryEndDate = new Date(`${this.year}-12-23`);
      this.deliveryStartDateStamp = this.deliveryStartDate.getTime();
      this.deliveryEndDateStamp = this.deliveryEndDate.getTime();
    }
    observeCart(){
      var observer = new MutationObserver(function () {
        console.log('changed');
        });
      let config = {
        attributes: true, 
      };
      observer.observe(document.querySelector('#CartContainer'),config)
    }
    checkPreOrderItem() {
      let preOder = 0,
      normalOrder = 0,
      orderAmount = 0;

      $('.grid.product').each(function () {
        orderAmount++;
        let isPreordered = $(this).find(".Note");
        if(isPreordered.length === 0){
          normalOrder++
          return;
        }
        preOder++
      });

      if(preOder === orderAmount){
        return 'preorder';
      }else if(normalOrder === orderAmount){
        return 'normal'
      }else{
        return 'mix'
      }
    }
    init(){
      // preorder && mixorder
      // mixorder ====> popup
      if (this.orderType !== 'normal') {
        this.watchDatePicker();
        if (this.orderType === 'mix'){
          var html = "<div><h2>Warning: you have pre-order and in-stock items in the same cart</h2><p>Your cart items won't be shipped before pre-order items are available. (Delivery date for pre-order items <strong>starts on 17th of December</strong>.)<br>To get your in-stock items delivered earlier, please make two separate orders - one for your pre-order items and one for your in-stock items.</p></div>";
          utils.setPopUp('preorder-warning-popup', 'preorder-warning-popup__close', html);
        }
      }
    }
    watchDatePicker(){
      if($('.picker__holder').length === 0){
        var that = this;
        // console.log(this);
        var interval = setInterval(() => {
          if($('.picker__holder').length > 0){
            clearInterval(interval);
            that.getSelectedDate();
          }
        }, 500);
      }
    }
    ableCheckout(){
      clearInterval(this.interval4Btn);
      $('.cart__checkout').attr('disabled',false);
    }
    getSelectedDate(){
      var that = this, selectedDateStamp;
      this.inputwatcher = setInterval(() => {
        if ( $('input[name="zpDate"]').length>0) {
          that.disablePickers();
          var selectedDate = $('input[name="zpDate"]').attr('value');
          if (selectedDate !== 'undefined' && selectedDate) {
            var newStamp = (new Date(selectedDate)).getTime();
            if(newStamp !== selectedDateStamp){
              selectedDateStamp = newStamp;
              var readyToCheckOut = that.checkDeliveryDate(selectedDateStamp);
              if(readyToCheckOut){
                that.getready();
                clearInterval(that.interval4pickers);
              }else{
                that.keepCheckOutDisabled();
                that.addwarning();
              }
            }
          }
        }
        }, 500);
    }
    keepCheckOutDisabled(){
      var that = this;
      this.interval4Btn = setInterval(() => {
          if(!$('.cart__checkout').attr('disabled')){
            $('.cart__checkout').attr('disabled','disabled');
          }
        }, 500);
    }
    addwarning(){
      if($('.cart__checkout-wrapper').find('#wrongDate').length>0){
        return;
      }
      var newNode = $('<p id="wrongDate" class="error">Please choose a date between 17th to 23th of December for pre-order products</p>')
      newNode.insertAfter($('#storePickupApp'));
    }
    removewarning(){
      $('#wrongDate').remove();
    }
    disablePickers(){
      var that = this;
      this.interval4pickers = setInterval(() => {
        $('.picker__day').each(function(){
          var dateStamp = $(this).attr('data-pick');
          if(!that.checkDeliveryDate(dateStamp)){
            if(!$(this).hasClass('picker__day--disabled')){
              $(this).addClass('picker__day--disabled');
            }
          }
        })
      }, 500);
    }
    checkDeliveryDate(selectedDateStamp){
      return selectedDateStamp < this.deliveryEndDateStamp && selectedDateStamp > this.deliveryStartDateStamp;
    }
    getready(){
      this.ableCheckout();
      this.removewarning();
    }
  }

  // Shiralee Butcher order stops at 8am for next day order
  class OrderLimit{
    constructor(){
      this.limitedProducts = [];
      // this.todayStamp = (new Date()).getTime();
      this.todayStamp = (new Date('2021-11-26 8:01')).getTime();
      this.today = (new Date()).getDate();
      this.nowhour = (new Date()).getHours();
      this.selectedDate = '';
    }
    init(){
      this.observeCart();
      if(this.hasShiraleeMeat()){
        this.triggerTheObserver();
      }
    }
    observeCart(){
      var that = this;
      var observer = new MutationObserver(function () {
        if(!that.hasShiraleeMeat()){
          that.ableCheckout();
        }
      });
      let config = {
        attributes: true, 
      };
      observer.observe(document.querySelector('#CartContainer'),config)
    }
    hasShiraleeMeat(){
      var hasShiraleeMeat = false;
      var that = this;
      this.limitedProducts = [];
      $('.grid.product').each(function (index,item) {
      //  debugger
        if($(item).attr('data-vendor') === 'Shiralee Meat'){
          var productName = $(item).find('a.cart__product-name').text().trim();
          that.getProductList(productName);
          hasShiraleeMeat = true;
          return;
        }
      })
      return hasShiraleeMeat;
    }
    getProductList(productName){
      if(this.limitedProducts.indexOf(productName) === -1){
        this.limitedProducts.push(productName);
      }
    }
    triggerTheObserver(){
      if($('.picker__holder').length === 0){
        var that = this;
        // console.log(this);
        var interval = setInterval(() => {
          if($('.picker__holder').length > 0){
            clearInterval(interval);
            that.getSelectedDate();
          }
        }, 500);
      }
    }
    getSelectedDate(){
      var that = this;
      var inputwatcher = setInterval(() => {
        if ( $('input[name="zpDate"]').length>0) {
          var selectedDate = $('input[name="zpDate"]').attr('value');
          if (selectedDate !== 'undefined' && selectedDate) {
            if (selectedDate !== that.selectedDate) {
                console.log(selectedDate);
                that.selectedDate = selectedDate;
                that.validateOrder(selectedDate);
            }
          }
        }
        }, 500);
    }
    validateOrder(selectedDate){
      // Check the order time
      // If delivery date is tomorrow
      // And order time is after 8am
      // Then disable check out button and notify the customer to choose another date
      var deliveryStamp = (new Date(selectedDate)).getTime();
      
      // 57600000 is the stamp difference from today 8am to tomorrow
      if (deliveryStamp - this.todayStamp <= 57600000) {
        // Check if there's limited products;
        if (this.limitedProducts.length>=0) {
          this.keepCheckOutDisabled();
          this.setPopUp();
        }
      }else{
        this.ableCheckout();
      }
    }
    keepCheckOutDisabled(){
      var that = this;
      this.interval4Btn = setInterval(() => {
        if(!$('.cart__checkout').attr('disabled')){
          $('.cart__checkout').attr('disabled','disabled')
        }
      }, 500);
    }
    ableCheckout(){
      clearInterval(this.interval4Btn);
      $('.cart__checkout').attr('disabled',false);
    }
    setPopUp(){
      if($('#shiralee-warning-popup')){
        $('#shiralee-warning-popup').remove();
      }
      var productHtml = '<div class="shiralee-list"><p>Products:</p><ul>';
      for (let index = 0; index <this.limitedProducts.length; index++) {
        const element = this.limitedProducts[index];
        productHtml += `<li>${element}</li>`;
      }
      productHtml +='</ul></div>';
      var html = `<div><h2>Warning</h2><p>The following products must be ordered before 8am the day before, please remove the following products or choose a different delivery day.</p>${productHtml}</div>`;
      utils.setPopUp('shiralee-warning-popup', 'shiralee-warning-popup__close', html);
    }
  }

  function initPreOrderFuns() {
      // Check if the user is on the cart page or opened the cart drawer
    if(window.location.href.indexOf('cart') > 0){
      const preOrder = new PreOrder();
      preOrder.init();    

      const shiraleeLimit = new OrderLimit();
      shiraleeLimit.init();
    }else{
      observeDrawer();
    }
  }

  function observeDrawer() {
    function initPreOrder() {
      observer.disconnect();
      const preOrder = new PreOrder();
      preOrder.init();
      
      const shiraleeLimit = new OrderLimit();
      shiraleeLimit.init();
    }
    var observer = new MutationObserver(initPreOrder);
    let config = {
    attributes: true, 
    };
    observer.observe(document.querySelector('#CartDrawer'),config)
  }

  initPreOrderFuns();

});