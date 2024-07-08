

<<<<<<< HEAD
Frontend Link : (https://github.com/thebti92/CRM)

Backend Link : (https://github.com/thebti92/CRM-backend)
=======

#### for register / add user
POST : http://localhost:4000/api/auth/register (register)
{
    "name": "thebti",
    "email": "admin@gmail.com",
    "password": "thebti",
    "role": "admin",
    "phone": "26520714"
}

#### for Login
POST : http://localhost:4000/api/auth/login
Header  : key:Authorization  + value :token

{
    "email": "admin@gmail.com",
    "password": "thebti"
}

#### update
PATCH : http://localhost:4000/api/users/661e3a434ccbd6e5a7a41549

{
    "name": "thebti",
    "email": "admin@gmail.com",
    "password": "thebti",
    "role": "admin",
    "phone": "26520715"
}

#### contacts
add
{
    "name": "anis",
    "email": "contact@gmail.com",
    "phone": "26520714",
    "notes": "a note about this contacts"
}


Create a new user: POST /users/
Get all users: GET /users/
Get a specific user by ID: GET /users/:id
Update a specific user: PATCH /users/:id
Delete a specific user: DELETE /users/:id 
>>>>>>> 1e9a170 (users)
