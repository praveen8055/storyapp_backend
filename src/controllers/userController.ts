import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface TokenPayload {
  id: string;
}

interface UserWithPassword {
    id: string;
    email: string;
    password: string;
    name: string | null;
    username: string;
}

//create token
const createToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string);
}

//login user
const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                username: true
            }
        }) as UserWithPassword | null;

        if (!user) {
            res.json({ success: false, message: "User does not exist" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

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
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error logging in" });
    }
}

//register user
const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, username } = req.body;

        // Validattion of required fields
        if (!email || !password || !username|| !name) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }

        // Check if user exists by email
        const existingEmail = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingEmail) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }

        // Check if username is taken
        const existingUsername = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (existingUsername) {
            res.status(400).json({ success: false, message: "Username already taken" });
            return;
        }

        // Validate email and password
        if (!validator.isEmail(email)) {
            res.status(400).json({ success: false, message: "Please enter a valid email" });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await prisma.user.create({
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

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Error registering user" });
    }
};

export { loginUser, registerUser };