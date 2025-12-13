@echo off
echo Testing Batch Creation...
curl -X POST http://localhost:5000/api/admin/batches ^
 -H "Content-Type: application/json" ^
 -H "Authorization: Bearer HOD_MOCK_123" ^
 -d "{\"name\": \"2024-25\", \"startDate\": \"2024-01-01\", \"interns\": [{\"fullName\": \"Intern 1\", \"email\": \"i1@test.com\", \"regNo\": \"R1\"}, {\"fullName\": \"Intern 2\", \"email\": \"i2@test.com\", \"regNo\": \"R2\"}, {\"fullName\": \"Intern 3\", \"email\": \"i3@test.com\", \"regNo\": \"R3\"}, {\"fullName\": \"Intern 4\", \"email\": \"i4@test.com\", \"regNo\": \"R4\"}]}"
echo.
pause
