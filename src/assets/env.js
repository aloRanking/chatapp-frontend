(function (window) {
  window.__env = window.__env || {};
  window.__env.graphqlEndpoint = '${GRAPHQL_ENDPOINT}';
  window.__env.region = '${AWS_REGION}';
  window.__env.userPoolId = '${USER_POOL_ID}';
  window.__env.userPoolClientId = '${USER_POOL_CLIENT_ID}';
  window.__env.env = '${ENV}';
})(this);