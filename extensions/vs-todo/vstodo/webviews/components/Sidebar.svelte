<script lang="ts">
  import { onMount } from "svelte";
  import Form from "./Form.svelte";
  import Todo from "./Todo.svelte";
  import Todos from "./Todos.svelte";
  import UserCard from "./UserCard.svelte";

  let todos: any[] = [];
  let loading: boolean = true;
  let user: any = null;
  let accessToken = "";

  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;

      switch (message.type) {
        case "token": {
          accessToken = message.value;

          const response = await fetch(`${apiBaseUrl}/user`, {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          user = data.user;
          if (user) {
            const res = await fetch(`${apiBaseUrl}/todo`, {
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            });
            const payload = await res.json();
            todos = payload.todos;
            console.log(todos);
          }
          loading = false;
          break;
        }
        case "new-todo":
          const response = await fetch(`${apiBaseUrl}/todo`, {
            method: "POST",
            body: JSON.stringify({
              title: message.value,
            }),
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          });
          const { todo } = await response.json();
          todos = [todo, ...todos];
          break;
      }
    });

    await tsvscode.postMessage({ type: "get-token", value: undefined });
  });

  const logout = () => {
    tsvscode.postMessage({ type: "logout", value: undefined });
    user = null;
    accessToken = "";
  };
</script>

<div class="app">
  {#if loading}
    <div>loading....</div>
  {:else}
    <div>
      {#if user}
        <UserCard {user} {logout} />
        <Form {accessToken} bind:todos />
        <Todos bind:todos {accessToken} />
      {:else}
        <button
          on:click={() => {
            tsvscode.postMessage({ type: "authenticate", value: undefined });
          }}>Login With Github</button
        >
      {/if}
    </div>
  {/if}
</div>

<style>
  .app {
    padding-top: 50px;
  }
</style>
