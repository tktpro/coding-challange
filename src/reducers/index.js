const initialState = {
  geojson: {
    type: "FeatureCollection",
    features: [],
  },
  totalDistance: 0,
};
const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case "UPDATE_DATA":
      return {
        ...state,
        geojson: payload.geojson,
        totalDistance: payload.totalDistance,
      };
    default:
      return state;
  }
};

export default reducer;
