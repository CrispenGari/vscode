<script lang="ts">
  import Todo from "./Todo.svelte";

  export let todos: any[];
  export let accessToken: any;
</script>

<div class="todos">
  <h1>Your Todos</h1>
  <div class="todos__container">
    {#each todos as todo (todo.id)}
      <Todo {todo} {accessToken} />
    {/each}
  </div>
</div>
