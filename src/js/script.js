/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

 thisProduct.renderInMenu();
thisProduct.initAccordion();
thisProduct.initOrderForm();
thisProduct.processOrder();
thisProduct.processImages();

  }

 renderInMenu() {
  const thisProduct = this;

  const generatedHTML = templates.menuProduct(thisProduct.data);
  thisProduct.element = utils.createDOMFromHTML(generatedHTML);

  thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

  const menuContainer = document.querySelector(select.containerOf.menu);
  menuContainer.appendChild(thisProduct.element);
}

initAccordion() {
  const thisProduct = this;

  const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

  clickableTrigger.addEventListener('click', function(event){
    event.preventDefault();

    const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

    for(let activeProduct of activeProducts){
      activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
    }

    thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
  });
}



  initOrderForm() {
    const thisProduct = this;

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
  }

  processOrder() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options){
        const option = param.options[optionId];

        const optionSelected =
          formData[paramId] &&
          formData[paramId].includes(optionId);

        if(optionSelected && !option.default){
          price += option.price;
        }

        if(!optionSelected && option.default){
          price -= option.price;
        }
      }
    }

    thisProduct.priceSingle = price;
  thisProduct.priceElem.innerHTML = price;
  thisProduct.processImages();


  }

   processImages() {
    const thisProduct = this;

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options){
        const option = param.options[optionId];

        const optionSelected =
          thisProduct.form.querySelector(
            `input[name="${paramId}"][value="${optionId}"]:checked`
          );

        const images = thisProduct.element.querySelectorAll(
          `.product__images [data-option="${optionId}"]`
        );

        for(let image of images){
          if(optionSelected){
            image.classList.add(classNames.menuProduct.imageVisible);
          } else {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
  }
}




const app = {
  init: function(){
    console.log('*** App starting ***');

    this.initMenu();

    console.log(classNames, settings);
  },

  initMenu: function(){
    for(let productId in dataSource.products){
      new Product(productId, dataSource.products[productId]);
    }
  },
};

app.init();