import { error, requestCounter } from "./store";
class RequestHelper {
  constructor() {
    this.API_URL = HTTP_LINK;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    try {
      const result = await fetch(this.API_URL, {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName,
        }),
        headers: {
          "x-hasura-admin-secret": ADMIN_SECRET,
        },
      });

      return result.json();
    } catch (e) {
      requestCounter.update((n) => n - 1);
      error.set("Error in sending request");
    }
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      throw new Error(errors[0].message);
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.executeMyMutation(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      throw new Error(errors[0].message);
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }
}

export default new RequestHelper();
