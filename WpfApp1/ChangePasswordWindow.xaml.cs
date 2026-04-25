using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Security.Cryptography;
using System.Text;

namespace WpfApp1
{
    public partial class ChangePasswordWindow : Window
    {
        private static readonly string CredentialsPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PraisePayPortal",
            "admin.dat"
        );

        private const string DefaultUsername = "admin";

        public ChangePasswordWindow()
        {
            InitializeComponent();
            TxtCurrentPassword.Focus();
        }

        private void BtnChange_Click(object sender, RoutedEventArgs e)
        {
            var currentPassword = TxtCurrentPassword.Password;
            var newPassword = TxtNewPassword.Password;
            var confirmPassword = TxtConfirmPassword.Password;

            // Validation
            if (string.IsNullOrEmpty(currentPassword) || string.IsNullOrEmpty(newPassword) || string.IsNullOrEmpty(confirmPassword))
            {
                ShowError("All fields are required.");
                return;
            }

            if (newPassword.Length < 6)
            {
                ShowError("New password must be at least 6 characters long.");
                return;
            }

            if (newPassword != confirmPassword)
            {
                ShowError("New passwords do not match.");
                return;
            }

            try
            {
                // Verify current password
                if (!VerifyCurrentPassword(currentPassword))
                {
                    ShowError("Current password is incorrect.");
                    return;
                }

                // Change password
                var newHash = HashPassword(newPassword);
                File.WriteAllText(CredentialsPath, newHash);

                MessageBox.Show("Password changed successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                this.DialogResult = true;
                this.Close();
            }
            catch (Exception ex)
            {
                ShowError($"Error changing password: {ex.Message}");
            }
        }

        private void BtnCancel_Click(object sender, RoutedEventArgs e)
        {
            this.DialogResult = false;
            this.Close();
        }

        private bool VerifyCurrentPassword(string password)
        {
            try
            {
                if (!File.Exists(CredentialsPath))
                    return password == "admin123";

                var storedHash = File.ReadAllText(CredentialsPath);
                var inputHash = HashPassword(password);
                return storedHash == inputHash;
            }
            catch
            {
                return false;
            }
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

        private void ShowError(string message)
        {
            TxtErrorMessage.Text = message;
            TxtErrorMessage.Visibility = Visibility.Visible;
        }
    }
}
