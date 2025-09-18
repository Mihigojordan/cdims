[1mdiff --git a/backend/src/app.js b/backend/src/app.js[m
[1mindex f492275..f9956c1 100644[m
[1m--- a/backend/src/app.js[m
[1m+++ b/backend/src/app.js[m
[36m@@ -31,7 +31,7 @@[m [mconst allowedOrigins = [[m
   'http://localhost:3000', // Allow direct API testing[m
   'http://localhost:3001', // Frontend[m
   'https://cdims-frontend.onrender.com', // Production frontend (if deployed)[m
[31m-  'https://cdims-backend.onrender.com' // Production backend (if needed for testing)[m
[32m+[m[32m  'https://cdims.onrender.com' // Production backend (if needed for testing)[m
 ];[m
 [m
 app.use(cors({[m
