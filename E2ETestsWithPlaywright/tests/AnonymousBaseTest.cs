using System.IO;
using System.Threading.Tasks;
using E2EwithPlaywright.Infrastructure;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;
using NUnit.Framework.Interfaces;

namespace E2EwithPlaywright.Tests
{
    [TestFixture]
    public abstract class AnonymousBaseTest : PageTest
    {
        protected string BaseUrl => TestConfiguration.BaseUrl;
        protected string ServerUrl => TestConfiguration.ApiBaseUrl;

        public IAPIRequestContext ApiContext { get; private set; }

        public override BrowserNewContextOptions ContextOptions()
        {
            return new BrowserNewContextOptions
            {
                BaseURL = BaseUrl,
                ViewportSize = new ViewportSize { Width = 1280, Height = 720 },
                IgnoreHTTPSErrors = true
            };
        }

        [SetUp]
        public async Task GlobalSetup()
        {
            ApiContext = await CreateApiContextAsync();

            var skipButton = Page.GetByRole(AriaRole.Button, new() { Name = "דלג" });
            await Page.AddLocatorHandlerAsync(skipButton, async () =>
            {
                Console.WriteLine("Skip button detected, clicking it to bypass the welcome screen.");
                await skipButton.ClickAsync();
            });

            await Context.Tracing.StartAsync(new TracingStartOptions
            {
                Screenshots = true,
                Snapshots = true,
                Sources = true
            });
        }

        protected virtual Task<IAPIRequestContext> CreateApiContextAsync()
        {
            return Playwright.APIRequest.NewContextAsync(new APIRequestNewContextOptions
            {
                BaseURL = ServerUrl,
                IgnoreHTTPSErrors = true
            });
        }

        [TearDown]
        public async Task GlobalTeardown()
        {
            if (ApiContext != null)
            {
                await ApiContext.DisposeAsync();
            }

            var testOutcome = TestContext.CurrentContext.Result.Outcome.Status;

            if (testOutcome == TestStatus.Failed)
            {
                var testName = TestContext.CurrentContext.Test.Name;
                var screenshotPath = Path.Combine(TestContext.CurrentContext.WorkDirectory, $"failed_{testName}.png");

                await Page.ScreenshotAsync(new PageScreenshotOptions
                {
                    Path = screenshotPath,
                    FullPage = true
                });

                await Context.Tracing.StopAsync(new TracingStopOptions
                {
                    Path = Path.Combine(TestContext.CurrentContext.WorkDirectory, $"trace_{testName}.zip")
                });
            }
            else
            {
                await Context.Tracing.StopAsync(new TracingStopOptions());
            }
        }
    }
}