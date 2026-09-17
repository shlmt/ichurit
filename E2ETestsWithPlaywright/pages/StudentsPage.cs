using E2EwithPlaywright.pages;
using Microsoft.Playwright;

namespace E2EwithPlaywright.Pages
{
    public class StudentsPage : BasePage
    {
        private readonly ILocator _addStudentButton;
        private readonly ILocator _studentNameInput;
        private readonly ILocator _idNumberInput;
        private readonly ILocator _classInput;
        private readonly ILocator _commentInput;
        private readonly ILocator _saveButton;
        private readonly ILocator _studentSearchInput;
        private readonly ILocator _suggestionsPanel;
        private readonly ILocator _suggestionItems;

        protected override string Url => "/students";

        public StudentsPage(IPage page) : base(page)
        {
            _addStudentButton = Page.GetByRole(AriaRole.Button, new() { NameString = "הוספת תלמידה" });
            _studentNameInput = Page.GetByRole(AriaRole.Textbox, new() { NameString = "שם התלמידה" });
            _idNumberInput = Page.GetByRole(AriaRole.Textbox, new() { NameString = "מספר זהות" });
            _classInput = Page.GetByRole(AriaRole.Combobox, new() { NameString = "כיתה" });
            _commentInput = Page.GetByRole(AriaRole.Textbox, new() { NameString = "הערה" });
            _saveButton = Page.GetByRole(AriaRole.Button, new() { NameString = "שמירה" });
            _studentSearchInput = Page.GetByRole(AriaRole.Combobox, new() { NameString = "חיפוש תלמידה" });
            _suggestionsPanel = Page.Locator(".p-autocomplete-panel");
            _suggestionItems = Page.Locator(".p-autocomplete-item");
        }

        public async Task OpenAddStudentDialogAsync()
        {
            await _addStudentButton.ClickAsync();
            await _studentNameInput.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        }

        public async Task NavigateAndInitializeAsync()
        {
            await DismissPopupIfPresentAsync();
            await NavigateToAsync();
            await DismissPopupIfPresentAsync();
        }

        public async Task SelectClassAsync(string className)
        {
            await _classInput.FillAsync(className);

            await _suggestionsPanel.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });

            var suggestion = _suggestionItems.First;
            await suggestion.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            await suggestion.ClickAsync();
        }

        public async Task SaveStudentAsync(string name, string idNumber, string className, string comment)
        {
            await _studentNameInput.FillAsync(name);
            await _idNumberInput.FillAsync(idNumber);
            await SelectClassAsync(className);
            await _commentInput.FillAsync(comment);
            await _saveButton.ClickAsync(new LocatorClickOptions { Force = true });
        }

        public async Task SearchForStudentAsync(string name)
        {
            await _studentSearchInput.FillAsync(name);

            var suggestion = _suggestionItems
                .Filter(new LocatorFilterOptions { HasTextString = name })
                .First;

            await suggestion.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            await suggestion.ClickAsync();
        }

        public ILocator StudentDetails(string name)
        {
            return Page.GetByRole(AriaRole.Heading, new() { NameString = name, Exact = true });
        }
    }
}