using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Data.Sqlite;

namespace WpfApp1
{
    public static class DataManager
    {
        private static readonly string DatabasePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PraisePayPortal",
            "praises.db"
        );

        static DataManager()
        {
            InitializeDatabase();
        }

        private static void InitializeDatabase()
        {
            try
            {
                var directory = Path.GetDirectoryName(DatabasePath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = @"
                    CREATE TABLE IF NOT EXISTS Praises (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL,
                        Message TEXT NOT NULL,
                        Level TEXT NOT NULL,
                        Amount REAL NOT NULL,
                        Timestamp TEXT NOT NULL
                    )";
                command.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing database: {ex.Message}");
            }
        }

        public static void SavePraise(PraiseEntry praise)
        {
            try
            {
                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = @"
                    INSERT INTO Praises (Name, Message, Level, Amount, Timestamp)
                    VALUES (@name, @message, @level, @amount, @timestamp)";

                command.Parameters.AddWithValue("@name", praise.Name);
                command.Parameters.AddWithValue("@message", praise.Message);
                command.Parameters.AddWithValue("@level", praise.Level);
                command.Parameters.AddWithValue("@amount", praise.Amount);
                command.Parameters.AddWithValue("@timestamp", praise.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"));

                command.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving praise: {ex.Message}");
            }
        }

        public static List<PraiseEntry> LoadPraises()
        {
            var praises = new List<PraiseEntry>();

            try
            {
                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = "SELECT Name, Message, Level, Amount, Timestamp FROM Praises ORDER BY Timestamp DESC";

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    var praise = new PraiseEntry
                    {
                        Name = reader.GetString(0),
                        Message = reader.GetString(1),
                        Level = reader.GetString(2),
                        Amount = reader.GetDecimal(3),
                        Timestamp = DateTime.Parse(reader.GetString(4))
                    };
                    praises.Add(praise);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading praises: {ex.Message}");
            }

            return praises;
        }

        public static decimal GetTotalEarned()
        {
            decimal total = 0m;

            try
            {
                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = "SELECT COALESCE(SUM(Amount), 0) FROM Praises";

                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    total = Convert.ToDecimal(result);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error calculating total earned: {ex.Message}");
            }

            return total;
        }

        public static int GetPraiseCount()
        {
            int count = 0;

            try
            {
                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = "SELECT COUNT(*) FROM Praises";

                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    count = Convert.ToInt32(result);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting praise count: {ex.Message}");
            }

            return count;
        }

        public static List<PraiseEntry> GetRecentPraises(int limit = 10)
        {
            var praises = new List<PraiseEntry>();

            try
            {
                using var connection = new SqliteConnection($"Data Source={DatabasePath}");
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = "SELECT Name, Message, Level, Amount, Timestamp FROM Praises ORDER BY Timestamp DESC LIMIT @limit";
                command.Parameters.AddWithValue("@limit", limit);

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    var praise = new PraiseEntry
                    {
                        Name = reader.GetString(0),
                        Message = reader.GetString(1),
                        Level = reader.GetString(2),
                        Amount = reader.GetDecimal(3),
                        Timestamp = DateTime.Parse(reader.GetString(4))
                    };
                    praises.Add(praise);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading recent praises: {ex.Message}");
            }

            return praises;
        }
    }
}
