const request = require('superagent');
const { setupMutualTLS } = require('../certs-util');
const log = require('debug')('log');
const debug = require('debug')('debug');

const buildAccountRequestData = () => ({
  Data: {
    Permissions: [
      'ReadAccountsDetail',
      'ReadBalances',
      'ReadBeneficiariesDetail',
      'ReadDirectDebits',
      'ReadProducts',
      'ReadStandingOrdersDetail',
      'ReadTransactionsCredits',
      'ReadTransactionsDebits',
      'ReadTransactionsDetail',
    ],
    // ExpirationDateTime: // not populated - the permissions will be open ended
    // TransactionFromDateTime: // not populated - request from the earliest available transaction
    // TransactionToDateTime: // not populated - request to the latest available transactions
  },
  Risk: {},
});

/*
 * For now only support Client Credentials Grant Type (OAuth 2.0).
 * @resourceServerPath e.g. http://example.com/open-banking/v1.1
 */
const postAccountRequests = async (resourceServerPath, accessToken,
  fapiFinancialId) => {
  try {
    const body = buildAccountRequestData();
    const accountRequestsUri = `${resourceServerPath}/open-banking/v1.1/account-requests`;
    log(`POST to ${accountRequestsUri}`);
    const response = await setupMutualTLS(request.post(accountRequestsUri))
      .set('authorization', `Bearer ${accessToken}`)
      .set('content-type', 'application/json; charset=utf-8')
      .set('accept', 'application/json; charset=utf-8')
      .set('x-fapi-financial-id', fapiFinancialId)
      .send(body);
    debug(`${response.status} response for ${accountRequestsUri}`);
    return response.body;
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.response ? err.response.status : 500;
    throw error;
  }
};

const deleteAccountRequest = async (
  resourceServerPath,
  accessToken,
  fapiFinancialId,
  accountRequestId,
  fapiInteractionId,
) => {
  try {
    const accountRequestDeleteUri = `${resourceServerPath}/open-banking/v1.1/account-requests/${accountRequestId}`;
    log(`DELETE to ${accountRequestDeleteUri}`);
    const response = await setupMutualTLS(request.del(accountRequestDeleteUri))
      .set('authorization', `Bearer ${accessToken}`)
      .set('content-type', 'application/json; charset=utf-8')
      .set('accept', 'application/json; charset=utf-8')
      .set('x-fapi-financial-id', fapiFinancialId)
      .set('x-fapi-interaction-id', fapiInteractionId)
      .send();
    debug(`${response.status} response for ${accountRequestDeleteUri}`);
    if (response.status.toString() === '204') {
      return response.headers;
    }
    const error = new Error('Bad Request');
    error.status = 400;
    throw error;
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.response ? err.response.status : 400;
    throw error;
  }
};


exports.buildAccountRequestData = buildAccountRequestData;
exports.postAccountRequests = postAccountRequests;
exports.deleteAccountRequest = deleteAccountRequest;
