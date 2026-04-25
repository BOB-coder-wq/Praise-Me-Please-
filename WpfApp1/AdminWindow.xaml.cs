using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Microsoft.Win32;

namespace WpfApp1
{
    public partial class AdminWindow : Window
    {
        private List<PraiseEntry> allPraises = new List<PraiseEntry>();

        public AdminWindow()
        {
            InitializeComponent();
            LoadData();
        }

        private void LoadData()
        {
            try
            {
                allPraises = DataManager.LoadPraises();
                UpdateStatistics();
                DisplayPraises();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading data: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void UpdateStatistics()
        {
            var totalEarned = DataManager.GetTotalEarned();
            var totalPraises = DataManager.GetPraiseCount();
            var elitePraises = allPraises.Count(p => p.Level.Contains("Elite"));
            var premiumPraises = allPraises.Count(p => p.Level.Contains("Premium"));

            TxtTotalEarned.Text = $"${totalEarned:F2}";
            TxtTotalPraises.Text = totalPraises.ToString();
            TxtElitePraises.Text = elitePraises.ToString();
            TxtPremiumPraises.Text = premiumPraises.ToString();
        }

        private void DisplayPraises()
        {
            PraisesList.ItemsSource = allPraises.OrderByDescending(p => p.Timestamp).ToList();
        }

        private void BtnRefresh_Click(object sender, RoutedEventArgs e)
        {
            LoadData();
        }

        private void BtnExport_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveFileDialog = new SaveFileDialog
                {
                    Filter = "CSV files (*.csv)|*.csv|Text files (*.txt)|*.txt",
                    FileName = $"praises_export_{DateTime.Now:yyyyMMdd_HHmmss}"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    ExportData(saveFileDialog.FileName);
                    MessageBox.Show("Data exported successfully!", "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error exporting data: {ex.Message}", "Export Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExportData(string filePath)
        {
            var lines = new List<string>
            {
                "Timestamp,Name,Level,Amount,Message"
            };

            foreach (var praise in allPraises.OrderByDescending(p => p.Timestamp))
            {
                var line = $"\"{praise.Timestamp:yyyy-MM-dd HH:mm:ss}\"," +
                          $"\"{EscapeCsvField(praise.Name)}\"," +
                          $"\"{EscapeCsvField(praise.Level)}\"," +
                          $"\"{praise.Amount:F2}\"," +
                          $"\"{EscapeCsvField(praise.Message)}\"";
                lines.Add(line);
            }

            System.IO.File.WriteAllLines(filePath, lines);
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return "";

            return field.Replace("\"", "\"\"");
        }

        private void BtnBackToMain_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        private void BtnLogout_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Logged out successfully. Closing admin portal.", "Logout", MessageBoxButton.OK, MessageBoxImage.Information);
            this.Close();
        }
    }
}
