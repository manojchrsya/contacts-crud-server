const moment = require('moment');
const _ = require('lodash');

module.exports = function (ContactView) {
  ContactView.updateView = function (instance) {
    return ContactView.findOrCreate({
      where: {
        customerId: instance.customerId,
        contactId: instance.contactId,
        date: moment().format('YYYY-MM-DD'),
      },
    }, {
      customerId: instance.customerId,
      contactId: instance.contactId,
      date: moment().format('YYYY-MM-DD'),
      value: 0,
    })
      .then((view) => {
        view = _.head(view);
        return view.updateAttributes({
          value: view.value + 1,
        });
      });
  };
};
