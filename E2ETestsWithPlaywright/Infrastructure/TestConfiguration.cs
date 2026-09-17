using System;
using Microsoft.Extensions.Configuration;

namespace E2EwithPlaywright.Infrastructure
{
    public static class TestConfiguration
    {
        private static readonly IConfigurationRoot Configuration;

        static TestConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public static string BaseUrl => Configuration["TestSettings:BaseUrl"] ?? "http://localhost:3000";
        public static string AdminUsername => Configuration["TestSettings:AdminUsername"] ?? string.Empty;
        public static string AdminPassword => Configuration["TestSettings:AdminPassword"] ?? string.Empty;
        public static string ApiBaseUrl => Configuration["TestSettings:ApiBaseUrl"] ?? "http://localhost:5000";
    }
}