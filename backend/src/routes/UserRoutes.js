import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import { JWT_SECRET } from "../config.js";

const router = Router();

// register user
router.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const userExist = await User.findOne({ $or: [{ email }, { username }] });

		if (userExist) {
			return res.status(400).json({ error: "Username or email already exists!" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ username, email, password: hashedPassword });

		const token = jwt.sign(
			{ user: { id: newUser._id } },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);

		newUser.tokens.push({ token });
		await newUser.save();

		res.status(201).json({
			message: "User registered successfully",
			user: {
				_id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			},
			token
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// login user
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const token = jwt.sign(
			{ user: { id: user._id } },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);

		user.tokens.push({ token });
		await user.save();

		res.json({
			user: {
				_id: user._id,
				username: user.username,
				email: user.email,
			},
			token
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// logout user
router.post("/logout", auth, async (req, res) => {
	try {
		const token = req.token;
		const user = await User.findById(req.user.id);

		user.tokens = user.tokens.filter((t) => t.token !== token);
		await user.save();

		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// current user info
router.get("/me", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");

		if (!user) return res.status(404).json({ error: "User not found" });

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get user by username
router.get("/username/:username", async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username }).select("-password");

		if (!user) return res.status(404).json({ error: "User not found" });

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export default router;