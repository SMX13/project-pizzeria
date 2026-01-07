'use strict';

class AmountWidget {
  constructor(element) {
    this.dom = {};
    this.dom.wrapper = element;

    this.getElements();
    this.initActions();

    this.value = 1;
  }

  getElements() {
    this.dom.input = this.dom.wrapper.querySelector('input[name="amount"]');
    this.dom.linkDecrease = this.dom.wrapper.querySelector('a[href="#less"]');
    this.dom.linkIncrease = this.dom.wrapper.querySelector('a[href="#more"]');
  }

  initActions() {
    this.dom.input.addEventListener('change', () => {
      this.value = this.dom.input.value;
    });

    this.dom.linkDecrease.addEventListener('click', event => {
      event.preventDefault();
      this.value--;
    });

    this.dom.linkIncrease.addEventListener('click', event => {
      event.preventDefault();
      this.value++;
    });
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const newValue = parseInt(value);

    if (newValue >= 0 && newValue <= 10) {
      this._value = newValue;
      this.dom.input.value = this._value;
      this.announce();
    }
  }

  announce() {
    this.dom.wrapper.dispatchEvent(
      new CustomEvent('updated', { bubbles: true })
    );
  }
}

window.AmountWidget = AmountWidget;
