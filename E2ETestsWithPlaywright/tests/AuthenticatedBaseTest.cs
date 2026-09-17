using System.IO;
using System.Threading.Tasks;
using Microsoft.Playwright;
using NUnit.Framework;

namespace E2EwithPlaywright.Tests
{
    [TestFixture]
    public abstract class AuthenticatedBaseTest : AnonymousBaseTest
    {
        public override BrowserNewContextOptions ContextOptions()
        {
            var options = base.ContextOptions();

            if (File.Exists(GlobalSetupTests.StatePath))
            {
                options.StorageStatePath = GlobalSetupTests.StatePath;
            }

            return options;
        }

        protected override Task<IAPIRequestContext> CreateApiContextAsync()
        {
            var options = new APIRequestNewContextOptions
            {
                BaseURL = ServerUrl,
                IgnoreHTTPSErrors = true
            };

            if (File.Exists(GlobalSetupTests.StatePath))
            {
                options.StorageStatePath = GlobalSetupTests.StatePath;
            }

            return Playwright.APIRequest.NewContextAsync(options);
        }
    }
}