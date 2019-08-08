const _ = require('lodash');

module.exports = function (app) {
  _.each(app.models, (model) => {
    model.defineProperty('createdOn', {
      type: 'date',
      required: false,
    });

    model.defineProperty('updatedOn', {
      type: 'date',
      required: false,
    });

    model.observe('before save', async (ctx) => {
      if (ctx.isNewInstance) {
        ctx.instance.createdOn = new Date();
        ctx.instance.updatedOn = new Date();
      } else if (ctx.instance) {
        const modelInstance = await ctx.Model.findById(ctx.instance.id);
        ctx.instance.createdOn = modelInstance.createdOn ? modelInstance.createdOn : new Date();
        ctx.instance.updatedOn = new Date();
      } else {
        ctx.data.updatedOn = new Date();
      }
      return Promise.resolve();
    });
  });
};
