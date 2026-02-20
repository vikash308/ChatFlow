import axios from "axios";

const sendEmail = async (to, subject, text) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "ChatFlow",
                    email: process.env.BREVO_SENDER,
                },
                to: [
                    {
                        email: to,
                    },
                ],
                subject: subject,
                textContent: text,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
            }
        );

        console.log("Email sent:", response.data);
    } catch (error) {
        console.error(
            "Brevo API Error:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export default sendEmail;