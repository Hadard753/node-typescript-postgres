import * as request from 'request';

import * as responses from './responses';
import config from '../config';

class ApiController {
  addLeadToCRM(lead) {
    console.log(lead);
    var url = config.CRM_API;
    var headers = { 
        'Api-Token': config.CRM_TOKEN,
        'Content-Type' : 'application/json' 
    };
    return new Promise((resolve, reject) => request.post({ url: url, body: JSON.stringify(lead), headers: headers }, 
      (e, r, body) => {
        console.log('error:', e); // Print the error if one occurred
        console.log('statusCode:', r && r.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        if(e)
          return reject(responses.getErrorResponse(e));
        return resolve(responses.getOkayResponse(body));
    }));
  }
}

export default new ApiController();
