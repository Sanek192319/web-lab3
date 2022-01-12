<script>
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { requestCounter, error } from "./store";
  let online;
  const studentInfo = {};
  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": ADMIN_SECRET,
    };
    const httpLink = new HttpLink({
      uri: HTTP_LINK,
      headers,
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: WS_LINK,
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
    try {
      const { name } = studentInfo;
      await http.startExecuteMyMutation(OperationDocsStore.addOne(name));
    } catch (e) {
      error.set(e.message);
    }
  };

  const deletestudent = async (id) => {
    try {
      await http.startExecuteMyMutation(OperationDocsStore.deleteById(id));
    } catch (e) {
      error.set(e.message);
    }
  };
</script>

<svelte:window bind:online />
<main>
  {#if !online}
    <h1>Offline</h1>
  {:else if $students.loading || $requestCounter}
    <h1>Loading...</h1>
  {:else if $students.error || $error}
    <h1>{$students.error ?? $error}</h1>
  {:else}
    <input placeholder="Enter name" bind:value={studentInfo.name} />
    <button on:click={addstudent}>Add new student</button>

    {#each $students.data.students as student (student.id)}
      <div>
        <p>Student name: {student.name}</p>
        <p>Teacher id: {student.teacher_id}</p>
        <button on:click={() => deletestudent(student.id)}
          >Delete student</button
        >
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
