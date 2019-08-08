

module.exports = function (Model) {
  function applyFilter(ctx) {
    ctx.args.filter = ctx.args.filter || {};
    ctx.args.filter.where = ctx.args.filter.where || {};
    if (Model.modelName === Customer.modelName) {
      ctx.args.filter.where.id = ctx.req.accessToken.userId;
    } else {
      ctx.args.filter.where.customerId = ctx.req.accessToken.userId;
    }
    return Promise.resolve();
  }
  Model.beforeRemote('findOne', applyFilter);
  Model.beforeRemote('find', applyFilter);
};
