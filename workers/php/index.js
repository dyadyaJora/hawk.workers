const { Worker } = require('../../lib/worker');
const db = require('../../db/mongoose-controller');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.', '.env') });

/**
 * Worker for parsing and saving PHP errors
 *
 * @class PhpWorker
 * @extends {Worker}
 */
class PhpWorker extends Worker {

  /**
   * Message handle function
   *
   * @override
   * @param {Object} msg Message object from consume method
   * @param {Buffer} msg.content Message content
   * @memberof PhpWorker
   */
  async handle(msg) {
    let phpError;

    if (msg && msg.content) {
      try {
        phpError = JSON.parse(msg.content.toString());
      } catch (err) {
        phpError = null;
      }

      if (phpError === null) 
        return;

      let data = this._parseData(phpError);

      this._saveToDataBase(data);
    }
  }

  /**
   * Start consuming messages and connect to db
   *
   * @memberof Worker
   */
  async start() {
    super.start();

    db.connect(process.env.DB_CONNECT_URL);
  }

  /**
   * Saving to DB function
   *
   * @param {Object} obj - Object to save
   */
  _saveToDataBase(obj) {
    db.saveEvent(obj);
  }

  /**
   * Parse php error from hawk.catcher format 
   * to new universal format
   *
   * @param {Object} obj - Object to parse
   * @returns {Obect}
   */
  _parseData(obj) {
    return obj;
  }
}


module.exports = { PhpWorker };