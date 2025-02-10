import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SISENSE_SECRET = process.env.SISENSE_SECRET || 'your_sisense_secret';
const SISENSE_URL = process.env.SISENSE_URL || 'https://your-sisense-instance.com';

interface LoginRequest {
    username: string;
    email: string;
    tenant?: string;
}

app.post('/sso-token', (req, res) => {
    const { username, email, tenant }: LoginRequest = req.body;

    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
    }

    // Payload for the Sisense JWT
    const payload: any = {
        iat: Math.floor(Date.now() / 1000), // Issued At
        exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
        username,
        email,
    };

    if (tenant) {
        payload.tenant = tenant; // Include tenant ID if provided
    }

    try {
        const token = jwt.sign(payload, SISENSE_SECRET, { algorithm: 'HS256' });
        res.json({
            sisenseUrl: `${SISENSE_URL}/api/v1/authentication/loginByToken?jwt=${token}`,
            token,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
