import React from "react";
import "./App.css";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Map from "./components/WingsMap";


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      background: "#DDDDDD"
    },
    wingsPaper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        elevation: 3
    }
  }));

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

                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default App;
