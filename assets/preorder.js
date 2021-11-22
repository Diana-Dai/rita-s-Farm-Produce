// THIS FUNCTIONS ARE FOR PREORDER
// Update the delivery settings
$(document).ready(function () {
  class PreOrder{
    constructor(target){
      this.target = target
      this.orderType = this.checkPreOrderItem(this.target);
      this.year = (new Date()).getFullYear();
      this.deliveryStartDate = new Date(`${this.year}-12-17`);
      this.deliveryEndDate = new Date(`${this.year}-12-23`);
      this.deliveryStartDateStamp = this.deliveryStartDate.getTime();
      this.deliveryEndDateStamp = this.deliveryEndDate.getTime();
    }
    checkPreOrderItem(target) {
      let preOder = 0,
      normalOrder = 0,
      orderAmount = 0;
      if(target === "cart-drawer"){
        $('.ajaxcart__product').each(function () {
          orderAmount++;
          let isPreordered = $(this).find(".ajaxcart__product-meta");
          if(isPreordered.length === 0){
            normalOrder++
            return;
          }
          preOder++
        });
      }else{
        $('.grid__item.three-quarters').each(function () {
          orderAmount++;
          let isPreordered = $(this).find(".Note");
          if(isPreordered.length === 0){
            normalOrder++
            return;
          }
          preOder++
        });
      }
      console.log(preOder, normalOrder, orderAmount);
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
          this.triggerPopUp();
        }
      }
    }
    triggerPopUp(){
      var that = this;
      if($('#preorder-warning-popup').length>0){
        $('#preorder-warning-popup').show();
        return;
      }else{
        var newNode = $("<div id='preorder-warning-popup'><div><h2>Warning: you have pre-order and in-stock items in the same cart</h2><p>Your cart items won't be shipped before pre-order items are available. (Delivery date for pre-order items <strong>starts on 17th of December</strong>.)<br>To get your in-stock items delivered earlier, please make two separate orders - one for your pre-order items and one for your in-stock items.</p></div><a href='#' id='preorder-warning-popup__close' class='preorder-warning-popup__close'><svg class='preorder-warning-popup__close' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'><path d='M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm0 10.293l5.293-5.293.707.707-5.293 5.293 5.293 5.293-.707.707-5.293-5.293-5.293 5.293-.707-.707 5.293-5.293-5.293-5.293.707-.707 5.293 5.293z'></path></svg></a></div>")
        console.log(newNode);
        setTimeout(() => {
          $('body').append(newNode);
          that.setPopupEvent();
        }, 1000);
      }

    }
    setPopupEvent(){
        $('#preorder-warning-popup__close').click(function () {
          $('#preorder-warning-popup').hide();
        })
    }
    watchDatePicker(){
      if($('.picker__holder').length === 0){
        var that = this;
        // console.log(this);
        var interval = setInterval(() => {
          if($('.picker__holder').length > 0){
            clearInterval(interval);
            that.watchInputValue();
          }
        }, 500);
      }
    }
    disableCheckout(){
      $('.cart__checkout').attr('disabled','disabled')
    }
    ableCheckout(){
      clearInterval(this.interval4Btn);
      console.log(this.interval4Btn);
      $('.cart__checkout').attr('disabled',false);
    }
    watchInputValue(){
      var that = this, selectedDateStamp;
      var inputwatcher = setInterval(() => {
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
            that.disableCheckout();
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
        console.log($(this));
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
  function initPreOrderFuns() {
      // Check if the user is on the cart page or opened the cart drawer
    if(window.location.href.indexOf('cart') > 0){
      const preOrder = new PreOrder('cart');
      preOrder.init();    
    }else{
      observeDrawer();
    }
  }

  function observeDrawer() {
    function initPreOrder() {
      observer.disconnect();
      const preOrder = new PreOrder('cart-drawer');
      preOrder.init();
    }
    var observer = new MutationObserver(initPreOrder);
    let config = {
    attributes: true, 
    };
    observer.observe(document.querySelector('#CartDrawer'),config)
  }

  initPreOrderFuns();

});