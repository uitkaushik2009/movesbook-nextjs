@echo off
echo Running database migration to increase text field limits...
echo.
echo Please enter your MySQL password when prompted.
echo.

mysql -u Administrator -p -D movesbook_nextjs -e "ALTER TABLE moveframes MODIFY COLUMN description TEXT NOT NULL, MODIFY COLUMN notes TEXT NULL; ALTER TABLE movelaps MODIFY COLUMN notes TEXT NULL; SELECT 'Migration completed successfully!' as Status;"

echo.
echo Done! Press any key to close...
pause > nul

