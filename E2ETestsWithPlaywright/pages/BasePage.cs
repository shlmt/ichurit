using Microsoft.Playwright;

namespace E2EwithPlaywright.pages
{
    public abstract class BasePage
    {
        protected readonly IPage Page;
        private ILocator Toast => Page.Locator(".p-toast-message");
        protected abstract string Url { get; }

        protected BasePage(IPage page)
        {
            Page = page ?? throw new ArgumentNullException(nameof(page));
        }

        public async Task NavigateToAsync()
        {
            await Page.GotoAsync(Url);
        }

        public async Task WaitForURLAsync(string targetUrl)
        {
            await Page.WaitForURLAsync(targetUrl);
        }

        public async Task<(string message, string? severity)> GetToastMessageAsync()
        {
            await Toast.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            var severity = await Toast.GetAttributeAsync("class");
            var detailLocator = Toast.Locator(".p-toast-detail");
            string message = await detailLocator.InnerTextAsync();
            return (message, severity);
        }

        public async Task DismissPopupIfPresentAsync()
        {
            var closeButton = Page.GetByTestId("button-close");

            try
            {
                // Wait up to 3 seconds for the close button to appear
                await closeButton.WaitForAsync(new LocatorWaitForOptions
                {
                    State = WaitForSelectorState.Visible,
                    Timeout = 3000
                });

                await closeButton.ClickAsync();
            }
            catch (TimeoutException)
            {
                await Page.Mouse.ClickAsync(10, 10);

                // Popup did not appear within 3 seconds, proceed normally
            }
        }
    }
}