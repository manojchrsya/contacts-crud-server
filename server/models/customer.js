

module.exports = function (Customer) {
  Customer.setup = function () {
    const CustomerModel = this;
    CustomerModel.validatesUniquenessOf('username', {
      message: 'already exists.',
    });
  };
  Customer.setup();

  Customer.signup = function (ctx, options) {
    const {
      username, password, confirmPassword,
    } = options;
    if (password !== confirmPassword) {
      throw new Error('confirm assword does not match with password.');
    }
    const customerData = {
      username,
      password,
    };
    return Customer.create(customerData);
  };

  Customer.remoteMethod(
    'signup',
    {
      description: 'Sign up customer.',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source: 'context' } },
        // eslint-disable-next-line max-len
        {
          arg: 'options', type: 'object', required: true, http: { source: 'body' },
        },
      ],
      returns: {
        arg: 'status', type: 'object', root: true,
      },
      http: { verb: 'post' },
    },
  );
};
