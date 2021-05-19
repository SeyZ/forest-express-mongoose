const ResourcesGetter = require('./resources-getter');
const HasManyGetter = require('./has-many-getter');

const BATCH_INITIAL_PAGE = 1;
const BATCH_SIZE = 1000;

class ResourcesExporter {
  constructor(model, options, params, association) {
    this._model = model;
    this._options = options;
    this._params = params;
    this._association = association;

    this._params.sort = '_id';
    this._params.page = { size: BATCH_SIZE };
  }

  _getter() {
    if (this._association) {
      return new HasManyGetter(this._model, this._association, this._options, this._params);
    }
    return new ResourcesGetter(this._model, this._options, this._params);
  }

  async _retrieveBatch(dataSender, pageNumber) {
    this._params.page.number = pageNumber;

    const results = await this._getter().perform();
    const records = results[0];
    await dataSender(records);

    if (records.length === BATCH_SIZE) {
      return this._retrieveBatch(dataSender, pageNumber + 1);
    }

    return null;
  }

  perform(dataSender) {
    return this._retrieveBatch(dataSender, BATCH_INITIAL_PAGE);
  }
}

module.exports = ResourcesExporter;
