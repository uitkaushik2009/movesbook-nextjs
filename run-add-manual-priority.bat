@echo off
echo Running manual priority migration...
mysql -h 217.154.202.41 -u u575897144_admin -p u575897144_movesbook < migrations\add_manual_priority.sql
echo Migration complete!
pause

