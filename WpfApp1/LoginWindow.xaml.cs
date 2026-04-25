using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Security.Cryptography;
using System.Text;

namespace WpfApp1
{
    public partial class LoginWindow : Window
    {
        private static readonly string CredentialsPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PraisePayPortal",
            "admin.dat"
        );

        private const string DefaultUsername = "admin";
        private const string DefaultPassword = "admin123";

        public LoginWindow()
        {
            InitializeComponent();
            InitializeCredentials();
            TxtPassword.Focus();
        }

        private void InitializeCredentials()
        {
            try
            {
                var directory = Path.GetDirectoryName(CredentialsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Create default credentials if they don't exist
                if (!File.Exists(CredentialsPath))
                {
                    var defaultHash = HashPassword(DefaultPassword);
                    File.WriteAllText(CredentialsPath, defaultHash);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing credentials: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnLogin_Click(object sender, RoutedEventArgs e)
        {
            var username = TxtUsername.Text.Trim();
            var password = TxtPassword.Password;

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                ShowError("Please enter both username and password.");
                return;
            }

            if (username != DefaultUsername)
            {
                ShowError("Invalid username.");
                return;
            }

            try
            {
                var storedHash = File.ReadAllText(CredentialsPath);
                var inputHash = HashPassword(password);

                if (storedHash == inputHash)
                {
                    // Login successful
                    this.DialogResult = true;
                    this.Close();
                }
                else
                {
                    ShowError("Invalid password. Please try again.");
                    TxtPassword.Clear();
                    TxtPassword.Focus();
                }
            }
            catch (Exception ex)
            {
                ShowError($"Login error: {ex.Message}");
            }
        }

        private void BtnChangePassword_Click(object sender, RoutedEventArgs e)
        {
            var changePasswordWindow = new ChangePasswordWindow();
            changePasswordWindow.Owner = this;
            changePasswordWindow.ShowDialog();
        }

        private void ShowError(string message)
        {
            TxtErrorMessage.Text = message;
            TxtErrorMessage.Visibility = Visibility.Visible;
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        public static bool VerifyCredentials(string username, string password)
        {
            if (username != DefaultUsername)
                return false;

            try
            {
                if (!File.Exists(CredentialsPath))
                    return password == DefaultPassword;

                var storedHash = File.ReadAllText(CredentialsPath);
                using (var sha256 = SHA256.Create())
                {
                    var bytes = Encoding.UTF8.GetBytes(password);
                    var hash = sha256.ComputeHash(bytes);
                    var inputHash = Convert.ToBase64String(hash);
                    return storedHash == inputHash;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
