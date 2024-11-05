


export default function Loader({ fadeOut }) {
  return (
    <center className={`content ${fadeOut ? "fade-out" : "fade-in"}`}>
      <h1 className="App-header">
        SCHEDULING ALGORITHM CALCULATOR <br />
        <br />
        <l-grid size="70" speed="1.5" color="white"></l-grid>
      </h1>
    </center>
  );
}
