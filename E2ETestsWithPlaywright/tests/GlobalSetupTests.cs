using System.IO;
using System.Threading.Tasks;
using E2EwithPlaywright.Infrastructure;
using Microsoft.Playwright;
using NUnit.Framework;

namespace E2EwithPlaywright
{
    [SetUpFixture]
    public class GlobalSetupTests
    {
        public static string StatePath => Path.Combine(TestContext.CurrentContext.WorkDirectory, "state.json");

        [OneTimeSetUp]
        public async Task SetupAuthStateAsync()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = false
            });

            var context = await browser.NewContextAsync();
            var page = await context.NewPageAsync();

            await page.GotoAsync(TestConfiguration.BaseUrl);

            await AuthHelper.PerformLoginAsync(page);

            await context.StorageStateAsync(new BrowserContextStorageStateOptions
            {
                Path = StatePath
            });
        }
    }
}