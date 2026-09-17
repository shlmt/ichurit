using E2EwithPlaywright.pages;
using Microsoft.Playwright;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace E2EwithPlaywright.Pages
{
    public class LoginPage: BasePage
    {
        private readonly ILocator _usernameInput;
        private readonly ILocator _passwordInput;
        private readonly ILocator _loginButton;
        protected override string Url => "/";

        public LoginPage(IPage page): base(page)
        {
            // Locators definition
            _usernameInput = Page.Locator("input#username"); 
            _passwordInput = Page.Locator("input[type='password']");
            _loginButton = Page.Locator("button[name='submit']");
        }


        public async Task LoginAsync(string username, string password)
        {
            await _usernameInput.FillAsync(username);
            await _passwordInput.FillAsync(password);
            await _loginButton.ClickAsync();
        }
    }
}