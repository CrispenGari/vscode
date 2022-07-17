<script>
  export let user;
  export let logout;
</script>

<div class="user">
  <h1>Github Profile</h1>
  <img src={user.photoURL} alt={user.username} />
  <h2>{user.username}</h2>
  <p>{user.bio}</p>
  <button
    on:click={() => {
      logout();
    }}>logout</button
  >
</div>

<style>
  .user {
    padding-bottom: 10px;
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h1 {
    margin-bottom: 5px;
    padding-bottom: 5px;
    width: 100%;
    border-bottom: 1px solid cornflowerblue;
  }
  h2 {
    padding: 5px 0;
    text-transform: uppercase;
  }
  p {
    margin-bottom: 5px;
  }
  img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
  button {
    margin: 5px 0;
  }
</style>
