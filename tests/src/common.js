/** @module common */
import 'isomorphic-fetch';
import { v4 as uuid4 } from 'uuid';
import { config } from './config';

/**
 * Sleep for the specified number of seconds
 *
 * @param {number} seconds - Number of seconds to sleep for
 * @returns {Promise}
 */
export const sleep = async (seconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, (seconds * 1000));
  });
};

/**
 * Attempt to fetch the defined resource and if it's unavailable then retry the defined number of
 * times
 *
 * @param {String} url - URL to attempt
 * @param {Object} options - Options to pass to fetch
 * @param {number} attempts - Number of attempts to make before giving up
 * @returns {Promise<*>} - If successful returns Object from URL
 */
export const eventualApiEntry = async (url, options, attempts = 5) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Invalid response received');
  } catch (err) {
    if (attempts === 1) {
      throw err;
    }
    await sleep(1);
    await eventualApiEntry(url, options, attempts - 1);
  }
};

/**
 * Attempt to find the record with the defined value (needle) within the Array of records (haystack)
 * using the filterFunction provided over the specified number of attempts
 *
 * @param {Object[]} haystack - Array of records
 * @param {String|number} needle - Value used to identify the record
 * @param {function} filterFunction - Function used to filter out the required record
 * @param {number} attempts - Number of attempts to find the record
 * @returns {Promise<*>}
 */
export const eventualQueueMember = async (haystack, needle, filterFunction, attempts = 5) => {
  console.log(`eventualQueueMember - haystack: ${JSON.stringify(haystack)} using ${filterFunction.name}`);
  const hits = filterFunction(haystack, needle);
  if (hits.length > 0) {
    return hits[0];
  }
  if (attempts === 1) {
    throw new Error(`Failed to get ${needle} in queue`);
  }
  await sleep(1);
  return eventualQueueMember(haystack, needle, filterFunction, attempts - 1);
};

export const formatDate = (date) => {
  return date.getFullYear() + '-'
    + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
    + ('0' + date.getDate()).slice(-2) + 'T'
    + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':'
    + ('0' + date.getSeconds()).slice(-2) + '.000Z';
};

/**
 * Admit patient by sending admission details to the Producer App's /admit endpoint
 *
 * @param {string} nhsNumber - NHS Number for the Patient
 * @param {string} wardCode - Code for the ward to admit patient to
 * @param {string} name - Name of the new patient
 * @param {Date} admitDate - Admission Date for the patient
 * @returns {Promise<void>}
 */
export const admitPatient = async (nhsNumber, wardCode, name = uuid4(), admitDate = new Date()) => {
  const dataToSend = {
    name,
    nhsNumber,
    admittingWard: wardCode,
    admissionDate: formatDate(admitDate)
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(dataToSend),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const admitUrl = `${config.producerApp.api.host}/admit`;
  const response = await fetch(admitUrl, options);
  if (!response.ok) {
    throw new Error(`Error Admitting Patient: ${response.statusText}`);
  }
};

/**
 * Discharge patient by sending discharge details to the Producer App's /discharge endpoint
 *
 * @param {String} nhsNumber -NHS Number for the patient
 * @param {Date} dischargeDate - Discharge Date for the patient
 * @returns {Promise<void>}
 */
export const dischargePatient = async (nhsNumber, dischargeDate = new Date()) => {
  const dataToSend = {
    nhsNumber,
    dischargeDate: formatDate(dischargeDate)
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  };
  const dischargeUrl = `${config.producerApp.api.host}/discharge`;
  const response = await fetch(dischargeUrl, options);
  if (!response.ok) {
    throw new Error(`Error discharging Patient: ${response.statusText}`);
  }
};

/**
 * Transfer patient by sending transfer details to the Producer App's /transfer endpoint
 *
 * @param {String} nhsNumber - NHS Number of the patient
 * @param {String} fromWardCode - Code for the ward being transferred from
 * @param {String} toWardCode - Code for the ward being transferred to
 * @param {Date} tDate - Transfer date for the patient
 * @returns {Promise<void>}
 */
export const transferPatient = async (nhsNumber, fromWardCode, toWardCode, tDate = new Date()) => {
  const dataToSend = {
    nhsNumber,
    fromWard: fromWardCode,
    toWard: toWardCode,
    transferDate: formatDate(tDate)
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(dataToSend),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const transferUrl = `${config.producerApp.api.host}/transfer`;
  const response = await fetch(transferUrl, options);
  if (!response.ok) {
    throw new Error(`Error transferring Patient: ${response.statusText}`);
  }
};

/**
 * Find the Patient's admit message that's sent from the Producer App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out admit messages for the patient
 */
export const findOutboundAdmitMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isAdmit = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Admit');
    if (isAdmit && message.body['com.colinwren.Admit'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
 * Find the Patient's discharge message that's sent from the Producer App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out discharge messages for the patient
 */
export const findOutboundDischargeMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isDischarge = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Discharge');
    if (isDischarge && message.body['com.colinwren.Discharge'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
* Find the Patient's transfer message that's sent from the Producer App
*
* @param {Object[]} messages - Array of message object
* @param {string} nhsNumber - NHS Number for the patient
* @returns {Object[]} - Array of filtered out transfer messages for the patient
*/
export const findOutboundTransferMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isTransfer = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Transfer');
    if (isTransfer && message.body['com.colinwren.Transfer'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
 * Find the Patient's admit message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out admit messages for the patient
 */
export const findInboundAdmitMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'admit' && message.nhsNumber === nhsNumber);
};

/**
 * Find the Patient's discharge message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out discharge messages for the patient
 */
export const findInboundDischargeMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'discharge' && message.nhsNumber === nhsNumber);
};

/**
 * Find the Patient's transfer message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out transfer messages for the patient
 */
export const findInboundTransferMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'transfer' && message.nhsNumber === nhsNumber);
};

/**
 * Get the second Transfer message (as admit triggers a transfer message we need to not return
 * this message(
 *
 * @param {Object[]} messages - Array of message objects
 * @param {string} nhsNumber - NHS Number of the patient
 * @returns {Object[]} - Array of filtered out transfer messages for the patient
 */
export const findSecondInboundTransferMessage = (messages, nhsNumber) => {
  const allMessages = messages.filter((message) => message.type === 'transfer' && message.nhsNumber === nhsNumber);
  if (allMessages.length === 2) {
    return [allMessages[1]];
  }
  return [];
};
