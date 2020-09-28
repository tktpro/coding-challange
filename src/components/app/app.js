import React from "react";
import Map from "../map";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGt0cHJvIiwiYSI6ImNrZmZvajdsdjBnb2oydXF2ZWczdWtkcmcifQ.tEbR37Ll3gbFjX0sub43Yg";

function App() {
  return (
    <div className="app">
      <Map accessToken={MAPBOX_TOKEN} />
    </div>
  );
}

export default App;
