// @see {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|apiVersion in PaymentDataRequest}
// See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}

const

sampleTransactionInfo=
{
	countryCode: 'US',
	currencyCode: 'USD',
	totalPriceStatus: 'FINAL',
	totalPrice: '1.00'
},

merchantInfo={
	merchantName: 'Example Merchant',
	// merchantId: '01234567890123456789' //available for a production environment after approval by Google
},

prefetchTransactionInfo={
	totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
	currencyCode: 'USD'
},

error = err=> console.error(err);



const

client = (c=>()=>c||(c = new google.payments.api.PaymentsClient({environment: 'TEST'})))(null),

baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
},

baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedCardNetworks: ["MASTERCARD", "VISA"],
    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"]
  }
},

cardPaymentMethod = Object.assign(
  {
    tokenizationSpecification:{
	  type: 'PAYMENT_GATEWAY',
	  parameters: {
	    'gateway': 'example',
	    'gatewayMerchantId': 'exampleGatewayMerchantId'
	  }
	}
  },
  baseCardPaymentMethod
),

readyToPayRequest = Object.assign({
	allowedPaymentMethods: [baseCardPaymentMethod]
}, baseRequest),

dataRequest = transactionInfo => Object.assign({
	transactionInfo,
	merchantInfo,
	allowedPaymentMethods: [cardPaymentMethod]
}, baseRequest),


onGooglePayLoaded = () => client()
	.isReadyToPay(readyToPayRequest)
	.then( response => {
		if (response.result) {
			addGooglePayButton();
			// @todo prefetch payment data to improve performance after confirming site functionality
			client().prefetchPaymentData( dataRequest(prefetchTransactionInfo) );
		}
	})
	.catch(error);
},

doTransaction = transactionInfo => client()
	.loadPaymentData(dataRequest(transactionInfo))
	.then( paymentData => {
		console.log(paymentData);
		// @todo pass payment token to your gateway to process payment
		paymentToken = paymentData.paymentMethodData.tokenizationData.token;
	})
      .catch(error);
}
