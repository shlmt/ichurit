using E2EwithPlaywright.pages;
using E2EwithPlaywright.Infrastructure;
using Microsoft.Playwright;

namespace E2EwithPlaywright.Pages
{
    public class CreateLateReportPage : BasePage
    {
        private readonly ILocator _studentInput;
        private readonly Dictionary<string, ILocator> _lateTypeButtons;
        private readonly ILocator _datePicker;
        private readonly ILocator _timeInput;
        private readonly ILocator _commentInput;
        private readonly ILocator _submitButton;

        protected override string Url => "/";

        public CreateLateReportPage(IPage page) : base(page)
        {
            _studentInput = Page.GetByPlaceholder("חיפוש תלמידה");
            _datePicker = Page.Locator(".reactJewishDatePicker");
            _timeInput = Page.Locator(".p-calendar-timeonly input");
            _commentInput = Page.Locator("textarea#comment");
            _submitButton = Page.Locator("button:has(.pi-check)");
            _lateTypeButtons = new Dictionary<string, ILocator>
            {
                ["חיסור"] = Page.Locator(".p-selectbutton i.pi-minus"),
                ["איחור מאושר"] = Page.Locator(".p-selectbutton i.pi-plus-circle"),
                ["איחור"] = Page.Locator(".p-selectbutton i.pi-plus")
            };
        }

        public async Task NavigateAndInitializeAsync()
        {
            await NavigateToAsync();
            await AuthHelper.WaitForAttendancePageAsync(Page);
            await DismissPopupIfPresentAsync();
        }

        public async Task SelectStudentAsync(string studentName)
        {
            await _studentInput.FillAsync(studentName);

            var suggestion = Page.Locator(".p-autocomplete-panel li")
                .Filter(new LocatorFilterOptions { HasTextString = studentName })
                .First;

            await suggestion.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            await suggestion.ClickAsync();
        }

        public async Task SelectFirstStudentAsync()
        {
            var studentInput = Page.GetByPlaceholder("חיפוש תלמידה");
            var searchChars = "מאבגדהוזחטיכלמנסעפצקרשתךםןףץ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".ToList();

            foreach (var ch in searchChars)
            {
                await studentInput.ClearAsync();
                await studentInput.ClickAsync();

                await studentInput.PressSequentiallyAsync(ch.ToString(), new LocatorPressSequentiallyOptions { Delay = 150 });

                // Target the first option in the PrimeReact autocomplete dropdown
                var firstOption = Page.Locator(".p-autocomplete-item").First;

                try
                {
                    // Wait for the dropdown option to render and become visible
                    await firstOption.WaitForAsync(new LocatorWaitForOptions
                    {
                        State = WaitForSelectorState.Visible,
                        Timeout = 2000
                    });

                    // Click the first available option
                    await firstOption.ClickAsync();
                    return;
                }
                catch (TimeoutException)
                {
                    // Dropdown didn't appear in time, proceed to the next character in the array
                    continue;
                }
            }

            // Fail the test gracefully if no students were found after trying all characters
            throw new Exception("No students found with the provided search characters.");
        }

        public async Task SelectLateTypeAsync(string lateType)
        {
            if (!_lateTypeButtons.TryGetValue(lateType, out var buttonLocator))
            {
                throw new ArgumentException($"סוג איחור לא מוכר: {lateType}");
            }

            await buttonLocator.ClickAsync();
        }

        public async Task SelectDateAsync(string dateTitle)
        {
            await _datePicker.Locator($".day[title='{dateTitle}']").ClickAsync();
        }

        public async Task SetTimeAsync(string time)
        {
            await _timeInput.FillAsync(time);
        }

        public async Task FillCommentAsync(string comment)
        {
            await _commentInput.FillAsync(comment);
        }

        public async Task SubmitAsync()
        {
            await _submitButton.ClickAsync();
        }
    }
}