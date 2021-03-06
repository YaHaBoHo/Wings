﻿
namespace Wings {

    enum DATA_DEFINITON_ID {
        UserPosition
    }

    enum DATA_REQUEST_ID {
        UserPosition
    }

    public struct UserStatus {
        public double latitude { get; set; }
        public double longitude { get; set; }
        public double heading { get; set; }
        public double altitude { get; set; }
        public double vspeed { get; set; }
        public double pitch { get; set; }
        public double roll { get; set; }
    }
}