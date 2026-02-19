import nodemailer from "nodemailer";

const createTransporter = () => {
    // If Brevo credentials exist → use Brevo (Production)
    if (process.env.BREVO_USER && process.env.BREVO_PASS) {
        return nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_USER,
                pass: process.env.BREVO_PASS,
            },
        });
    }

    // Otherwise fallback to Gmail (Local)
    return nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"ChatFlow" <${process.env.BREVO_USER || process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Send Email Error:", error);
        throw error;
    }
};

export default sendEmail;
