using E2EwithPlaywright.Pages;
using E2EwithPlaywright.Infrastructure;
using Microsoft.Playwright;


namespace E2EwithPlaywright.Tests;

[NonParallelizable]
[Order(2)]
[TestFixture]
public class CreateLateReportTest : AuthenticatedBaseTest
{
    [Test]
    public async Task CreateLateReportHappyPath()
    {
        var createLateReportPage = new CreateLateReportPage(Page);

        // Navigate to the page before waiting for elements to load
        await createLateReportPage.NavigateAndInitializeAsync();

        await createLateReportPage.SelectStudentAsync(E2ETestData.StudentName);
        await createLateReportPage.SelectLateTypeAsync("איחור מאושר");
        await createLateReportPage.FillCommentAsync("בדיקת happy path");

        var responseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/late") && r.Request.Method == "POST");

        await createLateReportPage.SubmitAsync();

        var response = await responseTask;
        Assert.That(response.Status, Is.EqualTo(201), "קוד הסטטוס אינו מורה על הצלחה");

        // Extract the created ID from the JSON response
        var responseBody = await response.JsonAsync();
        var createdId = responseBody?.GetProperty("id").ToString();

        try
        {
            var (toastMessage, severity) = await createLateReportPage.GetToastMessageAsync();

            Assert.That(severity, Does.Contain("success"));
            Assert.That(toastMessage, Is.Not.Empty);

            // TODO: check in StudentLateReportListPage that the report is present in the list
        }
        finally
        {
            // Cleanup: ensure created record is deleted even if assertions fail
            if (!string.IsNullOrEmpty(createdId))
            {
                var delResponse = await ApiContext.DeleteAsync("/api/late/" + createdId);
                var status = delResponse.Status;
                if (!delResponse.Ok)
                {
                    var responseText = await delResponse.TextAsync();
                    Console.WriteLine($"Cleanup warning: Failed to delete record '{createdId}'. Status: {status}, Response: {responseText}");
                }
                else
                {
                    // if 404 returned it mean the record not creted well
                    Assert.That(status, Is.Not.EqualTo(404), "לא נוצרה רשומה");
                }
            }
        }
    }

    [Test]
    public async Task CreateLateReportForSameStudentAndDayReturnsConflict()
    {
        var createLateReportPage = new CreateLateReportPage(Page);
        await createLateReportPage.NavigateAndInitializeAsync();
        await createLateReportPage.SelectStudentAsync(E2ETestData.StudentName);
        await createLateReportPage.SelectLateTypeAsync("חיסור");

        var firstResponseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/late") && r.Request.Method == "POST");
        await createLateReportPage.SubmitAsync();
        var firstResponse = await firstResponseTask;
        Assert.That(firstResponse.Status, Is.EqualTo(201));

        var firstResponseBody = await firstResponse.JsonAsync();
        var createdId = firstResponseBody?.GetProperty("id").ToString();
        await createLateReportPage.Toast.WaitForAsync(new LocatorWaitForOptions
        {
            State = WaitForSelectorState.Hidden
        });
        try
        {
            await createLateReportPage.SelectStudentAsync(E2ETestData.StudentName);

            var duplicateResponseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/late") && r.Request.Method == "POST");
            await createLateReportPage.SubmitAsync();

            var duplicateResponse = await duplicateResponseTask;
            Assert.That(duplicateResponse.Status, Is.EqualTo(409));

            var (toastMessage, severity) = await createLateReportPage.GetToastMessageAsync();
            Assert.That(toastMessage, Does.Contain("קיימת כבר חריגת נוכחות"));
            Assert.That(severity, Does.Contain("error"));
        }
        finally
        {
            await DeleteCreatedLateAsync(createdId);
        }
    }

    [Test]
    public async Task CreateLateReportWithoutStudentShowsRequiredFieldError()
    {
        var createLateReportPage = new CreateLateReportPage(Page);
        await createLateReportPage.NavigateAndInitializeAsync();
        await createLateReportPage.SubmitAsync();

        var (toastMessage, severity) = await createLateReportPage.GetToastMessageAsync();
        Assert.That(toastMessage, Does.Contain("חובה לבחור תלמידה"));
        Assert.That(severity, Does.Contain("error"));
    }

    [Test]
    public async Task CreateLateReportWithMaximumCommentLengthSucceeds()
    {
        var createLateReportPage = new CreateLateReportPage(Page);
        await createLateReportPage.NavigateAndInitializeAsync();
        await createLateReportPage.SelectStudentAsync(E2ETestData.StudentName);
        await createLateReportPage.FillCommentAsync(new string('א', 70));

        var responseTask = Page.WaitForResponseAsync(r => r.Url.Contains("/late") && r.Request.Method == "POST");
        await createLateReportPage.SubmitAsync();

        var response = await responseTask;
        Assert.That(response.Status, Is.EqualTo(201));

        var responseBody = await response.JsonAsync();
        var createdId = responseBody?.GetProperty("id").ToString();

        try
        {
            var (toastMessage, severity) = await createLateReportPage.GetToastMessageAsync();
            Assert.That(toastMessage, Is.Not.Empty);
            Assert.That(severity, Does.Contain("success"));
        }
        finally
        {
            await DeleteCreatedLateAsync(createdId);
        }
    }

    private async Task DeleteCreatedLateAsync(string? createdId)
    {
        if (string.IsNullOrEmpty(createdId))
        {
            return;
        }

        var response = await ApiContext.DeleteAsync("/api/late/" + createdId);
        Assert.That(response.Status, Is.Not.EqualTo(404), "The created record was not found during cleanup.");
    }
}