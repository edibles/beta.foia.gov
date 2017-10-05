// Action types to identify an action
export const types = {
  AGENCY_FINDER_DATA_FETCH: 'AGENCY_FINDER_DATA_FETCH',
  AGENCY_FINDER_DATA_RECEIVE: 'AGENCY_FINDER_DATA_RECEIVE',
  REQUEST_AGENCY_CHANGE: 'REQUEST_AGENCY_CHANGE',
  REQUEST_AGENCY_FETCH: 'REQUEST_AGENCY_FETCH',
  REQUEST_RECEIVE_AGENCY: 'REQUEST_RECEIVE_AGENCY',
};

// Action creators, to dispatch actions
export function RequestActions({ dispatcher, api, jsonapi }) {
  return {
    fetchAgencyFinderData() {
      dispatcher.dispatch({
        type: types.AGENCY_FINDER_DATA_FETCH,
      });

      return jsonapi.params()
        .include('agency')
        .fields('agency', ['name', 'abbreviation'])
        .fields('agency_component', ['title', 'abbreviation', 'agency'])
        .limit(500) // TODO fetch over multiple requests
        .get('/agency_components');
    },

    receiveAgencyFinderData(agencyComponents) {
      dispatcher.dispatch({
        type: types.AGENCY_FINDER_DATA_RECEIVE,
        agencyComponents,
      });

      return Promise.resolve(agencyComponents);
    },

    agencyChange(agency) {
      dispatcher.dispatch({
        type: types.REQUEST_AGENCY_CHANGE,
        agency,
      });

      return Promise.resolve(agency);
    },

    fetchAgency(agencyId) {
      dispatcher.dispatch({
        type: types.REQUEST_AGENCY_FETCH,
        agencyId,
      });

      if (!agencyId) {
        return Promise.reject(new Error('You must provide an agencyId to fetch.'));
      }

      // TODO this should be in a fetch action, results cached
      return api.get(`/agencies/${agencyId}.json`);
    },

    receiveAgency(agency) {
      dispatcher.dispatch({
        type: types.REQUEST_RECEIVE_AGENCY,
        agency,
      });

      return Promise.resolve(agency);
    },
  };
}
