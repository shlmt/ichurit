using System.Threading.Tasks;
using E2EwithPlaywright.Infrastructure;
using E2EwithPlaywright.Pages;
using Microsoft.Playwright;

namespace E2EwithPlaywright.Infrastructure
{
    public class AuthHelper
    {
        public static async Task PerformLoginAsync(IPage page)
        {
            LoginPage loginPage = new LoginPage(page);
            await loginPage.LoginAsync(TestConfiguration.AdminUsername, TestConfiguration.AdminPassword);
            await WaitForAttendancePageAsync(page);
        }

        public static async Task WaitForAttendancePageAsync(IPage page)
        {
            var heading = page.GetByRole(AriaRole.Heading, new() { NameString = "עדכון נוכחות", Exact = false });
            await heading.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        }
    }
}