using Microsoft.Extensions.Logging;
using Microsoft.FlightSimulator.SimConnect;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace Wings {

    // Implemented as a Singleton
    // See https://www.c-sharpcorner.com/UploadFile/8911c4/singleton-design-pattern-in-C-Sharp/
    public sealed class SimConnectClient {


        #region Singleton
        private SimConnectClient() { 
            logger = Program.loggerFactory.CreateLogger<SimConnectClient>();
            ticker = new Task(() => {
                while (running) {
                    Poll();
                    Thread.Sleep(TICK_RATE);
                }
            });
        }
        private static readonly Lazy<SimConnectClient> lazy = new Lazy<SimConnectClient>(() => new SimConnectClient());
        public static SimConnectClient Instance { get { return lazy.Value; } }
        #endregion


        #region Constants
        // User-defined event code
        private const int USER_EVENT_CODE = 0x0402;
        private const uint USER_OBJECT_ID = 0;
        private const uint REQUEST_ORIGIN = 0;
        private const uint REQUEST_INTERVAL = 0;
        private const uint REQUEST_LIMIT = 0;
        private const int TICK_RATE = 1000;
        #endregion


        #region Internals
        // Logger
        private readonly ILogger logger;
        // Simconnect Client
        private SimConnect api;
        // Lifecycle
        public bool ready { get { return api != null; } }
        private bool running = false;
        private Task ticker;
        // SimConnect data : User position
        private UserStatus userStatus;
        #endregion


        #region PublicData

        public Dictionary<string, double> GetUserGps() {
            return new Dictionary<string, double> {
                {"latitude", userStatus.latitude},
                {"longitude", userStatus.longitude},
                {"heading", userStatus.heading}
            };
        }
        public Dictionary<string, double> GetUserInstruments() {
            return new Dictionary<string, double> {
                {"altitude", userStatus.altitude},
                {"vspeed", userStatus.vspeed},
                {"pitch", userStatus.pitch},
                {"roll", userStatus.roll}
            };
        }

        #endregion


        #region SimConnect API

        public void Connect() {
            try {
                // Create client
                logger.LogDebug("Connecting to Flight Simulator...");
                api = new SimConnect(
                   "SimConnectZero",   // Client name
                   (IntPtr)0,          // Window handle
                   USER_EVENT_CODE,    // User-defined event code
                   null,               // User-defined event handle
                   0                   // Configuration index in SimConnect.cfg
                );
                // Register event callbacks
                api.OnRecvException += new SimConnect.RecvExceptionEventHandler(HandleException);
                api.OnRecvOpen += new SimConnect.RecvOpenEventHandler(HandleOpen);
                api.OnRecvQuit += new SimConnect.RecvQuitEventHandler(HandleQuit);
                api.OnRecvSimobjectData += new SimConnect.RecvSimobjectDataEventHandler(HandleSimobjectData);
                logger.LogInformation("Connected to Flight Simulator.");
            }
            catch (COMException) {
                logger.LogInformation("Waiting for Flight Simulator...");
            }
        }

        public void Disconnect() {
            logger.LogInformation("Cleaning up SimConnect client...");
            // Destroy client
            if (api != null) {
                // Try cleaning up before disposing client
                try {
                    api.ClearDataDefinition(DATA_DEFINITON_ID.UserPosition);
                    logger.LogDebug("Cleaned up client data definitions.");
                }
                catch {
                    logger.LogWarning("Unable to clean up data definitions. Skipping to client disposal.");
                }
                // Dispose client
                api.Dispose();
                api = null;
            }
            logger.LogInformation("SimConnect client cleaned up.");
        }

        #endregion


        #region Lifecycle

        public void Poll() {
            if (api != null) {
                // We are connected, attempt fetching a message.
                try { api.ReceiveMessage(); }
                catch (COMException) {
                    // COMException on ReceiveMessage () means connection was lost.
                    // Clear connection object and let next Tick() will attempt reconnection.
                    logger.LogError("Connection error, will try to reconnect.");
                    Stop();
                }
            }
            else {
                // We are not connected, attempt connection.
                Connect();
            }
        }

        public void Start() {
            // Start ticker
            logger.LogInformation("Starting ticker...");
            running = true;          
            ticker.Start();
        }

        public void Stop() {
            // Stop ticker
            logger.LogInformation("Stopping ticker...");
            running = false;
            ticker.Wait();
            Disconnect();
            logger.LogInformation("Ticker stopped.");

        }

        #endregion


        #region Callbacks

        private void HandleException(SimConnect sender, SIMCONNECT_RECV_EXCEPTION data) {
            logger.LogError($"SimConnect client raised an exception ({(SIMCONNECT_EXCEPTION)data.dwException})");
        }

        private void HandleOpen(SimConnect sender, SIMCONNECT_RECV_OPEN data) {
            logger.LogDebug("Preparing SimConnect session...");
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE HEADING DEGREES TRUE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "VERTICAL SPEED", "feet per second", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE PITCH DEGREES", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.AddToDataDefinition(DATA_DEFINITON_ID.UserPosition, "PLANE BANK DEGREES", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            api.RequestDataOnSimObject(
                DATA_DEFINITON_ID.UserPosition,             // Definition ID
                DATA_REQUEST_ID.UserPosition,               // Request ID
                USER_OBJECT_ID,                             // ObjectID to query
                SIMCONNECT_PERIOD.SECOND,                   // Request periodicty
                SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT,       // Request mode
                REQUEST_ORIGIN,                             // Request initial delay
                REQUEST_INTERVAL,                           // Request interval
                REQUEST_LIMIT                               // Request count limit
            );
            api.RegisterDataDefineStruct<UserStatus>(DATA_REQUEST_ID.UserPosition);
            logger.LogInformation("SimConnect session ready.");
        }

        private void HandleQuit(SimConnect sender, SIMCONNECT_RECV data) {
            Stop();
        }

        private void HandleSimobjectData(SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA data) {

            switch ((DATA_REQUEST_ID)data.dwRequestID) {
                case DATA_REQUEST_ID.UserPosition:
                    var flightStatus = (UserStatus?)data.dwData[0];
                    if (flightStatus.HasValue) {
                        userStatus.latitude = flightStatus.Value.latitude;
                        userStatus.longitude = flightStatus.Value.longitude;
                        userStatus.heading = flightStatus.Value.heading;
                        userStatus.altitude = flightStatus.Value.altitude;
                        userStatus.vspeed = flightStatus.Value.vspeed;
                        userStatus.pitch = flightStatus.Value.pitch;
                        userStatus.roll = flightStatus.Value.roll;
                    }
                    break;
            }

        }
        #endregion

    }

}
