using E2EwithPlaywright.Infrastructure;
using E2EwithPlaywright.Pages;
using E2EwithPlaywright.Tests;

namespace E2EwithPlaywright;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class LoginTest : AnonymousBaseTest
{
    [Test]
    public async Task LoginHappyPath()
    {
        var loginPage = new LoginPage(Page);

        await loginPage.NavigateToAsync();

        var responseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/auth"));

        await loginPage.LoginAsync(
            TestConfiguration.AdminUsername,
            TestConfiguration.AdminPassword);

        var response = await responseTask;
        Assert.That(response.Status, Is.EqualTo(200), "קוד הסטטוס בהתחברות מוצלחת אינו 200");

        await AuthHelper.WaitForAttendancePageAsync(Page);
    }

    [Test]
    public async Task LoginWithInvalidCredentials()
    {
        var loginPage = new LoginPage(Page);

        await loginPage.NavigateToAsync();

        var responseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/auth"));

        await loginPage.LoginAsync("invalidUser", "invalidPassword");

        var response = await responseTask;
        Assert.That(response.Status, Is.EqualTo(401), "קוד הסטטוס בפרטים שגויים אינו 401");

        var (toastMessage, severity) = await loginPage.GetToastMessageAsync();
        Assert.That(toastMessage, Contains.Substring("לא מורשה"));
        Assert.That(severity, Contains.Substring("error"));
    }

    [Test]
    public async Task LoginWithEmptyCredentials()
    {
        var loginPage = new LoginPage(Page);

        await loginPage.NavigateToAsync();

        await loginPage.LoginAsync("", "");

        var (toastMessage, severity) = await loginPage.GetToastMessageAsync();
        Assert.That(toastMessage, Contains.Substring("יש למלא שם משתמש וסיסמה"));
        Assert.That(severity, Contains.Substring("error"));
    }
}