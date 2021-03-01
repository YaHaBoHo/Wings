using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;


namespace Wings {

    public class Program {

        // Logging
        public static ILoggerFactory loggerFactory;
        private static ILogger logger;
        // SimConnect client
        private static SimConnectClient simConnectClient;

        static void Main() {

            // Spawn logger
            loggerFactory = LoggerFactory.Create(logBuilder =>
                logBuilder.AddSimpleConsole(logOptions => {
                    logOptions.IncludeScopes = true;
                    logOptions.SingleLine = true;
                    logOptions.TimestampFormat = "hh:mm:ss ";
                }));
            logger = loggerFactory.CreateLogger<Program>();
            logger.LogInformation("Initializing...");

            // Spawn SimConnect client
            logger.LogInformation("Spawning SimConnect client...");
            simConnectClient = SimConnectClient.Instance;
            simConnectClient.Start();

            // Start REST API
            CreateHostBuilder().Build().Run();

            // Housekeeper
            logger.LogInformation("Cleaning up...");
            simConnectClient.Stop();
            logger.LogInformation("All done. Exiting.");
            Environment.Exit(0);

        }

        public static IHostBuilder CreateHostBuilder() {
            return Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(webBuilder => {
                    // webBuilder.UseContentRoot("www").UseWebRoot("gui").UseStartup<RestService>();
                    webBuilder.UseUrls("http://*:5000").UseStartup<RestService>();
                })
                .ConfigureLogging(logBuilder => {
                    logBuilder.ClearProviders().AddSimpleConsole(logOptions => {
                        logOptions.IncludeScopes = true;
                        logOptions.SingleLine = true;
                        logOptions.TimestampFormat = "hh:mm:ss ";
                    });
                });
        }


    }
}
