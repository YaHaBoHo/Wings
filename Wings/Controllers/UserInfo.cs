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

        [HttpGet("/api/position")]
        public RestResponse GetPosition() {
            if (simConnectClient.ready) {
                return new RestSuccess(simConnectClient.GetUserPosition());
            }
            else {
                return new RestFailure("SimConnect is not ready.");
            }
        }
    }

}
