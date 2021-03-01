using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Wings {

    public class RestResponse {
        public bool success { get; set; }
        public string message { get; set; }
        public Dictionary<string, double> data { get; set; }
    }

    public class RestSuccess : RestResponse {
        public RestSuccess(Dictionary<string, double> data) {
            success = true;
            this.data = data;
        }
    }

    public class RestFailure : RestResponse {
        public RestFailure(string message) {
            success = false;
            this.message = message;
        }
    }

    [Route("api/[controller]")]
    public class RestController : Controller {

        private readonly SimConnectClient simConnectClient;

        public RestController() {
            simConnectClient = SimConnectClient.Instance;
        }

        [HttpGet("/api/gps")]
        public RestResponse GetGps() {
            if (simConnectClient.ready) {
                return new RestSuccess(simConnectClient.GetUserGps());
            }
            else {
                return new RestFailure("SimConnect is not ready.");
            }
        }

        [HttpGet("/api/instruments")]
        public RestResponse GetInstruments() {
            if (simConnectClient.ready) {
                return new RestSuccess(simConnectClient.GetUserInstruments());
            }
            else {
                return new RestFailure("SimConnect is not ready.");
            }
        }

    }

}
