import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMapGL from "react-map-gl";
import turfLength from "@turf/length";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

const Map = ({ accessToken }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 54.687157,
    longitude: 25.279652,
    zoom: 12,
  });
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  useEffect(() => {
    if (isLoaded) {
      const map = mapRef.current.getMap();
      map.getSource("geojson").setData(state.geojson);
      console.log("===STORE", state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const _onLoad = () => {
    const map = mapRef.current.getMap();

    map.addSource("geojson", {
      type: "geojson",
      data: state.geojson,
    });

    map.addLayer({
      id: "measure-points",
      type: "circle",
      source: "geojson",
      paint: {
        "circle-radius": 5,
        "circle-color": "#000",
      },
      filter: ["in", "$type", "Point"],
    });

    map.addLayer({
      id: "measure-lines",
      type: "line",
      source: "geojson",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#000",
        "line-width": 2.5,
      },
      filter: ["in", "$type", "LineString"],
    });

    setIsLoaded(true);
  };

  const _onClick = (e) => {
    const map = mapRef.current.getMap();
    const geojson = JSON.parse(JSON.stringify(state.geojson));
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["measure-points"],
    });
    // Used to draw a line between points
    const linestring = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    };

    // Remove the linestring from the group
    // So we can redraw it based on the points collection
    if (geojson.features.length > 1) geojson.features.pop();

    // If a feature was clicked, remove it from the map
    if (features.length) {
      const id = features[0].properties.id;
      geojson.features = geojson.features.filter(
        (point) => point.properties.id !== id
      );
    } else {
      const point = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [e.lngLat[0], e.lngLat[1]],
        },
        properties: {
          id: String(new Date().getTime()),
        },
      };

      geojson.features.push(point);
    }

    if (geojson.features.length > 1) {
      linestring.geometry.coordinates = geojson.features.map(
        (point) => point.geometry.coordinates
      );

      geojson.features.push(linestring);
    }

    const totalDistance = turfLength(linestring);
    updateStoreData({ geojson, totalDistance });
  };

  const updateStoreData = (data) => {
    dispatch({
      type: "UPDATE_DATA",
      payload: data,
    });
  };

  const getTotalDistance = () => {
    //Convert total distance to meters
    return (state.totalDistance * 1000).toLocaleString() + "m";
  };

  return (
    <div className="map">
      <div className="map__distance">Total distance {getTotalDistance()}</div>
      <div className="map__container">
        <ReactMapGL
          ref={mapRef}
          {...viewport}
          width="100vw"
          height="100vh"
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onViewportChange={(nextViewport) => setViewport(nextViewport)}
          onClick={_onClick}
          onLoad={_onLoad}
          mapboxApiAccessToken={accessToken}
        />
      </div>
    </div>
  );
};

export default Map;
