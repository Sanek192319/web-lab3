<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";

  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": "secretkey",
    };
    const httpLink = new HttpLink({
      uri: "https://myweblab3.herokuapp.com/v1/graphql",
      headers,
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: "wss://myweblab3.herokuapp.com/v1/graphql",
      options: {
        reconnect: true,
        connectionParams: {
          headers,
        },
      },
    });
    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );
    return new ApolloClient({
      link,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);
  const students = subscribe(OperationDocsStore.subscribeToAll());

  const addstudent = async () => {
    const name = prompt("name") || "";
    await http.startExecuteMyMutation(OperationDocsStore.addOne(name));
  };

  const deletestudent = async () => {
    const name = prompt("which student to delete?") || "";
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
    }
  };
</script>

<main>
  {#if $students.loading}
    <h1>Loading...</h1>
  {:else if $students.error}
    <h1>{$students.error}</h1>
  {:else}
    <button on:click={addstudent}>Add new student</button>
    <button on:click={deletestudent}>Delete student</button>

    {#each $students.data.students as student}
      <div>
        <p>Student name: {student.name}</p>
        <p>Teacher id: {student.teacher_id}</p>
        <hr />
      </div>
    {/each}
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>
