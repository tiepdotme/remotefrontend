import React from 'react';
import uuid from 'uuid';

const amount = 900;

// Below is where the checkout component is defined.
// It has several functions and some default state variables.
const Checkout = class extends React.Component {
  state = {
    disabled: false,
    buttonText: 'Sign me up!',
    paymentMessage: '',
  };

  resetButton() {
    this.setState({ disabled: true, buttonText: 'Payment complete' });
  }

  componentDidMount() {
    this.stripeHandler = window.StripeCheckout.configure({
      // You’ll need to add your own Stripe public key to the `checkout.js` file.
      // key: 'pk_test_STRIPE_PUBLISHABLE_KEY',
      key: 'pk_test_okjVYrTDsEVOKIlfdR3RhS1Z',
      closed: () => {
        this.resetButton();
      },
    });
  }

  openStripeCheckout(event) {
    const { lambdaEndpoint } = this.props;
    event.preventDefault();
    this.setState({ disabled: true, buttonText: 'Loading...' });
    this.stripeHandler.open({
      name: 'FE Remote Job Alerts',
      amount: amount,
      description: 'Subscription for instant job alerts',
      zipCode: true,
      token: token => {
        fetch(lambdaEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            token,
            amount,
            idempotency_key: uuid(),
          }),
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        })
          .then(res => {
            console.log('Transaction processed successfully');
            console.log(res);
            this.resetButton();
            this.setState({ paymentMessage: 'Payment Successful!' });
            return res;
          })
          .catch(error => {
            console.error('Error:', error);
            this.setState({ paymentMessage: 'Payment Failed' });
          });
      },
    });
  }

  render() {
    return (
      <div>
        <h2>Front End Remote Jobs: Premium</h2>
        <p>
          Get instant alerts when new jobs are added and be one of the first to
          apply!
        </p>
        <p>
          Use any email, 4242 4242 4242 4242 as the credit card number, any 3
          digit number, and any future date of expiration.
        </p>
        <button
          onClick={event => this.openStripeCheckout(event)}
          disabled={this.state.disabled}
        >
          {this.state.buttonText}
        </button>
        {this.state.paymentMessage}
      </div>
    );
  }
};

export default Checkout;
