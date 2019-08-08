const isEmail = require('isemail');
const _ = require('lodash');
const moment = require('moment');

module.exports = function (Contact) {
  Contact.setup = function () {
    const ContactModel = this;
    ContactModel.validatesFormatOf('mobile', {
      with: /^[6789]\d{9}$/,
      message: 'is not valid mobile number',
    });
    function customEmailValid(error) {
      if (!_.isEmpty(this.email) && !isEmail.validate(this.email)) {
        error();
      }
    }
    ContactModel.validate('email', customEmailValid, {
      message: 'provide a valid email',
    });
  };
  Contact.setup();

  Contact.observe('before save', async (ctx) => {
    if (ctx.isNewInstance && ctx.instance) {
      ctx.instance.customerId = ctx.options.accessToken.userId;
    }
    return Promise.resolve();
  });

  Contact.getFilename = function (file) {
    let ext = '.jpg';
    switch (file.type) {
      case 'image/jpeg':
      case 'image/jpg':
        ext = '.jpg';
        break;
      case 'image/png':
        ext = '.png';
        break;
      default:
        ext = '.jpg';
    }
    return Date.now() + ext;
  };

  Contact.allowedContentTypes = function () {
    return ['image/jpg', 'image/jpeg', 'image/png'];
  };

  Contact.getFileBucket = function () {
    return Contact.app.get('filesystem').container;
  };

  Contact.prototype.uploadPicture = function (ctx) {
    const options = {
      getFilename: Contact.getFilename,
      allowedContentTypes: Contact.allowedContentTypes,
      maxFileSize: 500 * 1024,
      uploadableId: this.id,
      uploadableType: Contact.modelName,
      customScope: 'profile',
    };
    return new Promise((resolve, reject) => {
      this.uploadImage(ctx, options, async (error, data) => {
        if (error) {
          reject(error);
        }
        const customerProfile = await FileStorage.find({
          where: {
            uploadableId: this.id,
            uploadableType: Contact.modelName,
            customScope: options.customScope,
            id: {
              neq: data.id,
            },
          },
        });
        await Promise.mapSeries(customerProfile, async (profile) => {
          try {
            await Promise.all([
              FileContainer.removeFile(Contact.getFileBucket(), profile.name),
              FileStorage.deleteById(profile.id),
            ]);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err.message);
          }
          return Promise.resolve();
        });
        resolve(data);
      });
    });
  };

  Contact.remoteMethod('prototype.uploadPicture', {
    description: 'Uploads customer profile picture.',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    returns: {
      arg: 'response', type: 'object', root: true,
    },
    http: { verb: 'post' },
  });

  Contact.prototype.uploadImage = function (ctx, options, callback) {
    const self = this;
    const container = Contact.getFileBucket();
    FileContainer.upload(container, ctx.req, ctx.res, options, async (error, fileObject) => {
      if (error) {
        return callback(new Error('Error in uploading the file.'));
      }
      const fileInfo = fileObject.files.file[0];
      const baseUrl = Contact.app.get('url').replace(/\/$/, '');
      const fileDetails = await FileStorage.create({
        name: fileInfo.name,
        originalName: fileInfo.originalFilename,
        mime: fileInfo.type,
        url: _.join([baseUrl, container, fileInfo.name], '/'),
        uploadableId: self.id,
        uploadableType: Contact.modelName,
        customScope: 'profile',
      });
      return callback(null, fileDetails);
    });
  };

  Contact.prototype.updateView = function () {
    return ContactView.updateView({
      customerId: this.customerId,
      contactId: this.id,
      date: moment().format('YYYY-MM-DD'),
    });
  };

  Contact.remoteMethod('prototype.updateView', {
    description: 'update the view counter for a contact',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    returns: {
      arg: 'response', type: 'object', root: true,
    },
    http: { verb: 'post' },
  });
};
