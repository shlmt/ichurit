using System.Text.Json;
using E2EwithPlaywright.Pages;
using E2EwithPlaywright.Infrastructure;
using Microsoft.Playwright;

namespace E2EwithPlaywright.Tests;

[NonParallelizable]
[Order(1)]
[TestFixture]
public class StudentsTest : AuthenticatedBaseTest
{
    [Test]
    public async Task AddStudentAndFindItHappyPath()
    {
        var studentsPage = new StudentsPage(Page);
        await studentsPage.NavigateAndInitializeAsync();

        var classesResponse = await ApiContext.GetAsync("/api/class");
        Assert.That(classesResponse.Status, Is.EqualTo(200), "טעינת רשימת הכיתות נכשלה");

        var classes = (await classesResponse.JsonAsync()).GetValueOrDefault();
        Assert.That(classes.GetArrayLength(), Is.GreaterThan(0), "לא נמצאו כיתות זמינות לתלמידה החדשה");

        var studentName = E2ETestData.StudentName;
        var idNumber = E2ETestData.StudentIdNumber;

        await studentsPage.OpenAddStudentDialogAsync();

        var createResponseTask = Page.WaitForResponseAsync(response => response.Url.Contains("/student") && response.Request.Method == "POST");
        await studentsPage.SaveStudentAsync(studentName, idNumber, E2ETestData.ClassName, "בדיקת happy path");
        var createResponse = await createResponseTask;
        Assert.That(createResponse.Status, Is.EqualTo(201), "יצירת התלמידה לא הצליחה");

        var (toastMessage, severity) = await studentsPage.GetToastMessageAsync();
        Assert.That(severity, Does.Contain("success"));
        Assert.That(toastMessage, Does.Contain(studentName));

        await studentsPage.SearchForStudentAsync(studentName);

        var studentDetails = studentsPage.StudentDetails(studentName);
        await studentDetails.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        Assert.That(await studentDetails.InnerTextAsync(), Is.EqualTo(studentName));
        Assert.That(await Page.GetByText($"מספר זהות: {idNumber}").IsVisibleAsync(), Is.True);
    }
}