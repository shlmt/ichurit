using System.Text.Json;
using E2EwithPlaywright.Pages;
using E2EwithPlaywright.Tests;
using Microsoft.Playwright;

namespace E2EwithPlaywright;

[NonParallelizable]
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
        System.Console.WriteLine($"Found {classes.GetArrayLength()} classes available for the new student.");
        Assert.That(classes.GetArrayLength(), Is.GreaterThan(0), "לא נמצאו כיתות זמינות לתלמידה החדשה");

        var classData = classes[0];
        var className = classData.GetProperty("grade").GetString() + classData.GetProperty("number").ToString();
        var studentName = $"בדיקת תלמידה {DateTime.UtcNow:yyyyMMddHHmmssfff}";
        var idNumber = DateTime.UtcNow.ToString("HHmmssfff");

        System.Console.WriteLine($"Creating a new student with name '{studentName}', ID number '{idNumber}', and class '{className}'.");
        await studentsPage.OpenAddStudentDialogAsync();

        var createResponseTask = Page.WaitForResponseAsync(response => response.Url.Contains("/student") && response.Request.Method == "POST");
    System.Console.WriteLine("before");
        await studentsPage.SaveStudentAsync(studentName, idNumber, className, "בדיקת happy path");
System.Console.WriteLine("after");
        var createResponse = await createResponseTask;
        Assert.That(createResponse.Status, Is.EqualTo(201), "יצירת התלמידה לא הצליחה");

        try
        {
            var (toastMessage, severity) = await studentsPage.GetToastMessageAsync();
            Assert.That(severity, Does.Contain("success"));
            Assert.That(toastMessage, Does.Contain(studentName));

            await studentsPage.SearchForStudentAsync(studentName);

            var studentDetails = studentsPage.StudentDetails(studentName);
            await studentDetails.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            Assert.That(await studentDetails.InnerTextAsync(), Is.EqualTo(studentName));
            Assert.That(await Page.GetByText($"מספר זהות: {idNumber}").IsVisibleAsync(), Is.True);
        }
        finally
        {
            var studentsResponse = await ApiContext.GetAsync("/api/student");
            Assert.That(studentsResponse.Status, Is.EqualTo(200), "טעינת התלמידה לצורך ניקוי נכשלה");

                var students = (await studentsResponse.JsonAsync()).GetValueOrDefault();
            var createdStudent = students.EnumerateArray()
                .FirstOrDefault(student => student.GetProperty("idNum").GetString() == idNumber);

            if (createdStudent.ValueKind == JsonValueKind.Object)
            {
                var deleteResponse = await ApiContext.DeleteAsync(
                    "/api/student/" + createdStudent.GetProperty("_id").GetString());
                Assert.That(deleteResponse.Status, Is.EqualTo(200), "ניקוי התלמידה שנוצרה נכשל");
            }
        }
    }
}