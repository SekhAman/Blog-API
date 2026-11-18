# BlogSpace

A full-stack blog application for creating, publishing, and exploring blog posts with user authentication and content management.

## Features

- User registration and login
- JWT-based authentication
- Create, edit, and delete blog posts
- Search posts by title and description
- Pagination for blog posts
- Image uploads using Cloudinary
- Author-based post management
- Responsive frontend

## Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Authentication & Image Uploads**
- JWT
- bcryptjs
- Multer
- Cloudinary

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SekhAman/BlogSpace.git
cd BlogSpace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=your_frontend_url
```

Replace the placeholder values with your own credentials.

### 4. Start the backend

```bash
npm start
```

### 5. Run the frontend

Open the frontend files inside the `Frontend` folder using a local development server, such as VS Code Live Server.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user` | Register a user |
| POST | `/user/login` | Login |
| GET | `/post` | Get all posts |
| GET | `/post/:id` | Get a single post |
| POST | `/post` | Create a post |
| PUT | `/post/:id` | Update a post |
| PATCH | `/post/:id` | Partially update a post |
| DELETE | `/post/:id` | Delete a post |

**Note:** Creating, updating, and deleting posts require JWT authentication. Creating a post supports an optional image upload using the `image` field.

## Project Structure

```text
BlogSpace/
│
├── Frontend/
│   └── Frontend files
│
├── middleware/
│   └── auth.js
│
├── module/
│   ├── user.js
│   └── post.js
│
├── index.js
├── package.json
├── package-lock.json
└── .gitignore
```

## Author

**Aman**

[GitHub](https://github.com/SekhAman)
