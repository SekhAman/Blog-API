const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./module/user");
const auth = require("./middleware/auth");
const Post = require("./module/post");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://127.0.0.1:5000"
}));

app.use(express.json());

app.post("/user", async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validation
        if (!username) {
            return res.status(400).send({
                message: "Username is required"
            });
        }

        if (!password) {
            return res.status(400).send({
                message: "Password is required"
            });
        }

        if (password.length < 8) {
            return res.status(400).send({
                message: "Password must be at least 8 characters long"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Hide password
        const { password: savedPassword, ...userWithoutPassword } =
            user.toObject();

        res.status(201).json(userWithoutPassword);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


app.post("/user/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await User.findOne({ username })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


app.post("/post", auth, async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).send({
                message: "Post title is required"
            });
        }

        const post = new Post({
            title: req.body.title,
            description: req.body.description,
            author: req.user.id
        });

        await post.save();

        res.status(201).send(post);

    } catch (error) {
        res.status(500).send({
            message: "Internal server error"
        });
    }
});

app.get("/post", async (req, res) => {
    try {
        const filter = {};

        // Search
        if (req.query.search !== undefined) {
            const search = req.query.search.trim();

            if (search) {
                const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                filter.$or = [
                    { title: { $regex: safeSearch, $options: "i" } },
                    { description: { $regex: safeSearch, $options: "i" } }
                ];
            }
        }

        // Validate page
        if (
            req.query.page !== undefined &&
            (!Number.isInteger(Number(req.query.page)) ||
                Number(req.query.page) < 1)
        ) {
            return res.status(400).send("Page must be a positive integer");
        }

        // Validate limit
        if (
            req.query.limit !== undefined &&
            (!Number.isInteger(Number(req.query.limit)) ||
                Number(req.query.limit) < 1)
        ) {
            return res.status(400).send("Limit must be a positive integer");
        }

        const page = Number(req.query.page) || 1;
        const requestedLimit = Number(req.query.limit) || 10;
        const limit = Math.min(requestedLimit, 100);

        const skip = (page - 1) * limit;

        // Fetch posts
        const posts = await Post.find(filter)
            .populate("author", "username email")
            .skip(skip)
            .limit(limit);

        // Count matching posts
        const total = await Post.countDocuments(filter);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            posts,
            total,
            totalPages,
            currentPage: page,
            limit
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get("/post/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid post ID");
        }

        const post = await Post.findById(id)
            .populate("author", "username email");

        if (!post) {
            return res.status(404).send("Post not found");
        }

        res.send(post);

    } catch (error) {
        res.status(500).send({
            message: "Internal server error"
        });
    }
});

app.put("/post/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid post ID");
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Check post ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).send("Access denied");
        }

        // Update allowed fields only
        if (req.body.title !== undefined) {
            post.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            post.description = req.body.description;
        }

        await post.save();

        res.send(post);

    } catch (error) {
        res.status(500).send({
            message: "Internal server error"
        });
    }
});

app.delete("/post/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid post ID");
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Check post ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).send("Access denied");
        }


        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "Internal server error"
        });
    }
});

app.patch("/post/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid post ID");
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Check post ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).send("Access denied");
        }

        if (!req.body.title && !req.body.description) {
            return res.status(400).send("Nothing given to be changed.")
        }

        if (req.body.title) {
            post.title = req.body.title
        }

        if (req.body.description) {
            post.description = req.body.description
        }

        await post.save();

        res.status(200).send(post);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" })
    }
});


app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});


