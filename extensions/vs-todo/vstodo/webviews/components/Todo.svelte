<script lang="ts">
  export let todo: any;
  export let accessToken: any;
</script>

<div
  class={`todo ${todo.completed ? "todo--completed" : ""}`}
  on:click={async () => {
    todo.completed = !todo.completed;
    const response = await fetch(`${apiBaseUrl}/todo`, {
      method: "PUT",
      body: JSON.stringify({
        id: todo.id,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(await response.json());
  }}
>
  <h3>{todo.title}</h3>
  <p>{todo.completed ? "completed" : "pending"}</p>
</div>

<style>
  .todo {
    bottom: 1px solid lightgray;
    cursor: pointer;
    width: 100%;
    padding: 3px;
  }
  .todo--completed > h3 {
    text-decoration: line-through;
  }
  p {
    color: gray;
  }
</style>
