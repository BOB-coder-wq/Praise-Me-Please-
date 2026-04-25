using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Collections.Generic;
using System.Linq;
using System;
using System.ComponentModel;

namespace WpfApp1;

public class PraiseLevel
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Emoji { get; set; }
    public string Description { get; set; }
}

public class PraiseEntry
{
    public string Name { get; set; }
    public string Message { get; set; }
    public string Level { get; set; }
    public decimal Amount { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    private PraiseLevel selectedLevel;
    private List<PraiseEntry> praises = new List<PraiseEntry>();
    private decimal totalEarned = 0m;

    public MainWindow()
    {
        InitializeComponent();
        InitializePraiseLevels();
        LoadSavedData();
        UpdateStatistics();
    }

    private void InitializePraiseLevels()
    {
        // Initialize praise levels
    }

    private void LoadSavedData()
    {
        praises = DataManager.LoadPraises();
        totalEarned = DataManager.GetTotalEarned();
        
        // Display existing praises
        var recentPraises = DataManager.GetRecentPraises(10);
        foreach (var praise in recentPraises)
        {
            AddPraiseToUI(praise);
        }
    }

    private void SaveData()
    {
        if (selectedLevel != null)
        {
            var praise = new PraiseEntry
            {
                Name = TxtName.Text.Trim(),
                Message = TxtPraise.Text.Trim(),
                Level = selectedLevel.Name,
                Amount = selectedLevel.Price,
                Timestamp = DateTime.Now
            };
            DataManager.SavePraise(praise);
        }
    }

    private void UpdateStatistics()
    {
        TxtTotalSpent.Text = $"${totalEarned:F2}";
        TxtTotalPraises.Text = praises.Count.ToString();
    }

    private void BtnBasic_Click(object sender, RoutedEventArgs e)
    {
        SelectPraiseLevel(new PraiseLevel 
        { 
            Name = "Basic Praise", 
            Price = 5m, 
            Emoji = "💝", 
            Description = "A simple thank you message" 
        });
    }

    private void BtnPremium_Click(object sender, RoutedEventArgs e)
    {
        SelectPraiseLevel(new PraiseLevel 
        { 
            Name = "Premium Praise", 
            Price = 15m, 
            Emoji = "⭐", 
            Description = "Detailed appreciation with emoji" 
        });
    }

    private void BtnElite_Click(object sender, RoutedEventArgs e)
    {
        SelectPraiseLevel(new PraiseLevel 
        { 
            Name = "Elite Praise", 
            Price = 50m, 
            Emoji = "👑", 
            Description = "Ultimate praise experience" 
        });
    }

    private void SelectPraiseLevel(PraiseLevel level)
    {
        selectedLevel = level;
        TxtSelectedLevel.Text = $"{level.Emoji} {level.Name} - ${level.Price}";
        BtnPay.IsEnabled = true;
        
        // Update button styles to show selection
        ResetButtonStyles();
        
        if (level.Name == "Basic Praise")
            BtnBasic.Background = new SolidColorBrush(Color.FromRgb(41, 128, 185));
        else if (level.Name == "Premium Praise")
            BtnPremium.Background = new SolidColorBrush(Color.FromRgb(142, 68, 173));
        else if (level.Name == "Elite Praise")
            BtnElite.Background = new SolidColorBrush(Color.FromRgb(230, 126, 34));
    }

    private void ResetButtonStyles()
    {
        BtnBasic.Background = new SolidColorBrush(Color.FromRgb(52, 152, 219));
        BtnPremium.Background = new SolidColorBrush(Color.FromRgb(155, 89, 182));
        BtnElite.Background = new SolidColorBrush(Color.FromRgb(243, 156, 18));
    }

    private async void BtnPay_Click(object sender, RoutedEventArgs e)
    {
        if (selectedLevel == null)
        {
            MessageBox.Show("Please select a praise level first.", "No Selection", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (string.IsNullOrWhiteSpace(TxtName.Text))
        {
            MessageBox.Show("Please enter your name.", "Missing Information", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (string.IsNullOrWhiteSpace(TxtPraise.Text))
        {
            MessageBox.Show("Please enter your praise message.", "Missing Information", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        // Simulate payment processing
        BtnPay.IsEnabled = false;
        BtnPay.Content = "🔄 Processing Payment...";

        await System.Threading.Tasks.Task.Delay(2000); // Simulate payment processing

        // Create new praise entry
        var praise = new PraiseEntry
        {
            Name = TxtName.Text.Trim(),
            Message = TxtPraise.Text.Trim(),
            Level = selectedLevel.Name,
            Amount = selectedLevel.Price,
            Timestamp = DateTime.Now
        };

        // Add to list and update UI
        praises.Add(praise);
        totalEarned += selectedLevel.Price;
        
        AddPraiseToUI(praise);
        UpdateStatistics();
        DataManager.SavePraise(praise);

        // Show success message
        MessageBox.Show($"Payment successful! Thank you for your {selectedLevel.Name}!", "Payment Complete", MessageBoxButton.OK, MessageBoxImage.Information);

        // Reset form
        ResetForm();
    }

    private void AddPraiseToUI(PraiseEntry praise)
    {
        var praiseCard = new Border
        {
            Background = new SolidColorBrush(Color.FromRgb(52, 73, 94)),
            CornerRadius = new CornerRadius(5),
            Padding = new Thickness(10),
            Margin = new Thickness(0, 0, 0, 5)
        };

        var stackPanel = new StackPanel();
        
        var headerPanel = new StackPanel { Orientation = Orientation.Horizontal };
        headerPanel.Children.Add(new TextBlock 
        { 
            Text = praise.Level, 
            FontWeight = FontWeights.Bold, 
            Foreground = new SolidColorBrush(Color.FromRgb(243, 156, 18))
        });
        headerPanel.Children.Add(new TextBlock 
        { 
            Text = $" - ${praise.Amount}", 
            Foreground = new SolidColorBrush(Color.FromRgb(39, 174, 96)),
            Margin = new Thickness(5, 0, 0, 0)
        });
        
        stackPanel.Children.Add(headerPanel);
        stackPanel.Children.Add(new TextBlock 
        { 
            Text = $"From: {praise.Name}", 
            Foreground = new SolidColorBrush(Color.FromRgb(189, 195, 199)),
            FontSize = 11,
            Margin = new Thickness(0, 2, 0, 0)
        });
        stackPanel.Children.Add(new TextBlock 
        { 
            Text = praise.Message, 
            Foreground = Brushes.White,
            TextWrapping = TextWrapping.Wrap,
            Margin = new Thickness(0, 5, 0, 0)
        });

        praiseCard.Child = stackPanel;
        
        // Insert at the beginning to show most recent first
        PraisesPanel.Children.Insert(0, praiseCard);
        
        // Keep only last 10 praises visible
        while (PraisesPanel.Children.Count > 10)
        {
            PraisesPanel.Children.RemoveAt(PraisesPanel.Children.Count - 1);
        }
    }

    private void ResetForm()
    {
        TxtName.Text = string.Empty;
        TxtPraise.Text = string.Empty;
        selectedLevel = null;
        TxtSelectedLevel.Text = "No praise level selected";
        BtnPay.IsEnabled = false;
        BtnPay.Content = "💳 Pay & Submit Praise";
        ResetButtonStyles();
    }

    private void BtnAdminPortal_Click(object sender, RoutedEventArgs e)
    {
        var loginWindow = new LoginWindow();
        loginWindow.Owner = this;
        
        if (loginWindow.ShowDialog() == true)
        {
            var adminWindow = new AdminWindow();
            adminWindow.Show();
        }
    }
}
