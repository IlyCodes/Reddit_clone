import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config.js';

export default async function (req, res, next) {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			console.log("No token received.");
			return res.status(401).json({ message: 'No token, authorization denied' });
		}

		console.log("Extracted Token:", token);

		const decoded = jwt.verify(token, JWT_SECRET);

		console.log("Decoded Token:", decoded);

		const user = await User.findById(decoded.user.id);

		if (!user) {
			console.log("User not found.");
			return res.status(401).json({ message: 'Token is not valid' });
		}

		const isValidToken = user.tokens.some(t => t.token === token);

		if (!isValidToken) {
			console.log("Token is not found in user tokens.");
			return res.status(401).json({ message: 'Token is not valid' });
		}

		req.user = decoded.user;
		req.token = token;
		next();
	} catch (err) {
		console.error("Auth Middleware Error:", err.message);
		res.status(401).json({ message: 'Token is not valid' });
	}
}
