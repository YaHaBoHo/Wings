import React, { Component } from "react";
import L, { LatLngExpression, Point, Icon } from "leaflet";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import { WingsMarker } from './WingsMarker'
import "leaflet/dist/leaflet.css";

const mapAttribution : string = "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors";
const mapUrl : string = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";


type MapState = {
    ready: boolean,
    status: string,
    position: LatLngExpression,
    heading: number,
    zoom: number
}


export default class Map extends Component<{}, MapState> {

    ticker : any = -1;

    apiUrl : string = "api/position"

    constructor(props: {}) {
        super(props);
        this.state = {
            ready: false,
            status: "Initializing.",
            position: [43.906302767815696, 4.900079185615071],
            heading: 0,
            zoom: 12
        };
    }

    tick() {

        fetch(this.apiUrl)
            .then(res => res.json())
            .then(
                // API call succeeded
                (result) => {
                    if (result.success) {
                        this.setState({ 
                            ready: true, 
                            status: "Ready",
                            position: [result.data.latitude, result.data.longitude],
                            heading: result.data.heading
                        });
                    } 
                    else {
                        this.setState({ ready: false, status: `Not ready | Backend error  | ${result.message}` });
                    }
                },
                // API call failed
                (error) => {
                    this.setState({
                        ready: false,
                        status: `Not ready | API error | ${error}.`
                    });
            }
        )
    }

    componentDidMount() {
        this.ticker = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.ticker);
    }

    render() {
        return (
            <MapContainer center={this.state.position} zoom={this.state.zoom} scrollWheelZoom={false}>
                <TileLayer attribution={mapAttribution} url={mapUrl} />
                <WingsMarker position={this.state.position} rotation={this.state.heading} track={true}/>
            </MapContainer>
        )
    }

}
