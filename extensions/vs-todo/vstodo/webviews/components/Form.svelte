<script lang="ts">
  export let accessToken: any;
  export let todos: any[];
  let text = "";
</script>

<form
  on:submit|preventDefault={async () => {
    const response = await fetch(`${apiBaseUrl}/todo`, {
      method: "POST",
      body: JSON.stringify({
        title: text,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { todo } = await response.json();
    todos = [todo, ...todos];
    text = "";
  }}
>
  <h1>Add Todo</h1>
  <input type="text" bind:value={text} placeholder="Enter Todo Title" />
</form>
