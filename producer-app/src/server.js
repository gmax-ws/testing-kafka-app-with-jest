/** @module Server */
const extractValuesFromBody = (body, keys) => {
  const keyCheck = keys.filter((key) => {
    return Object.prototype.hasOwnProperty.call(body, key) && !(typeof (body[key]) === 'undefined');
  });
  if (keyCheck.length !== keys.length) {
    throw new Error(`${keys.filter(item => !keyCheck.includes(item))} values not present in body`);
  }
  return body;
};

/**
* Endpoint to admit a patient
*
* @param {Object} req - Body should contain name, nhsNumber, admittingWard, admissionDate
* @param {Object} res - Restify Response Object
* @param {function} next - function to call after response
*/
const admit = (req, res, next) => {
  try {
    const {
      name,
      nhsNumber,
      admittingWard,
      admissionDate
    } = extractValuesFromBody(req.body, ['name', 'nhsNumber', 'admittingWard', 'admissionDate']);
    console.log(`admitting ${name}:${nhsNumber} to ${admittingWard} on ${admissionDate}`);
    res.send(201);
    return next();
  } catch (err) {
    res.send(400, { error: err.message });
    return false;
  }
};

/**
 * Endpoint to discharge a patient
 *
 * @param {Object} req - Body should contain name, dischargeDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 */
const discharge = (req, res, next) => {
  try {
    const {
      nhsNumber,
      dischargeDate
    } = extractValuesFromBody(req.body, ['nhsNumber', 'dischargeDate']);
    console.log(`Discharging ${nhsNumber} on ${dischargeDate}`);
    res.send(202);
    return next();
  } catch (err) {
    res.send(400, { error: err.message });
    return false;
  }
};

/**
 * Endpoint to transfer a patient
 *
 * @param {Object} req - Body should contain nhsNumber, fromWard, toWard, transferDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 */
const transfer = (req, res, next) => {
  try {
    const {
      nhsNumber,
      fromWard,
      toWard,
      transferDate
    } = extractValuesFromBody(req.body, ['nhsNumber', 'fromWard', 'toWard', 'transferDate']);
    console.log(`Transferring ${nhsNumber} from ${fromWard} to ${toWard} on ${transferDate}`);
    res.send(200);
    return next();
  } catch (err) {
    res.send(400, { error: err.message });
    return false;
  }
};

export {
  admit,
  discharge,
  transfer
};
