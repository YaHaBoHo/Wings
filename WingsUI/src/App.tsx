import React, { Component } from "react";
import "./App.css";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Map from "./components/WingsMap";
import { Altimeter, VerticalSpeed, Attitute } from "./components/WingsInstruments"


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      background: "#DDDDDD"
    },
    wingsPaper: {
        textAlign: "center",
        color: theme.palette.text.secondary,
        elevation: 3
    }
  }));


type PanelState = {
        ready: boolean,
        status: string,
        altitude: number,
        vspeed: number,
        pitch: number,
        roll: number
}

class Panel extends Component<{},PanelState> {

    ticker : any = -1;

    apiUrl : string = "api/instruments"

    constructor(props: {}) {
        super(props);
        this.state = {
            ready: false,
            status: "Initializing.",
            altitude: 0,
            vspeed: 0,
            pitch: 0,
            roll: 0
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
                            altitude: result.data.altitude,
                            vspeed: result.data.vspeed,
                            pitch: result.data.pitch,
                            roll: result.data.roll
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
        return(
            <div>
                <Attitute roll={this.state.roll} pitch={this.state.pitch} />
                <Altimeter altitude={this.state.altitude} />
                <VerticalSpeed vspeed={this.state.vspeed} />
            </div>
        )
    }
}

function App() {

    const classes = useStyles();

    return (
        <div className="App">
            <Grid container className={classes.root} spacing={1}>
                <Grid item xs={10} id="mapGrid">
                    <Paper className={classes.wingsPaper}>
                        <Map />
                    </Paper>
                </Grid>
                <Grid item xs={2} id="infoGrid">
                    <Paper className={classes.wingsPaper}>
                        <Panel/>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default App;
