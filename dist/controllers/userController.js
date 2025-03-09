"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
//create token
const createToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET);
};
//login user
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                username: true
            }
        });
        if (!user) {
            res.json({ success: false, message: "User does not exist" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.json({ success: false, message: "Invalid credentials" });
            return;
        }
        const token = createToken(user.id);
        res.json({
            success: true,
            message: "User logged in",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        });
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error logging in" });
    }
});
exports.loginUser = loginUser;
//register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, username } = req.body;
        // Validate required fields
        if (!email || !password || !username || !name) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }
        // Check if user exists by email
        const existingEmail = yield prisma.user.findUnique({
            where: {
                email
            }
        });
        if (existingEmail) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }
        // Check if username is taken
        const existingUsername = yield prisma.user.findUnique({
            where: {
                username
            }
        });
        if (existingUsername) {
            res.status(400).json({ success: false, message: "Username already taken" });
            return;
        }
        // Validate email and password
        if (!validator_1.default.isEmail(email)) {
            res.status(400).json({ success: false, message: "Please enter a valid email" });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create new user
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                username
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true
            }
        });
        const token = createToken(user.id);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Error registering user" });
    }
});
exports.registerUser = registerUser;
